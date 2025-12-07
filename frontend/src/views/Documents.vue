<template>
  <div class="documents-container">
    <h1 class="text-3xl font-bold mb-8">{{ $t("documents.title") }}</h1>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <ActionCard
        icon="📝"
        :title="$t('documents.request')"
        :description="
          $t('documents.requestDesc') ||
          'Faites une nouvelle demande de document'
        "
        buttonText="Nouvelle demande"
        @click="showRequestModal = true"
      />
      <ActionCard
        icon="🔍"
        :title="$t('documents.track')"
        :description="
          $t('documents.trackDesc') || 'Suivez l\'avancement de vos demandes'
        "
        buttonText="Suivre ma demande"
        @click="showTrackingModal = true"
      />
    </div>

    <!-- Popular Documents -->
    <section class="mb-8">
      <h2 class="text-2xl font-bold mb-6">{{ $t("documents.popular") }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DocumentCard
          v-for="doc in popularDocuments"
          :key="doc.id"
          :document="doc"
          @click="requestDocument(doc)"
        />
      </div>
    </section>

    <!-- Request Modal -->
    <DocumentRequestModal
      v-if="showRequestModal"
      @close="showRequestModal = false"
      @submit="handleDocumentRequest"
    />

    <!-- Tracking Modal -->
    <DocumentTrackingModal
      v-if="showTrackingModal"
      @close="showTrackingModal = false"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "../stores/app";
import ActionCard from "../components/ActionCard.vue";
import DocumentCard from "../components/DocumentCard.vue";
import DocumentRequestModal from "../components/DocumentRequestModal.vue";
import DocumentTrackingModal from "../components/DocumentTrackingModal.vue";

export default {
  name: "Documents",
  components: {
    ActionCard,
    DocumentCard,
    DocumentRequestModal,
    DocumentTrackingModal,
  },
  setup() {
    const { t } = useI18n();
    const appStore = useAppStore();

    const showRequestModal = ref(false);
    const showTrackingModal = ref(false);

    const popularDocuments = ref([
      {
        id: "id-card",
        title: t("documents.idCard"),
        description: "Carte nationale d'identité",
        icon: "🆔",
        processingTime: "2-3 semaines",
        cost: "Gratuit",
        offline: true,
      },
      {
        id: "passport",
        title: t("documents.passport"),
        description: "Passeport biométrique",
        icon: "🛂",
        processingTime: "2-4 semaines",
        cost: "86€",
        offline: false,
      },
      {
        id: "birth-certificate",
        title: t("documents.birthCertificate"),
        description: "Copie d'acte de naissance",
        icon: "👶",
        processingTime: "24-48h",
        cost: "Gratuit",
        offline: true,
      },
      {
        id: "marriage-certificate",
        title: t("documents.marriageCertificate"),
        description: "Copie d'acte de mariage",
        icon: "💒",
        processingTime: "24-48h",
        cost: "Gratuit",
        offline: true,
      },
      {
        id: "driver-license",
        title: t("documents.driverLicense"),
        description: "Permis de conduire",
        icon: "🚗",
        processingTime: "1-2 semaines",
        cost: "30€",
        offline: false,
      },
    ]);

    const requestDocument = (document) => {
      if (!document.offline && !appStore.isOnline) {
        alert(t("errors.offline"));
        return;
      }

      // Add to offline queue
      appStore.addToOfflineQueue({
        type: "DOCUMENT_REQUEST",
        documentId: document.id,
        timestamp: new Date().toISOString(),
      });

      // Show request modal with pre-selected document
      showRequestModal.value = true;
    };

    const handleDocumentRequest = (requestData) => {
      console.log("Document request submitted:", requestData);
      showRequestModal.value = false;
      alert("Demande soumise avec succès!");
    };

    return {
      showRequestModal,
      showTrackingModal,
      popularDocuments,
      requestDocument,
      handleDocumentRequest,
    };
  },
};
</script>
