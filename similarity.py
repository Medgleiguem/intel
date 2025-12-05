from sentence_transformers import SentenceTransformer
import numpy as np

# Load embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def embed(text):
    return model.encode([text])[0]

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def find_best_match(user_query, database, lang="fr"):
    user_vec = embed(user_query)
    best_score = -1
    best_item = None

    for item in database:
        text = item["question"] if lang == "fr" else item["question_ar"]
        vec = embed(text)
        score = cosine_similarity(user_vec, vec)
        if score > best_score:
            best_score = score
            best_item = item

    return best_item, best_score