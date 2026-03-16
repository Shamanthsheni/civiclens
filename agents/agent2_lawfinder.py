# Agent 2: Law finder agent responsible for retrieving relevant laws and statutes.

import sys
import os

# Allow imports from the project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.nova_client import call_nova
from laws.law_database import LAWS


# All valid law keys the model may choose from
_VALID_KEYS = {"building_permit", "shop_license", "pm_kisan", "passport", "rti"}
_DEFAULT_KEY = "building_permit"


def find_applicable_law(parsed_data: dict) -> dict:
    """
    Uses Amazon Nova to identify which law in the LAWS database applies to the
    case described in parsed_data, then returns the full law dictionary.

    If no hardcoded key matches, makes a second Nova call to research the
    governing Indian law directly, enabling CivicLens to handle case types
    beyond the 5 hardcoded laws.

    Args:
        parsed_data: The structured dictionary produced by Agent 1 (parse_documents).
                     Expected keys: application_type, department (at minimum).

    Returns:
        The matching law dictionary from LAWS, a Nova-researched law dict for
        unknown case types, or the 'building_permit' entry as a last resort.
    """
    application_type = parsed_data.get("application_type", "Unknown")
    department = parsed_data.get("department", "Unknown")

    prompt = f"""
You are a legal classification assistant for Indian government applications.

Given the following case details, identify which ONE law key from the list below applies best.

Application Type : {application_type}
Government Department : {department}

Available law keys (choose EXACTLY one, respond with ONLY the key, no punctuation, no explanation):
- building_permit   → Municipal building plan approvals, construction permits, DCR regulations
- shop_license      → Shop and establishment licences, trade licences
- pm_kisan          → PM-KISAN farmer income support scheme
- passport          → Passport applications and renewals
- rti               → Right to Information requests

Respond with ONLY one of these exact strings:
building_permit | shop_license | pm_kisan | passport | rti
"""

    try:
        raw = call_nova(prompt).strip().lower()

        # Extract only the first recognised key from the response
        matched_key = None
        for key in _VALID_KEYS:
            if key in raw:
                matched_key = key
                break

        if matched_key and matched_key in LAWS:
            print(f"[agent2_lawfinder] Matched law key: '{matched_key}'")
            return LAWS[matched_key]

        # ── No hardcoded key matched — ask Nova to research the law directly ──
        print(
            f"[agent2_lawfinder] No valid key in response '{raw}'. "
            "Attempting Nova legal-research fallback..."
        )
        return _research_law_via_nova(application_type, department)

    except Exception as e:
        print(f"[agent2_lawfinder] Error in classification call: {e}. Attempting research fallback.")
        return _research_law_via_nova(application_type, department)


def _research_law_via_nova(application_type: str, department: str) -> dict:
    """
    Makes a second Nova call to research the governing Indian law for any
    application type not covered by the hardcoded LAWS database.

    Returns a law dictionary with the same shape as LAWS entries, or the
    default building_permit law if this call also fails.
    """
    research_prompt = (
        f"You are a legal research assistant. Search your knowledge for the governing "
        f"Indian law or regulation for this type of application: {application_type} "
        f"handled by {department}. Return a JSON object with these exact keys: "
        f"name, department, required_documents (list), valid_rejection_grounds (list), "
        f"full_text. Be specific and accurate. Return only JSON."
    )

    try:
        import json
        import re

        raw = call_nova(research_prompt).strip()

        # Strip markdown fences if present
        raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
        raw = re.sub(r"\s*```$", "", raw)

        law = json.loads(raw)

        # Validate required keys are present
        required_keys = {
            "name", "department", "required_documents",
            "valid_rejection_grounds", "full_text"
        }
        if not required_keys.issubset(law.keys()):
            missing = required_keys - law.keys()
            raise ValueError(f"Missing keys in Nova research response: {missing}")

        print(
            f"[agent2_lawfinder] Nova research succeeded: '{law.get('name', 'unknown law')}'"
        )
        return law

    except Exception as e:
        print(f"[agent2_lawfinder] Nova research fallback failed: {e}. Using default law.")
        return LAWS[_DEFAULT_KEY]
