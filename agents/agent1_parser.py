# Agent 1: Parser agent responsible for parsing initial input documents or data.

import json
import sys
import os

# Allow imports from the project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.nova_client import call_nova


# Default structure returned on failure
_EMPTY_RESULT = {
    "application_type": "",
    "department": "",
    "rejection_reason": "",
    "documents_submitted": [],
    "key_dates": [],
}


def parse_documents(rejection_text: str, application_text: str) -> dict:
    """
    Uses Amazon Nova to extract structured information from a rejection letter
    and the original application document.

    Args:
        rejection_text:  Full text of the rejection letter / order.
        application_text: Full text of the original application or supporting docs.

    Returns:
        A dictionary with the keys:
            application_type      – type of application (e.g. 'Building Permit')
            department            – issuing government department
            rejection_reason      – primary stated reason for rejection
            documents_submitted   – list of documents the applicant submitted
            key_dates             – list of important dates mentioned (as strings)

        Returns the empty default dictionary on any failure.
    """
    prompt = f"""
You are a legal document analyst. You will be given two documents:
1. A government rejection letter
2. The applicant's original application or supporting documents

Your task is to carefully read both documents and extract the following information.
You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no extra text.

Required JSON keys:
- "application_type"    : The type of application (e.g. "Building Permit", "Trade Licence")
- "department"          : The name of the government department that issued the rejection
- "rejection_reason"    : The primary reason stated for rejecting the application
- "documents_submitted" : A JSON array of document names/descriptions submitted by the applicant
- "key_dates"           : A JSON array of important dates mentioned in the documents (as strings)

--- REJECTION LETTER ---
{rejection_text}

--- APPLICATION / SUPPORTING DOCUMENTS ---
{application_text}

Respond with ONLY the JSON object.
"""

    try:
        raw_response = call_nova(prompt)

        # Strip any accidental markdown fences (```json ... ```)
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

        return result

    except json.JSONDecodeError as e:
        print(f"[agent1_parser] JSON parse error: {e}")
        print(f"[agent1_parser] Raw Nova response was: {raw_response!r}")
        return dict(_EMPTY_RESULT)
    except Exception as e:
        print(f"[agent1_parser] Unexpected error: {e}")
        return dict(_EMPTY_RESULT)
