<template>
  <div class="chat-container max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Chat Header -->
      <div class="bg-blue-600 text-white p-4">
        <h1 class="text-2xl font-bold flex items-center">
          <span class="mr-2">🤖</span>
          {{ $t("chat.title") }}
        </h1>
        <p class="text-blue-100 mt-1">
          {{ $t("chat.welcome") }}
        </p>
      </div>

      <!-- Connection Status -->
      <div
        v-if="!isOnline"
        class="bg-yellow-100 border-l-4 border-yellow-500 p-3"
      >
        <p class="text-yellow-700">{{ $t("chat.offlineMessage") }}</p>
      </div>

      <!-- Chat Messages -->
      <div
        ref="messagesContainer"
        class="messages-container h-96 overflow-y-auto p-4 bg-gray-50"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.isUser ? 'user-message' : 'bot-message']"
        >
          <div class="message-bubble">
            <div v-if="message.isBot" class="bot-avatar mb-2">
              <span class="text-2xl">🤖</span>
            </div>
            <div class="message-content">
              <p v-if="message.type === 'text'">{{ message.content }}</p>
              <div
                v-else-if="message.type === 'suggestions'"
                class="suggestions"
              >
                <h4 class="font-semibold mb-2">{{ $t("chat.suggestions") }}</h4>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="suggestion in message.content"
                    :key="suggestion"
                    @click="handleSuggestion(suggestion)"
                    class="suggestion-btn"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </div>
              <div
                v-else-if="message.type === 'procedure'"
                class="procedure-card"
              >
                <h4 class="font-semibold mb-2">{{ message.content.title }}</h4>
                <p class="text-sm text-gray-600 mb-3">
                  {{ message.content.description }}
                </p>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-500">
                    {{ $t("procedures.duration") }}:
                    {{ message.content.duration }}
                  </span>
                  <button
                    @click="startProcedure(message.content.id)"
                    class="btn-primary text-sm"
                  >
                    {{ $t("procedures.startProcedure") }}
                  </button>
                </div>
              </div>
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="bot-message">
          <div class="message-bubble">
            <div class="flex items-center">
              <div class="spinner mr-3"></div>
              <span>{{ $t("chat.thinking") }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input p-4 bg-white border-t">
        <div class="flex items-end space-x-3">
          <div class="flex-1">
            <textarea
              v-model="inputMessage"
              :placeholder="$t('chat.placeholder')"
              class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              @keydown.enter.prevent="handleSend"
              :disabled="isLoading"
            ></textarea>
          </div>
          <button
            @click="handleSend"
            :disabled="!inputMessage.trim() || isLoading"
            class="btn-primary px-6 py-3"
          >
            {{ $t("chat.send") }}
          </button>
        </div>

        <!-- Quick actions -->
        <div class="flex flex-wrap gap-2 mt-3">
          <button
            v-for="quick in quickActions"
            :key="quick"
            @click="sendQuickMessage(quick)"
            class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded-full transition-colors"
          >
            {{ quick }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "../stores/app";

export default {
  name: "Chat",
  setup() {
    const { t, locale } = useI18n();
    const route = useRoute();
    const appStore = useAppStore();

    const messages = ref([]);
    const inputMessage = ref("");
    const isLoading = ref(false);
    const messagesContainer = ref(null);

    const isOnline = ref(navigator.onLine);

    const quickActions = ref([
      "Carte d'identité",
      "Acte de naissance",
      "Inscription scolaire",
      "Passeport",
      "Permis de conduire",
    ]);

    // Initialize chat with welcome message
    onMounted(() => {
      addMessage(t("chat.welcome"), "bot", "text");

      // Check for query parameter
      if (route.query.q) {
        inputMessage.value = route.query.q;
        handleSend();
      }

      // Listen for connection changes
      window.addEventListener("online", () => (isOnline.value = true));
      window.addEventListener("offline", () => (isOnline.value = false));
    });

    const addMessage = (content, sender, type = "text") => {
      messages.value.push({
        content,
        isUser: sender === "user",
        isBot: sender === "bot",
        type,
        timestamp: new Date(),
      });

      nextTick(() => {
        scrollToBottom();
      });
    };

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    };

    const handleSend = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return;

      const userMessage = inputMessage.value.trim();
      addMessage(userMessage, "user");
      inputMessage.value = "";
      isLoading.value = true;

      try {
        if (isOnline.value) {
          // Online mode - use AI service
          const response = await getAIResponse(userMessage);
          processAIResponse(response);
        } else {
          // Offline mode - use local knowledge base
          const response = await getOfflineResponse(userMessage);
          processOfflineResponse(response);
        }
      } catch (error) {
        console.error("Error getting response:", error);
        addMessage(t("errors.networkError"), "bot");
      } finally {
        isLoading.value = false;
      }
    };

    const getAIResponse = async (message) => {
      // Simulate AI response (replace with actual AI service)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock responses based on keywords
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("carte") && lowerMessage.includes("identité")) {
        return {
          type: "procedure",
          content: {
            id: "id-card",
            title: "Demande de carte d'identité",
            description: "Obtenez votre carte d'identité nationale en ligne",
            duration: "15 minutes",
            steps: [
              "Remplir le formulaire",
              "Télécharger les documents",
              "Valider la demande",
            ],
          },
        };
      } else if (lowerMessage.includes("naissance")) {
        return {
          type: "procedure",
          content: {
            id: "birth-certificate",
            title: "Acte de naissance",
            description: "Demandez une copie de votre acte de naissance",
            duration: "10 minutes",
            steps: [
              "Saisir les informations",
              "Payer les frais",
              "Télécharger l'acte",
            ],
          },
        };
      } else if (
        lowerMessage.includes("école") ||
        lowerMessage.includes("inscription")
      ) {
        return {
          type: "suggestions",
          content: [
            "Inscription primaire",
            "Inscription secondaire",
            "Inscription universitaire",
            "Bourses scolaires",
          ],
        };
      } else {
        return {
          type: "text",
          content:
            'Je comprends que vous avez une question sur : "' +
            message +
            '". Voici quelques suggestions qui pourraient vous aider :',
        };
      }
    };

    const getOfflineResponse = async (message) => {
      // Use local knowledge base for offline responses
      await new Promise((resolve) => setTimeout(resolve, 800));

      const knowledgeBase = {
        "carte identité": {
          type: "text",
          content:
            "Pour la carte d'identité (hors ligne): 1. Préparez vos documents 2. Remplissez le formulaire papier 3. Déposez en mairie",
        },
        naissance: {
          type: "text",
          content:
            "Acte de naissance (mode hors ligne): Retrouvez votre mairie de naissance avec vos informations personnelles.",
        },
        passeport: {
          type: "text",
          content:
            "Passeport: Documents nécessaires - Photo d'identité, Justificatif de domicile, Pièce d'identité en cours de validité",
        },
      };

      const lowerMessage = message.toLowerCase();
      for (const [keyword, response] of Object.entries(knowledgeBase)) {
        if (lowerMessage.includes(keyword)) {
          return response;
        }
      }

      return {
        type: "text",
        content:
          t("chat.offlineMessage") +
          ' Je suis en mode hors ligne. Essayez des mots-clés comme "carte identité", "naissance", ou "passeport".',
      };
    };

    const processAIResponse = (response) => {
      addMessage(response.content, "bot", response.type);
    };

    const processOfflineResponse = (response) => {
      addMessage(response.content, "bot", response.type);
    };

    const handleSuggestion = (suggestion) => {
      inputMessage.value = suggestion;
      handleSend();
    };

    const sendQuickMessage = (message) => {
      inputMessage.value = message;
      handleSend();
    };

    const startProcedure = (procedureId) => {
      // Navigate to procedures page
      router.push({
        path: "/procedures",
        query: { procedure: procedureId },
      });
    };

    const formatTime = (date) => {
      return date.toLocaleTimeString(
        locale.value === "fr" ? "fr-FR" : "ar-SA",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

    return {
      messages,
      inputMessage,
      isLoading,
      isOnline,
      quickActions,
      messagesContainer,
      handleSend,
      handleSuggestion,
      sendQuickMessage,
      startProcedure,
      formatTime,
    };
  },
};
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 200px);
}

.messages-container {
  scroll-behavior: smooth;
}

.message {
  margin-bottom: 1rem;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.bot-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  position: relative;
}

.user-message .message-bubble {
  background-color: #3b82f6;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.bot-message .message-bubble {
  background-color: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 0.25rem;
}

.message-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-align: right;
}

.suggestion-btn {
  @apply px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition-colors;
}

.procedure-card {
  @apply bg-white border border-gray-200 rounded-lg p-4 shadow-sm;
}

.spinner {
  @apply w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin;
}
</style>
