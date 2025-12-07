<template>
  <div class="procedures-container">
    <h1 class="text-3xl font-bold mb-8">{{ $t("procedures.title") }}</h1>

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
          v-model="selectedDifficulty"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{{ $t("common.all") }}</option>
          <option value="easy">{{ $t("common.easy") }}</option>
          <option value="medium">{{ $t("common.medium") }}</option>
          <option value="hard">{{ $t("common.hard") }}</option>
        </select>
      </div>
    </div>

    <!-- Procedures List -->
    <div class="space-y-6">
      <ProcedureCard
        v-for="procedure in filteredProcedures"
        :key="procedure.id"
        :procedure="procedure"
        @start="startProcedure"
      />
    </div>

    <!-- No Results -->
    <div v-if="filteredProcedures.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">📋</div>
      <h3 class="text-xl font-semibold mb-2">{{ $t("common.noResults") }}</h3>
      <p class="text-gray-600">{{ $t("common.tryAgain") }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "../stores/app";
import ProcedureCard from "../components/ProcedureCard.vue";

export default {
  name: "Procedures",
  components: {
    ProcedureCard,
  },
  setup() {
    const { t } = useI18n();
    const appStore = useAppStore();

    const searchQuery = ref("");
    const selectedDifficulty = ref("");

    const procedures = ref([
      {
        id: "id-card-renewal",
        title: "Renouvellement carte d'identité",
        description: "Renouvelez votre carte d'identité nationale",
        category: "documents",
        difficulty: "easy",
        estimatedTime: "15 min",
        steps: [
          "Remplir le formulaire en ligne",
          "Télécharger les documents requis",
          "Prendre rendez-vous en mairie",
          "Déposer votre dossier",
        ],
        requirements: [
          "Ancienne carte d'identité",
          "Photo d'identité récente",
          "Justificatif de domicile",
        ],
        cost: "Gratuit",
        offline: true,
      },
      {
        id: "school-registration",
        title: "Inscription scolaire",
        description: "Inscrivez votre enfant dans un établissement public",
        category: "education",
        difficulty: "medium",
        estimatedTime: "20 min",
        steps: [
          "Créer un compte parent",
          "Sélectionner l'établissement",
          "Remplir le dossier de candidature",
          "Déposer les pièces justificatives",
        ],
        requirements: [
          "Acte de naissance",
          "Justificatif de domicile",
          "Photos",
          "Certificat médical",
        ],
        cost: "Gratuit",
        offline: true,
      },
      {
        id: "tax-declaration",
        title: "Déclaration d'impôts",
        description: "Déclarez vos revenus annuels",
        category: "taxes",
        difficulty: "hard",
        estimatedTime: "45 min",
        steps: [
          "Se connecter à votre espace",
          "Vérifier les données pré-remplies",
          "Compléter les informations manquantes",
          "Valider et envoyer la déclaration",
        ],
        requirements: [
          "Avis d'imposition précédent",
          "Relevés bancaires",
          "Justificatifs de revenus",
          "Factures déductibles",
        ],
        cost: "Gratuit",
        offline: false,
      },
      {
        id: "health-card",
        title: "Carte Vitale",
        description: "Obtenez ou mettez à jour votre carte Vitale",
        category: "health",
        difficulty: "easy",
        estimatedTime: "10 min",
        steps: [
          "Faire la demande en ligne",
          "Télécharger la photo",
          "Envoyer le dossier par courrier",
          "Recevoir la carte",
        ],
        requirements: [
          "Pièce d'identité",
          "Attestation de sécurité sociale",
          "Photo",
        ],
        cost: "Gratuit",
        offline: false,
      },
    ]);

    const filteredProcedures = computed(() => {
      let filtered = procedures.value;

      // Filter by difficulty
      if (selectedDifficulty.value) {
        filtered = filtered.filter(
          (procedure) => procedure.difficulty === selectedDifficulty.value
        );
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (procedure) =>
            procedure.title.toLowerCase().includes(query) ||
            procedure.description.toLowerCase().includes(query)
        );
      }

      // Filter by offline availability when offline
      if (!appStore.isOnline) {
        filtered = filtered.filter((procedure) => procedure.offline);
      }

      return filtered;
    });

    const startProcedure = (procedureId) => {
      const procedure = procedures.value.find((p) => p.id === procedureId);
      if (!procedure) return;

      if (!procedure.offline && !appStore.isOnline) {
        alert(t("errors.offline"));
        return;
      }

      // Add to offline queue
      appStore.addToOfflineQueue({
        type: "PROCEDURE_START",
        procedureId: procedureId,
        timestamp: new Date().toISOString(),
      });

      // Navigate to step-by-step view
      alert(
        `Procédure ${procedure.title} démarrée. ${
          !appStore.isOnline ? "Mode hors ligne activé." : ""
        }`
      );
    };

    return {
      searchQuery,
      selectedDifficulty,
      filteredProcedures,
      startProcedure,
    };
  },
};
</script>
