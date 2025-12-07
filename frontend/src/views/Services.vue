<template>
  <div class="services-container">
    <h1 class="text-3xl font-bold mb-8">{{ $t("services.title") }}</h1>

    <!-- Search and Filter -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('common.search')"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          v-model="selectedCategory"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{{ $t("services.allServices") }}</option>
          <option value="documents">{{ $t("services.documents") }}</option>
          <option value="education">{{ $t("services.education") }}</option>
          <option value="health">{{ $t("services.health") }}</option>
          <option value="taxes">{{ $t("services.taxes") }}</option>
          <option value="social">{{ $t("services.social") }}</option>
          <option value="transport">{{ $t("services.transport") }}</option>
        </select>
      </div>
    </div>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ServiceItem
        v-for="service in filteredServices"
        :key="service.id"
        :service="service"
        @click="selectService(service)"
      />
    </div>

    <!-- No Results -->
    <div v-if="filteredServices.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-semibold mb-2">{{ $t("common.noResults") }}</h3>
      <p class="text-gray-600">{{ $t("common.tryAgain") }}</p>
    </div>

    <!-- Service Detail Modal -->
    <ServiceDetailModal
      v-if="selectedService"
      :service="selectedService"
      @close="selectedService = null"
      @start="startService"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "../stores/app";
import ServiceItem from "../components/ServiceItem.vue";
import ServiceDetailModal from "../components/ServiceDetailModal.vue";

export default {
  name: "Services",
  components: {
    ServiceItem,
    ServiceDetailModal,
  },
  setup() {
    const { t } = useI18n();
    const appStore = useAppStore();

    const searchQuery = ref("");
    const selectedCategory = ref("");
    const selectedService = ref(null);

    const services = ref([
      {
        id: "id-card",
        title: t("documents.idCard"),
        description: "Obtenez ou renouvelez votre carte d'identité nationale",
        category: "documents",
        icon: "🆔",
        estimatedTime: "15 min",
        difficulty: "easy",
        requirements: [
          "Photo d'identité",
          "Justificatif de domicile",
          "Ancienne carte",
        ],
        cost: "Gratuit",
        offline: true,
      },
      {
        id: "passport",
        title: t("documents.passport"),
        description: "Demandez ou renouvelez votre passeport biométrique",
        category: "documents",
        icon: "🛂",
        estimatedTime: "30 min",
        difficulty: "medium",
        requirements: [
          "Photos passeport",
          "Carte d'identité",
          "Justificatif de domicile",
        ],
        cost: "86€",
        offline: false,
      },
      {
        id: "birth-certificate",
        title: t("documents.birthCertificate"),
        description: "Demandez une copie de votre acte de naissance",
        category: "documents",
        icon: "👶",
        estimatedTime: "10 min",
        difficulty: "easy",
        requirements: ["Pièce d'identité", "Informations de naissance"],
        cost: "Gratuit",
        offline: true,
      },
      {
        id: "school-registration",
        title: "Inscription scolaire",
        description: "Inscrivez vos enfants dans un établissement public",
        category: "education",
        icon: "🎓",
        estimatedTime: "20 min",
        difficulty: "medium",
        requirements: [
          "Acte de naissance",
          "Justificatif de domicile",
          "Photos",
        ],
        cost: "Gratuit",
        offline: true,
      },
      {
        id: "tax-declaration",
        title: "Déclaration d'impôts",
        description: "Déclarez vos revenus en ligne",
        category: "taxes",
        icon: "📊",
        estimatedTime: "45 min",
        difficulty: "hard",
        requirements: [
          "Avis d'imposition précédent",
          "Relevés bancaires",
          "Justificatifs",
        ],
        cost: "Gratuit",
        offline: false,
      },
      {
        id: "health-card",
        title: "Carte vitale",
        description: "Obtenez ou mettez à jour votre carte vitale",
        category: "health",
        icon: "💳",
        estimatedTime: "15 min",
        difficulty: "easy",
        requirements: ["Pièce d'identité", "Attestation de sécurité sociale"],
        cost: "Gratuit",
        offline: false,
      },
    ]);

    const filteredServices = computed(() => {
      let filtered = services.value;

      // Filter by category
      if (selectedCategory.value) {
        filtered = filtered.filter(
          (service) => service.category === selectedCategory.value
        );
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (service) =>
            service.title.toLowerCase().includes(query) ||
            service.description.toLowerCase().includes(query)
        );
      }

      // Filter by offline availability when offline
      if (!appStore.isOnline) {
        filtered = filtered.filter((service) => service.offline);
      }

      return filtered;
    });

    const selectService = (service) => {
      selectedService.value = service;
      appStore.addToOfflineQueue({
        type: "SERVICE_VIEW",
        serviceId: service.id,
        timestamp: new Date().toISOString(),
      });
    };

    const startService = (serviceId) => {
      // Navigate to procedure or external service
      const service = services.value.find((s) => s.id === serviceId);
      if (service) {
        // Add to offline queue for later processing
        appStore.addToOfflineQueue({
          type: "SERVICE_START",
          serviceId: serviceId,
          timestamp: new Date().toISOString(),
        });

        // Show success message
        alert(
          `Procédure ${service.title} démarrée. ${
            !appStore.isOnline
              ? "Mode hors ligne: Les données seront synchronisées automatiquement."
              : ""
          }`
        );
      }
    };

    onMounted(() => {
      // Check for service parameter in route
      const route = useRoute();
      if (route.query.service) {
        const service = services.value.find(
          (s) => s.id === route.query.service
        );
        if (service) {
          selectService(service);
        }
      }
    });

    return {
      searchQuery,
      selectedCategory,
      selectedService,
      filteredServices,
      selectService,
      startService,
    };
  },
};
</script>

<style scoped>
.services-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
