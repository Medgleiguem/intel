# ai_engine.py
import json
from difflib import SequenceMatcher
from gpt4all import GPT4All

# -----------------------------
# CONFIG
# -----------------------------
MODEL_PATH = "models/ggml-alpaca-7b-q4.bin"  # <-- Updated model
QA_FILE = "data/qa_base.json"

# -----------------------------
# LOAD Q&A BASE
# -----------------------------
try:
    with open(QA_FILE, "r", encoding="utf-8") as f:
        QA_BASE = json.load(f)
    print(f"✅ Loaded {len(QA_BASE)} Q&A entries from {QA_FILE}")
except Exception as e:
    print(f"❌ Failed to load {QA_FILE}: {e}")
    QA_BASE = []

# -----------------------------
# INIT GPT4All MODEL
# -----------------------------
try:
    GPT_MODEL = GPT4All(MODEL_PATH)
    print(f"✅ GPT4All Alpaca 7B model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Failed to load GPT4All Alpaca 7B model: {e}")
    GPT_MODEL = None

# -----------------------------
# HELPER FUNCTION TO FIND BEST MATCH
# -----------------------------
def get_best_qa_match(question):
    best_ratio = 0
    best_answer = None
    for item in QA_BASE:
        ratio = SequenceMatcher(None, question.lower(), item.get("question", "").lower()).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_answer = item
    return best_answer, best_ratio

# -----------------------------
# MAIN FUNCTION TO ANSWER QUESTIONS
# -----------------------------
def ai_answer(question, lang="fr"):
    """
    Returns an answer for the given question.
    First searches local Q&A, then falls back to GPT4All Alpaca 7B.
    """
    # 1️⃣ Try local Q&A
    best_match, ratio = get_best_qa_match(question)
    if best_match and ratio > 0.5:  # threshold to consider it a match
        return {
            "answer": best_match.get("answer_fr") if lang=="fr" else best_match.get("answer_ar"),
            "source": "local_QA",
            "similarity": ratio
        }

    # 2️⃣ Fallback to GPT4All Alpaca
    if GPT_MODEL:
        try:
            response = GPT_MODEL.generate(question, max_tokens=150)
            return {
                "answer": response,
                "source": "GPT4All_Alpaca",
                "similarity": ratio
            }
        except Exception as e:
            return {
                "answer": f"❌ Failed to generate response: {e}",
                "source": "error"
            }

    return {
        "answer": "❌ No answer available",
        "source": "none"
    }