# Agent 3: Detector agent responsible for identifying legal issues or violations.

import json
import sys
import os

# Allow imports from the project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.nova_client import call_nova


# Default result returned on any failure
_EMPTY_RESULT = {
    "contradiction_found": False,
    "explanation": "",
    "violated_clause": "",
    "procedural_consistency_score": 50,
    "strength": "weak",
    "reasoning_steps": [
        "No rejection reason could be extracted from the document.",
        "No applicable law was identified for this case type.",
        "Comparison could not be performed due to missing information.",
        "Unable to reach a conclusion — please review the documents and try again.",
    ],
}


def detect_contradiction(parsed_data: dict, law: dict) -> dict:
    """
    Analyses whether the government's rejection is procedurally consistent
    with the applicable law, using Amazon Nova as the reasoning engine.

    Args:
        parsed_data: Structured dict from Agent 1 (parse_documents). Expected keys:
                     rejection_reason, documents_submitted.
        law:         Law dictionary from Agent 2 (find_applicable_law). Expected keys:
                     required_documents, valid_rejection_grounds, full_text.

    Returns:
        A dictionary with the keys:
            contradiction_found            – bool: True if the rejection appears unlawful
            explanation                    – detailed reasoning string
            violated_clause                – specific clause or rule that was violated
            procedural_consistency_score   – int 0–100 (0 = fully inconsistent, 100 = fully consistent)
            strength                       – 'strong', 'medium', or 'weak'

        Returns the empty default dict on any failure.
    """
    rejection_reason     = parsed_data.get("rejection_reason", "Not specified")
    documents_submitted  = parsed_data.get("documents_submitted", [])
    required_documents   = law.get("required_documents", [])
    valid_grounds        = law.get("valid_rejection_grounds", [])
    law_full_text        = law.get("full_text", "")

    docs_submitted_str  = "\n".join(f"  - {d}" for d in documents_submitted) or "  (none listed)"
    required_docs_str   = "\n".join(f"  - {d}" for d in required_documents)  or "  (none listed)"
    valid_grounds_str   = "\n".join(f"  - {g}" for g in valid_grounds)        or "  (none listed)"

    prompt = f"""
You are an expert Indian legal analyst specialising in administrative and procedural law.

Your task is to determine whether a government department's rejection of an application is
PROCEDURALLY CONSISTENT or INCONSISTENT with the applicable law.

Analyse the following information carefully:

--- REJECTION REASON (as stated by the department) ---
{rejection_reason}

--- DOCUMENTS SUBMITTED BY THE APPLICANT ---
{docs_submitted_str}

--- LAW: REQUIRED DOCUMENTS ---
{required_docs_str}

--- LAW: VALID GROUNDS FOR REJECTION ---
{valid_grounds_str}

--- FULL TEXT OF APPLICABLE LAW ---
{law_full_text}

Based on the above, determine:
1. Does the rejection reason fall within the legally valid grounds for rejection?
2. Were any required documents submitted that should have prevented rejection?
3. Is there a procedural contradiction between the rejection and what the law permits?

You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no extra text.

Required JSON keys:
- "contradiction_found"           : true if the rejection appears legally inconsistent, false otherwise
- "explanation"                   : a detailed, specific explanation of your finding (2-4 sentences)
- "violated_clause"               : the specific rule, clause, or section that was violated (or "" if none)
- "procedural_consistency_score"  : integer from 0 to 100 where 0 = completely inconsistent, 100 = fully consistent
- "strength"                      : one of "strong", "medium", or "weak" indicating strength of the contradiction
- "reasoning_steps"               : a JSON array of exactly 4 strings showing your step-by-step thinking:
    [0] What the rejection letter claimed (quote the stated reason verbatim or paraphrase closely)
    [1] What the law actually requires (cite the specific rule or document requirement)
    [2] What the comparison revealed (describe the gap or agreement you found)
    [3] What conclusion was reached and why (state your final determination with brief justification)

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

        # Normalise types and ensure all keys are present
        result["contradiction_found"] = bool(result.get("contradiction_found", False))
        result["procedural_consistency_score"] = int(
            result.get("procedural_consistency_score", 50)
        )
        if result.get("strength") not in {"strong", "medium", "weak"}:
            result["strength"] = "weak"
        # Normalise reasoning_steps: must be a list of exactly 4 non-empty strings
        steps = result.get("reasoning_steps")
        if (
            not isinstance(steps, list)
            or len(steps) != 4
            or not all(isinstance(s, str) and s.strip() for s in steps)
        ):
            result["reasoning_steps"] = _EMPTY_RESULT["reasoning_steps"]
        for key in _EMPTY_RESULT:
            if key not in result:
                result[key] = _EMPTY_RESULT[key]

        return result

    except json.JSONDecodeError as e:
        print(f"[agent3_detector] JSON parse error: {e}")
        print(f"[agent3_detector] Raw Nova response: {raw_response!r}")
        return dict(_EMPTY_RESULT)
    except Exception as e:
        print(f"[agent3_detector] Unexpected error: {e}")
        return dict(_EMPTY_RESULT)
