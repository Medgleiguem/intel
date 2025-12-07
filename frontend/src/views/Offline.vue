<template>
  <div class="offline-container text-center py-12">
    <div class="max-w-2xl mx-auto">
      <div class="text-8xl mb-8">📴</div>
      <h1 class="text-3xl font-bold mb-4">{{ $t("errors.offline") }}</h1>
      <p class="text-lg text-gray-600 mb-8">
        Vous êtes actuellement en mode hors ligne. Certaines fonctionnalités
        peuvent être limitées.
      </p>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-yellow-800">
          Fonctionnalités disponibles hors ligne :
        </h2>
        <ul class="text-left space-y-2 text-yellow-700">
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Consultation des procédures et documents
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Recherche dans la base de connaissances locale
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Sauvegarde des requêtes pour synchronisation
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Navigation dans les services marqués "hors ligne"
          </li>
        </ul>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 text-blue-800">Que faire ?</h2>
        <div class="space-y-3 text-blue-700">
          <p>
            • Continuez à utiliser l'application - vos actions seront
            sauvegardées
          </p>
          <p>
            • Les données seront automatiquement synchronisées quand la
            connexion reviendra
          </p>
          <p>• Vérifiez votre connexion internet ou essayez plus tard</p>
        </div>

        <button @click="checkConnection" class="btn-primary mt-4">
          Vérifier la connexion
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";

export default {
  name: "Offline",
  setup() {
    const appStore = useAppStore();

    const checkConnection = () => {
      if (navigator.onLine) {
        appStore.setOnlineStatus(true);
        // Navigate back to home
        window.location.href = "/";
      } else {
        alert(
          "Vous êtes toujours hors ligne. Vérifiez votre connexion internet."
        );
      }
    };

    return {
      checkConnection,
    };
  },
};
</script>

<style scoped>
.offline-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
