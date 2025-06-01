# backend/api.py

import os
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__)
CORS(app)

# ──────────────────────────────────────────────────────
# 1) Load your Llama API key from environment
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY")
if not LLAMA_API_KEY:
    raise EnvironmentError("Please set LLAMA_API_KEY in your environment before running.")

client = openai.OpenAI(
    api_key=LLAMA_API_KEY,
    base_url="https://api.llama.com/compat/v1/"
)

def filter_by_quarter(full_text: str, quarter: str) -> str:
    """
    Keep only lines starting with the specified quarter (e.g. 'Q1 ').
    If quarter == 'Full Game', return the entire transcript.
    """
    if quarter == "Full Game":
        return full_text

    lines = full_text.splitlines()
    filtered = []
    prefix = quarter + " "
    next_prefix = {"Q1": "Q2 ", "Q2": "Q3 ", "Q3": "Q4 ", "Q4": None}[quarter]

    for line in lines:
        if line.startswith(prefix):
            filtered.append(line)
        elif next_prefix and line.startswith(next_prefix):
            break

    return "\n".join(filtered)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json() or {}

    # 2) Read inputs from JSON
    court_b64 = data.get("court_b64", "")
    transcript = data.get("transcript", "").strip()
    quarter = data.get("quarter", "Full Game")

    # 3) Validate inputs (no Whisper fallback)
    if not court_b64:
        return jsonify({"error": "Missing 'court_b64' (Base64‐encoded image)."}), 400
    if not transcript:
        return jsonify({"error": "Missing transcript (video upload disabled)."}), 400

    # 4) Filter the transcript to only the chosen quarter
    quarter_transcript = filter_by_quarter(transcript, quarter)
    if not quarter_transcript.strip():
        return jsonify({"error": f"No play‐by‐play lines found for {quarter}."}), 400

    # 5) Build the Llama call messages (same as your CLI script)
    system_message = {
        "role": "developer",
        "content": (
            "You are a veteran basketball coach who can see both text and images. "
            f"Focus on {quarter} only. Identify the exact spot on the court where the most "
            "momentum-shifting 3-pointer occurred. Format: "
            "Location on court — Quarter, Time, Player, Description."
        )
    }
    image_message = {"role": "user", "content": court_b64}
    transcript_message = {"role": "user", "content": quarter_transcript}
    messages = [system_message, image_message, transcript_message]

    # 6) Call the Llama API
    try:
        response = client.chat.completions.create(
            model="Llama-4-Scout-17B-16E-Instruct-FP8",
            messages=messages,
            max_tokens=512,
            temperature=0.0
        )
        result_text = response.choices[0].message.content
        return jsonify({"result": result_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # If you run `python api.py`, this starts Flask on port 5000
    app.run(host="0.0.0.0", port=5000, debug=True)
