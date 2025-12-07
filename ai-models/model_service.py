import onnxruntime as ort
import numpy as np
import json
import time
import re
from typing import List, Dict, Any, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LightweightAIModel:
    """
    Lightweight AI model service using quantized ONNX models
    Optimized for low-resource environments
    """
    
    def __init__(self, model_path: str = "models/smollm2-135m-q4.onnx", 
                 config_path: str = "config.json"):
        """
        Initialize the AI model service
        
        Args:
            model_path: Path to the ONNX model file
            config_path: Path to the configuration file
        """
        self.model_path = model_path
        self.config_path = config_path
        self.session = None
        self.config = {}
        self.knowledge_base = {}
        self.cache = {}
        self.max_cache_size = 1000
        
        self.load_config()
        self.load_model()
        self.load_knowledge_base()
    
    def load_config(self):
        """Load configuration from JSON file"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            logger.info(f"Configuration loaded from {self.config_path}")
        except FileNotFoundError:
            logger.warning(f"Config file {self.config_path} not found, using defaults")
            self.config = self.get_default_config()
    
    def get_default_config(self) -> Dict[str, Any]:
        """Get default configuration"""
        return {
            "model": {
                "max_tokens": 512,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 50,
                "repetition_penalty": 1.1
            },
            "languages": ["fr", "ar"],
            "cache_size": 1000,
            "offline_mode": True
        }
    
    def load_model(self):
        """Load the ONNX model"""
        try:
            # Configure ONNX Runtime for minimal resource usage
            sess_options = ort.SessionOptions()
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            sess_options.optimized_model_filepath = "optimized_model.onnx"
            
            # Use CPU execution provider for compatibility
            providers = ['CPUExecutionProvider']
            
            self.session = ort.InferenceSession(self.model_path, sess_options, providers=providers)
            logger.info(f"Model loaded from {self.model_path}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def load_knowledge_base(self):
        """Load the local knowledge base for offline responses"""
        try:
            kb_path = self.config.get("knowledge_base_path", "knowledge_base.json")
            with open(kb_path, 'r', encoding='utf-8') as f:
                self.knowledge_base = json.load(f)
            logger.info(f"Knowledge base loaded from {kb_path}")
        except FileNotFoundError:
            logger.warning("Knowledge base not found, using empty base")
            self.knowledge_base = {}
    
    def generate_response(self, 
                         message: str, 
                         lang: str = "fr",
                         context: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Generate a response to the user's message
        
        Args:
            message: User's input message
            lang: Language code ('fr' or 'ar')
            context: Optional conversation context
            
        Returns:
            Dictionary containing response and metadata
        """
        try:
            # Check cache first
            cache_key = f"{message}_{lang}"
            if cache_key in self.cache:
                logger.info(f"Cache hit for key: {cache_key}")
                return self.cache[cache_key]
            
            # Preprocess message
            processed_message = self.preprocess_message(message, lang)
            
            # Check knowledge base for exact matches
            kb_response = self.check_knowledge_base(processed_message, lang)
            if kb_response:
                response = kb_response
            else:
                # Generate response using the model
                response = self.generate_ai_response(processed_message, lang, context)
            
            # Postprocess response
            final_response = self.postprocess_response(response, lang)
            
            # Cache the response
            self.add_to_cache(cache_key, final_response)
            
            return final_response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return self.get_error_response(lang)
    
    def preprocess_message(self, message: str, lang: str) -> str:
        """Preprocess the input message"""
        # Basic normalization
        message = message.strip().lower()
        
        # Remove extra whitespace
        message = ' '.join(message.split())
        
        # Language-specific preprocessing
        if lang == "ar":
            # Handle Arabic text normalization
            message = self.normalize_arabic_text(message)
        
        return message
    
    def normalize_arabic_text(self, text: str) -> str:
        """Normalize Arabic text for better processing"""
        # Remove diacritics
        arabic_diacritics = re.compile(r'[\u064B-\u065F\u0670\u0640]')
        text = arabic_diacritics.sub('', text)
        
        # Normalize Arabic characters
        text = text.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا')
        text = text.replace('ة', 'ه').replace('ي', 'ى')
        
        return text
    
    def check_knowledge_base(self, message: str, lang: str) -> Optional[Dict[str, Any]]:
        """Check if the message matches any knowledge base entries"""
        # Simple keyword matching (can be improved with embeddings)
        for category, entries in self.knowledge_base.items():
            for entry in entries:
                keywords = entry.get('keywords', [])
                if any(keyword in message for keyword in keywords):
                    return {
                        "type": "text",
                        "content": entry.get(f"answer_{lang}", entry.get("answer_fr", "Désolé, je n'ai pas de réponse.")),
                        "confidence": 0.8,
                        "source": "knowledge_base",
                        "category": category
                    }
        return None
    
    def generate_ai_response(self, message: str, lang: str, context: Optional[List[Dict[str, str]]]) -> Dict[str, Any]:
        """Generate response using the AI model"""
        try:
            # Prepare input for the model
            model_input = self.prepare_model_input(message, lang, context)
            
            # Run inference
            start_time = time.time()
            outputs = self.session.run(None, model_input)
            inference_time = time.time() - start_time
            
            # Process model outputs
            response_text = self.process_model_outputs(outputs, lang)
            
            return {
                "type": "text",
                "content": response_text,
                "confidence": 0.7,  # Placeholder confidence score
                "source": "ai_model",
                "inference_time": inference_time
            }
            
        except Exception as e:
            logger.error(f"AI model inference failed: {e}")
            return self.get_fallback_response(message, lang)
    
    def prepare_model_input(self, message: str, lang: str, context: Optional[List[Dict[str, str]]]) -> Dict[str, Any]:
        """Prepare input for the ONNX model"""
        # This is a simplified version - actual implementation would depend on the model architecture
        
        # Tokenize and encode the message
        tokens = self.tokenize(message, lang)
        input_ids = np.array([tokens], dtype=np.int64)
        
        # Create attention mask
        attention_mask = np.ones_like(input_ids)
        
        return {
            "input_ids": input_ids,
            "attention_mask": attention_mask
        }
    
    def tokenize(self, text: str, lang: str) -> List[int]:
        """Simple tokenization (replace with proper tokenizer)"""
        # This is a placeholder - use actual tokenizer for the model
        words = text.split()
        # Simple word-to-id mapping (in practice, use proper vocab)
        tokens = [hash(word) % 50000 for word in words]
        return tokens[:self.config["model"]["max_tokens"]]
    
    def process_model_outputs(self, outputs: List[np.ndarray], lang: str) -> str:
        """Process model outputs to get text response"""
        # This is simplified - actual implementation depends on model architecture
        output_ids = outputs[0]
        
        # Decode output IDs to text
        response_tokens = output_ids[0].tolist()
        response_text = self.decode_tokens(response_tokens, lang)
        
        return response_text
    
    def decode_tokens(self, tokens: List[int], lang: str) -> str:
        """Decode tokens back to text (placeholder)"""
        # Simple decoding (replace with proper detokenizer)
        words = [f"token_{token}" for token in tokens]
        return " ".join(words)
    
    def get_fallback_response(self, message: str, lang: str) -> Dict[str, Any]:
        """Get a fallback response when AI fails"""
        fallback_responses = {
            "fr": "Je suis désolé, je n'ai pas pu générer une réponse appropriée. Veuillez reformuler votre question ou consultez la section d'aide.",
            "ar": "أنا آسف، لم أتمكن من توليد استجابة مناسبة. يرجى إعادة صياغة سؤالك أو استشارة قسم المساعدة."
        }
        
        return {
            "type": "text",
            "content": fallback_responses.get(lang, fallback_responses["fr"]),
            "confidence": 0.0,
            "source": "fallback",
            "error": True
        }
    
    def postprocess_response(self, response: Dict[str, Any], lang: str) -> Dict[str, Any]:
        """Postprocess the generated response"""
        # Clean up the response text
        content = response.get("content", "")
        
        # Remove any special tokens or formatting artifacts
        content = content.replace("<pad>", "").replace("</s>", "").strip()
        
        # Ensure proper punctuation
        if content and not content.endswith(('.', '!', '?')):
            content += "."
        
        response["content"] = content
        
        # Add language-specific formatting
        if lang == "ar":
            response["rtl"] = True
        
        return response
    
    def get_error_response(self, lang: str) -> Dict[str, Any]:
        """Get a generic error response"""
        error_messages = {
            "fr": "Une erreur s'est produite. Veuillez réessayer plus tard.",
            "ar": "حدث خطأ. يرجى المحاولة مرة أخرى لاحقًا."
        }
        
        return {
            "type": "text",
            "content": error_messages.get(lang, error_messages["fr"]),
            "confidence": 0.0,
            "source": "error",
            "error": True
        }
    
    def add_to_cache(self, key: str, response: Dict[str, Any]):
        """Add response to cache with LRU eviction"""
        if len(self.cache) >= self.max_cache_size:
            # Remove oldest entry (simple FIFO)
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        
        self.cache[key] = response
    
    def get_suggestions(self, category: Optional[str] = None, lang: str = "fr") -> List[str]:
        """Get AI suggestions for a category"""
        try:
            # Get popular queries from knowledge base
            suggestions = []
            
            if category and category in self.knowledge_base:
                suggestions = [entry.get(f"question_{lang}", entry.get("question_fr", "")) 
                              for entry in self.knowledge_base[category][:5]]
            else:
                # Get general suggestions
                for category_data in self.knowledge_base.values():
                    suggestions.extend([entry.get(f"question_{lang}", entry.get("question_fr", "")) 
                                       for entry in category_data[:2]])
            
            return suggestions[:10]  # Return top 10 suggestions
            
        except Exception as e:
            logger.error(f"Error getting suggestions: {e}")
            return []
    
    def process_offline_request(self, message: str, lang: str = "fr") -> Dict[str, Any]:
        """Process request in offline mode using only local knowledge base"""
        try:
            # Only use knowledge base, no AI model
            kb_response = self.check_knowledge_base(message, lang)
            
            if kb_response:
                kb_response["source"] = "offline_knowledge_base"
                return kb_response
            
            # Return offline-specific message
            offline_messages = {
                "fr": "Mode hors ligne : Je peux vous aider avec des informations de base. Essayez des mots-clés comme 'carte identité', 'naissance', ou 'passeport'.",
                "ar": "وضع عدم الاتصال: يمكنني مساعدتك مع معلومات أساسية. جرب كلمات مفتاحية مثل 'بطاقة هوية'، 'ميلاد'، أو 'جواز سفر'."
            }
            
            return {
                "type": "text",
                "content": offline_messages.get(lang, offline_messages["fr"]),
                "confidence": 0.5,
                "source": "offline",
                "suggestions": ["Carte d'identité", "Acte de naissance", "Passeport"]
            }
            
        except Exception as e:
            logger.error(f"Error processing offline request: {e}")
            return self.get_error_response(lang)

# Global instance
ai_model = None

def init_ai_model():
    """Initialize the global AI model instance"""
    global ai_model
    try:
        ai_model = LightweightAIModel()
        logger.info("AI model initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize AI model: {e}")
        raise

def get_ai_model():
    """Get the global AI model instance"""
    global ai_model
    if ai_model is None:
        init_ai_model()
    return ai_model

# Example usage
if __name__ == "__main__":
    # Initialize model
    model = get_ai_model()
    
    # Test response generation
    test_message = "Comment obtenir une carte d'identité ?"
    response = model.generate_response(test_message, "fr")
    
    print(f"User: {test_message}")
    print(f"AI: {response['content']}")
    print(f"Confidence: {response['confidence']}")
    print(f"Source: {response['source']}")