# Agent 4: Writer agent responsible for drafting legal documents or reports.

import json
import sys
import os
from datetime import date

# Allow imports from the project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.nova_client import call_nova


# Default result returned on any failure
_EMPTY_RESULT = {
    "appeal_letter": "",
    "rti_application": "",
    "next_steps": [],
}


def generate_appeal(parsed_data: dict, law: dict, contradiction: dict) -> dict:
    """
    Generates a formal appeal letter and RTI application when a legal
    contradiction has been detected in the government's rejection.

    Args:
        parsed_data:   Structured dict from Agent 1 (parse_documents).
        law:           Law dictionary from Agent 2 (find_applicable_law).
        contradiction: Analysis dict from Agent 3 (detect_contradiction).

    Returns:
        A dictionary with the keys:
            appeal_letter    – full text of the formal appeal letter
            rti_application  – full text of the RTI application
            next_steps       – list of 3 practical steps for the citizen

        If no contradiction was found, returns a dict with a 'message' key
        explaining that no appeal is necessary.
        Returns the empty default dict on any processing failure.
    """
    # Guard: only draft documents if a contradiction was actually found
    if not contradiction.get("contradiction_found", False):
        return {
            "message": (
                "No legal contradiction was found in the rejection. "
                "The department's decision appears to be procedurally consistent "
                "with the applicable law. No appeal letter has been generated."
            )
        }

    # Gather inputs
    application_type    = parsed_data.get("application_type", "Application")
    department          = parsed_data.get("department", "the concerned department")
    rejection_reason    = parsed_data.get("rejection_reason", "Not specified")
    documents_submitted = parsed_data.get("documents_submitted", [])
    key_dates           = parsed_data.get("key_dates", [])

    # Resolve applicant name — use extracted value or safe fallback
    applicant_name = (
        parsed_data.get("applicant_name")
        or parsed_data.get("applicant")
        or parsed_data.get("name")
        or "The Applicant"
    )

    # Infer city from department string, default to Bengaluru
    _dept_lower = department.lower()
    if "bengaluru" in _dept_lower or "bbmp" in _dept_lower or "bda" in _dept_lower:
        city = "Bengaluru"
    elif "mumbai" in _dept_lower:
        city = "Mumbai"
    elif "delhi" in _dept_lower:
        city = "New Delhi"
    elif "chennai" in _dept_lower:
        city = "Chennai"
    elif "hyderabad" in _dept_lower:
        city = "Hyderabad"
    elif "pune" in _dept_lower:
        city = "Pune"
    else:
        city = "Bengaluru"  # default

    # Resolve reference number
    ref_number = (
        parsed_data.get("reference_number")
        or parsed_data.get("application_id")
        or parsed_data.get("ref_no")
        or ""
    )
    ref_line = f"(Ref: {ref_number})" if ref_number else ""

    law_name           = law.get("name", "applicable law")
    law_full_text      = law.get("full_text", "")

    explanation        = contradiction.get("explanation", "")
    violated_clause    = contradiction.get("violated_clause", "")
    score              = contradiction.get("procedural_consistency_score", 0)
    strength           = contradiction.get("strength", "weak")

    docs_str  = "\n".join(f"  - {d}" for d in documents_submitted) or "  (none listed)"
    dates_str = "\n".join(f"  - {d}" for d in key_dates) or "  (none listed)"
    today     = date.today().strftime("%d %B %Y")

    prompt = f"""
You are an expert Indian legal aid assistant helping a citizen challenge an unlawful government rejection.

The following application was rejected and a legal contradiction has been identified.
Draft two formal legal documents and a list of next steps for the citizen.

--- CASE DETAILS ---
Application Type       : {application_type}
Government Department  : {department}
Rejection Reason       : {rejection_reason}
Documents Submitted    : 
{docs_str}
Key Dates              :
{dates_str}

--- APPLICABLE LAW ---
Law Name        : {law_name}
Full Text       : {law_full_text}
Violated Clause : {violated_clause}

--- CONTRADICTION ANALYSIS ---
Contradiction Found            : Yes
Procedural Consistency Score   : {score}/100
Contradiction Strength         : {strength}
Explanation                    : {explanation}

--- YOUR TASK ---
Write the following two documents and one list.

CRITICAL RULES — read carefully before writing:
1. The appeal letter MUST be a clean, professional legal document. No internal notes, no analysis commentary,
   no meta-text about the AI system, no phrases like "contradiction explanation" or "verbatim" or "analysis shows".
2. All placeholders MUST be filled with real values — do NOT leave any square-bracket text in the output:
   - Applicant name  : use "{applicant_name}" (already resolved)
   - Date            : use "{today}"
   - Reference       : use "{ref_line}" — if empty, omit the reference line entirely
   - City            : use "{city}"
3. Keep DOCUMENT 1 under 300 words. Write as a lawyer would — formal, concise, factual.
4. State the legal ground and the specific violated clause by name. Do not speculate beyond the facts.
5. Never reveal that an AI system produced this letter.

DOCUMENT 1 – Formal Appeal Letter to the {department}:
- Opening: date ({today}) and sender address in {city}
- Addressee: "The Head / Commissioner, {department}"
- Subject line citing the application type and reference {ref_line}
- One paragraph summarising the application and the rejection reason
- One paragraph citing {law_name} and specifically how clause "{violated_clause}" makes the rejection unlawful
- One paragraph formally requesting reconsideration within the statutory period
- Closing paragraph notifying of RTI / legal escalation if not resolved in 30 days
- Sign-off: "{applicant_name}, {city}, {today}"

DOCUMENT 2 – RTI Application under the Right to Information Act 2005:
- Address it to the Public Information Officer (PIO) of the {department}
- Request the specific file-noting, internal communications, and officer's name responsible for the rejection
- Request a copy of the checklist used to evaluate the application
- Request reasons in writing citing specific rules
- State the 30-day response deadline under RTI Act

DOCUMENT 3 – Next Steps (3 practical actions for the citizen):

You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no extra text.

Required JSON keys:
- "appeal_letter"    : the complete, ready-to-use formal appeal letter as a single string
- "rti_application"  : the complete, ready-to-use RTI application as a single string
- "next_steps"       : a JSON array of exactly 3 actionable strings advising the citizen on what to do next

Respond with ONLY the JSON object.
"""

    try:
        raw_response = call_nova(prompt)

        # Strip accidental markdown fences
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()

        result = json.loads(cleaned)

        # Ensure all expected keys are present
        for key in _EMPTY_RESULT:
            if key not in result:
                result[key] = _EMPTY_RESULT[key]

        # Ensure next_steps is a list
        if not isinstance(result["next_steps"], list):
            result["next_steps"] = [str(result["next_steps"])]

        return result

    except json.JSONDecodeError as e:
        print(f"[agent4_writer] JSON parse error: {e}")
        print(f"[agent4_writer] Raw Nova response: {raw_response!r}")
        return dict(_EMPTY_RESULT)
    except Exception as e:
        print(f"[agent4_writer] Unexpected error: {e}")
        return dict(_EMPTY_RESULT)
