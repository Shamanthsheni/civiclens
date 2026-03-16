# Main entry point for the CivicLens multi-agent application.

import os
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Agent and utility imports
from utils.nova_client import call_nova
from utils.document_reader import extract_text_from_file
from agents.agent1_parser import parse_documents
from agents.agent2_lawfinder import find_applicable_law
from agents.agent3_detector import detect_contradiction
from agents.agent4_writer import generate_appeal

load_dotenv()

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/", methods=["GET"])
def health_check():
    """Simple health-check endpoint."""
    return "CivicLens is running", 200


@app.route("/test", methods=["POST"])
def test_nova():
    """
    Accepts a JSON body with a 'prompt' field, forwards it to Nova,
    and returns the model response as JSON.

    Example request body:
        {"prompt": "Explain DCR Rule 15 in simple terms."}
    """
    data = request.get_json(silent=True)

    if not data or "prompt" not in data:
        return jsonify({"error": "Request body must include a 'prompt' field."}), 400

    prompt = data["prompt"]
    result = call_nova(prompt)
    return jsonify({"response": result}), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Accepts two uploaded files (multipart/form-data):
      - rejection_letter : the government rejection order (PDF or image)
      - application_doc  : the applicant's original application (PDF or image)

    Runs the full 4-agent pipeline and returns a combined JSON result.
    """
    try:
        # ── Validate uploads ────────────────────────────────────────────────
        if "rejection_letter" not in request.files or "application_doc" not in request.files:
            return jsonify({
                "error": "Both 'rejection_letter' and 'application_doc' files are required."
            }), 400

        rejection_file   = request.files["rejection_letter"]
        application_file = request.files["application_doc"]

        # ── Ensure uploads/ folder exists ────────────────────────────────────
        uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        # ── Save files to disk ───────────────────────────────────────────────
        rejection_path   = os.path.join(uploads_dir, secure_filename(rejection_file.filename))
        application_path = os.path.join(uploads_dir, secure_filename(application_file.filename))

        rejection_file.save(rejection_path)
        application_file.save(application_path)

        # ── Agent 0: Extract text from files ─────────────────────────────────
        rejection_text   = extract_text_from_file(rejection_path)
        application_text = extract_text_from_file(application_path)

        # ── Agent 1: Parse documents ──────────────────────────────────────────
        parsed_data = parse_documents(rejection_text, application_text)

        # ── Agent 2: Find applicable law ──────────────────────────────────────
        law_found = find_applicable_law(parsed_data)

        # ── Agent 3: Detect contradiction ─────────────────────────────────────
        contradiction = detect_contradiction(parsed_data, law_found)

        # ── Agent 4: Generate appeal documents ────────────────────────────────
        appeal = generate_appeal(parsed_data, law_found, contradiction)

        return jsonify({
            "parsed_data":   parsed_data,
            "law_found":     law_found,
            "contradiction": contradiction,
            "appeal":        appeal,
        }), 200

    except Exception as e:
        print(f"[/analyze] Unexpected error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    """
    Accepts a JSON body with:
      - message : the citizen's question string
      - context : the full analysis result dict from a previous /analyze call

    Builds a CivicLens-persona prompt and returns Nova's reply as JSON.
    """
    data = request.get_json(silent=True)

    if not data or "message" not in data:
        return jsonify({"error": "Request body must include a 'message' field."}), 400

    message = data.get("message", "").strip()
    context = data.get("context", {})

    if not message:
        return jsonify({"error": "'message' field cannot be empty."}), 400

    # Serialise context to a compact JSON string for the prompt
    try:
        context_str = json.dumps(context, indent=2) if context else "No analysis context provided."
    except Exception:
        context_str = str(context)

    prompt = (
        f"You are CivicLens, a helpful civic legal assistant. "
        f"A citizen just received this analysis of their government rejection case:\n\n"
        f"{context_str}\n\n"
        f"Answer their question clearly and simply in 2-3 sentences. "
        f"Never give definitive legal advice. "
        f"Always suggest consulting a legal professional for complex matters.\n\n"
        f"Question: {message}"
    )

    try:
        reply = call_nova(prompt)
        return jsonify({"reply": reply.strip()}), 200
    except Exception as e:
        print(f"[/chat] Nova error: {e}")
        return jsonify({"error": "Chat service temporarily unavailable. Please try again."}), 502


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
