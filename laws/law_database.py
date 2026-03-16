# Handles connections and queries to the database of laws and legal precedents.

LAWS = {
    "building_permit": {
        "name": "Development Control Regulations Rule 15",
        "department": "Municipal Corporation",
        "required_documents": [
            "Approved site plan / layout plan from the competent authority",
            "Ownership proof or title deed of the land",
            "Structural stability certificate signed by a licensed engineer",
            "No-Objection Certificate (NOC) from the Fire Department",
        ],
        "valid_rejection_grounds": [
            "Violation of Floor Space Index (FSI) or FAR limits prescribed for the zone",
            "Proposed construction falls within a restricted or heritage conservation zone",
            "Inadequate setbacks from road margins, plot boundaries, or existing structures",
            "Incomplete or inconsistent documentation submitted with the application",
        ],
        "full_text": (
            "Development Control Regulations Rule 15 governs the procedure and criteria for the "
            "approval of building plans by the Municipal Corporation in Indian cities. Under this rule, "
            "no person shall erect, re-erect, or make material alterations to any building within the "
            "municipal limits without first obtaining a building permit from the designated authority. "
            "The applicant must submit a set of prescribed documents including a site plan, structural "
            "certificate, and relevant NOCs, accompanied by the requisite fees. The authority is obligated "
            "to scrutinise the plans for compliance with the prescribed Floor Space Index, height restrictions, "
            "setback requirements, and permissible land-use as defined in the Master Plan or Zonal Development "
            "Plan. Approval must be granted or a reasoned rejection must be communicated to the applicant "
            "within sixty days of receipt of a complete application; failure to do so shall be deemed approval "
            "under the principle of deemed sanction."
        ),
    }
}
