# ai_engine.py
import json
from difflib import SequenceMatcher

# -----------------------------
# CONFIG
# -----------------------------
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
# HELPER FUNCTION TO FIND BEST MATCH
# -----------------------------
def get_best_qa_match(question, lang="fr"):
    """Find best matching Q&A from the database"""
    best_ratio = 0
    best_answer = None
    
    for item in QA_BASE:
        # Match against the appropriate language question
        qa_question = item.get("question_fr", "") if lang == "fr" else item.get("question_ar", "")
        ratio = SequenceMatcher(None, question.lower(), qa_question.lower()).ratio()
        
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
    Searches local Q&A database with improved matching.
    """
    # Try local Q&A with a reasonable threshold
    best_match, ratio = get_best_qa_match(question, lang)
    
    if best_match and ratio > 0.5:  # 50% similarity threshold
        answer_text = best_match.get("answer_fr") if lang == "fr" else best_match.get("answer_ar")
        return {
            "answer": answer_text,
            "source": "local_QA",
            "similarity": round(ratio, 2),
            "confidence": "high" if ratio > 0.7 else "medium"
        }
    
    # No good match found
    fallback_msg = (
        "Désolé, je n'ai pas trouvé de réponse précise à votre question. "
        "Veuillez reformuler ou contacter le service concerné."
    ) if lang == "fr" else (
        "عذراً، لم أجد إجابة دقيقة على سؤالك. "
        "يرجى إعادة صياغة السؤال أو الاتصال بالخدمة المعنية."
    )
    
    return {
        "answer": fallback_msg,
        "source": "fallback",
        "similarity": round(ratio, 2) if ratio else 0,
        "confidence": "low"
    }