<template>
  <div class="home">
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 rounded-lg mb-8"
    >
      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          {{ $t("home.welcome") }}
        </h1>
        <p class="text-xl mb-8">
          {{ $t("home.subtitle") }}
        </p>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('home.searchPlaceholder')"
              class="w-full px-6 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
              @keyup.enter="handleSearch"
            />
            <button
              @click="handleSearch"
              class="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
            >
              {{ $t("common.search") }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6 text-center">
        {{ $t("home.quickActions") }}
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard
          v-for="action in quickActions"
          :key="action.id"
          :action="action"
          @click="handleQuickAction(action)"
        />
      </div>
    </section>

    <!-- Popular Services -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6">
        {{ $t("home.popularServices") }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServiceCard
          v-for="service in popularServices"
          :key="service.id"
          :service="service"
          @click="navigateToService(service)"
        />
      </div>
    </section>

    <!-- Features -->
    <section class="bg-gray-50 py-12 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <FeatureCard
          icon="📱"
          :title="$t('common.offline')"
          :description="$t('home.offlineReady')"
        />
        <FeatureCard
          icon="🤖"
          title="AI Assistant"
          :description="$t('chat.welcome')"
        />
        <FeatureCard
          icon="🌍"
          :title="$t('common.bilingual')"
          description="Français & العربية"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "../stores/app";
import QuickActionCard from "../components/QuickActionCard.vue";
import ServiceCard from "../components/ServiceCard.vue";
import FeatureCard from "../components/FeatureCard.vue";

export default {
  name: "Home",
  components: {
    QuickActionCard,
    ServiceCard,
    FeatureCard,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const appStore = useAppStore();

    const searchQuery = ref("");

    const quickActions = ref([
      {
        id: "chat",
        icon: "💬",
        title: t("navigation.chat"),
        description: t("chat.welcome"),
        route: "/chat",
      },
      {
        id: "documents",
        icon: "📄",
        title: t("navigation.documents"),
        description: t("documents.title"),
        route: "/documents",
      },
      {
        id: "procedures",
        icon: "📋",
        title: t("navigation.procedures"),
        description: t("procedures.title"),
        route: "/procedures",
      },
      {
        id: "services",
        icon: "🏛️",
        title: t("navigation.services"),
        description: t("services.title"),
        route: "/services",
      },
    ]);

    const popularServices = ref([
      {
        id: "id-card",
        title: t("documents.idCard"),
        description: "Obtenez ou renouvelez votre carte d'identité",
        icon: "🆔",
        category: "documents",
        estimatedTime: "15 min",
        difficulty: "easy",
      },
      {
        id: "school-registration",
        title: "Inscription scolaire",
        description: "Inscrivez vos enfants à l'école",
        icon: "🎓",
        category: "education",
        estimatedTime: "20 min",
        difficulty: "medium",
      },
      {
        id: "birth-certificate",
        title: t("documents.birthCertificate"),
        description: "Demandez un acte de naissance",
        icon: "👶",
        category: "documents",
        estimatedTime: "10 min",
        difficulty: "easy",
      },
    ]);

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        // Add to search history
        appStore.addToOfflineQueue({
          type: "SEARCH",
          query: searchQuery.value,
          timestamp: new Date().toISOString(),
        });

        // Navigate to chat with search query
        router.push({
          path: "/chat",
          query: { q: searchQuery.value },
        });
      }
    };

    const handleQuickAction = (action) => {
      router.push(action.route);
    };

    const navigateToService = (service) => {
      router.push({
        path: "/services",
        query: { service: service.id },
      });
    };

    onMounted(() => {
      // Sync any offline data when back online
      if (appStore.isOnline) {
        appStore.syncOfflineData();
      }
    });

    return {
      searchQuery,
      quickActions,
      popularServices,
      handleSearch,
      handleQuickAction,
      navigateToService,
    };
  },
};
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
