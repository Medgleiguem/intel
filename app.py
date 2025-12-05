import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ai_engine import ai_answer

app = Flask(__name__, static_folder='templates')
CORS(app)

@app.route("/")
def index():
    """Serve the main HTML page"""
    return send_from_directory('templates', 'index.html')

@app.route("/ask", methods=["POST"])
def ask():
    """Handle AI question endpoint"""
    try:
        data = request.json
        question = data.get("question", "").strip()
        lang = data.get("lang", "fr")
        
        if not question:
            return jsonify({
                "error": "Question cannot be empty",
                "answer": "Veuillez poser une question." if lang == "fr" else "يرجى طرح سؤال."
            }), 400
        
        result = ai_answer(question, lang)
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in /ask endpoint: {e}")
        return jsonify({
            "error": str(e),
            "answer": "Une erreur s'est produite." if lang == "fr" else "حدث خطأ."
        }), 500

@app.route("/health")
def health():
    """Health check endpoint for Render"""
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)