<template>
  <div class="about-container max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">À propos de Moussadar</h1>

    <!-- Mission -->
    <section class="mb-12">
      <div class="bg-blue-50 p-8 rounded-lg">
        <h2 class="text-2xl font-bold mb-4 text-blue-900">Notre Mission</h2>
        <p class="text-lg text-blue-800 mb-4">
          Moussadar est un assistant intelligent ultra-léger conçu pour
          démocratiser l'accès aux services publics numériques, même dans les
          zones à faible connectivité.
        </p>
        <p class="text-blue-700">
          Notre nom vient de l'arabe "مساعد" (Moussadar) qui signifie
          "assistant" - reflétant notre engagement à accompagner chaque citoyen
          dans ses démarches administratives.
        </p>
      </div>
    </section>

    <!-- Features -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6">Caractéristiques principales</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          v-for="feature in features"
          :key="feature.id"
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
        />
      </div>
    </section>

    <!-- Technical Info -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6">Informations techniques</h2>
      <div class="bg-gray-50 p-6 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold mb-3">Optimisations</h3>
            <ul class="space-y-2">
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                Application PWA < 5MB
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                Modèle IA quantifié 70MB
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                Fonctionnement 2G/3G
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                Mode hors ligne complet
              </li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-3">Technologies</h3>
            <ul class="space-y-2">
              <li class="flex items-center">
                <span class="text-blue-500 mr-2">▸</span>
                Vue.js 3 + Vite
              </li>
              <li class="flex items-center">
                <span class="text-blue-500 mr-2">▸</span>
                SmolLM2 quantifié
              </li>
              <li class="flex items-center">
                <span class="text-blue-500 mr-2">▸</span>
                SQLite local
              </li>
              <li class="flex items-center">
                <span class="text-blue-500 mr-2">▸</span>
                Service Workers
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6">Équipe projet</h2>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <p class="text-gray-700 mb-4">
          Moussadar a été développé dans le cadre du Défi National de la Nuit de
          l'Info 2024, avec pour objectif de créer une solution d'IA légère et
          accessible pour tous.
        </p>
        <div class="flex flex-wrap gap-4">
          <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            🏆 Lauréat Défi National
          </div>
          <div
            class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
          >
            🌍 Open Source
          </div>
          <div
            class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
          >
            📱 Progressive Web App
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section>
      <h2 class="text-2xl font-bold mb-6">Contact</h2>
      <div class="bg-gray-50 p-6 rounded-lg">
        <p class="mb-4">
          Pour toute question ou suggestion concernant Moussadar :
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:contact@moussadar.com"
            class="btn-primary inline-flex items-center"
          >
            📧 contact@moussadar.com
          </a>
          <a
            href="https://github.com/moussadar/moussadar"
            target="_blank"
            class="btn-secondary inline-flex items-center"
          >
            💻 GitHub Repository
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import FeatureCard from "../components/FeatureCard.vue";

export default {
  name: "About",
  components: {
    FeatureCard,
  },
  data() {
    return {
      features: [
        {
          id: "lightweight",
          icon: "🪶",
          title: "Ultra-léger",
          description:
            "Application de moins de 5MB, modèle IA de 70MB, fonctionne sur 2G",
        },
        {
          id: "offline",
          icon: "📴",
          title: "Mode hors ligne",
          description:
            "Fonctionnalités complètes sans connexion, synchronisation automatique",
        },
        {
          id: "bilingual",
          icon: "🌍",
          title: "Bilingue FR/AR",
          description:
            "Interface complète en français et arabe avec support RTL",
        },
        {
          id: "accessible",
          icon: "♿",
          title: "Accessible",
          description:
            "Conforme WCAG 2.1, navigation simplifiée, support vocal",
        },
        {
          id: "secure",
          icon: "🔒",
          title: "Sécurisé",
          description: "Données chiffrées localement, aucune collecte invasive",
        },
        {
          id: "open",
          icon: "📖",
          title: "Open Source",
          description: "Code source disponible, contributions bienvenues",
        },
      ],
    };
  },
};
</script>

<style scoped>
.about-container {
  padding: 2rem 1rem;
}

@media (min-width: 768px) {
  .about-container {
    padding: 2rem 0;
  }
}
</style>
