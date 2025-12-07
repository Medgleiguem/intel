<template>
  <div
    @click="$emit('click')"
    class="service-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="text-3xl">{{ service.icon }}</div>
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <span>{{ service.estimatedTime }}</span>
        <DifficultyBadge :difficulty="service.difficulty" />
      </div>
    </div>

    <h3 class="text-xl font-semibold mb-2">{{ service.title }}</h3>
    <p class="text-gray-600 mb-4">{{ service.description }}</p>

    <div class="flex items-center justify-between">
      <span class="text-sm text-blue-600 font-medium">{{
        getCategoryLabel(service.category)
      }}</span>
      <button class="text-blue-600 hover:text-blue-800 font-medium">
        {{ $t("common.start") }} →
      </button>
    </div>
  </div>
</template>

<script>
import DifficultyBadge from "./DifficultyBadge.vue";

export default {
  name: "ServiceCard",
  components: {
    DifficultyBadge,
  },
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getCategoryLabel(category) {
      const labels = {
        documents: this.$t("services.documents"),
        education: this.$t("services.education"),
        health: this.$t("services.health"),
        taxes: this.$t("services.taxes"),
        social: this.$t("services.social"),
        transport: this.$t("services.transport"),
      };
      return labels[category] || category;
    },
  },
};
</script>

<style scoped>
.service-card {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
</style>
