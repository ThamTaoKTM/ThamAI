from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os, logging

load_dotenv()
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

# Check key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("Missing OPENAI_API_KEY")

client = OpenAI(api_key=api_key)


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        msg = data.get("message", "").strip()

        if not msg:
            return jsonify({"reply": "Empty message"}), 400

        # -------------------------
        # Call OpenAI Responses API
        # -------------------------
        res = client.responses.create(
            model="gpt-4o-mini",
            input=[
                {"role": "system", "content": "Bạn là ThamAI"},
                {"role": "user", "content": msg}
            ],
            temperature=0.8
        )

        # Safe extract
        reply = res.output_text.strip()

        return jsonify({"reply": reply})

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "Server error", "detail": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return {"status": "ThamAI_v3 backend đang hoạt động"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
