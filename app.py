from flask import Flask, request, jsonify
from flask_cors import CORS  # <--- Import CORS
from ai_engine import ai_answer

app = Flask(__name__)
CORS(app)  # <--- Enable CORS for all routes

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question")
    lang = data.get("lang", "fr")
    result = ai_answer(question, lang)
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5000)