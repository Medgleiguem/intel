<template>
  <div
    @click="$emit('click')"
    class="service-item bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="text-3xl">{{ service.icon }}</div>
      <div class="flex items-center space-x-2">
        <span
          v-if="!service.offline"
          class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
        >
          {{ $t("common.onlineOnly") }}
        </span>
        <DifficultyBadge :difficulty="service.difficulty" />
      </div>
    </div>

    <h3 class="text-xl font-semibold mb-2">{{ service.title }}</h3>
    <p class="text-gray-600 mb-4">{{ service.description }}</p>

    <div class="flex items-center justify-between text-sm text-gray-500">
      <span>⏱️ {{ service.estimatedTime }}</span>
      <span>💰 {{ service.cost }}</span>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="req in service.requirements.slice(0, 2)"
          :key="req"
          class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
        >
          {{ req }}
        </span>
        <span
          v-if="service.requirements.length > 2"
          class="text-xs text-gray-500"
        >
          +{{ service.requirements.length - 2 }} {{ $t("common.more") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import DifficultyBadge from "./DifficultyBadge.vue";

export default {
  name: "ServiceItem",
  components: {
    DifficultyBadge,
  },
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.service-item {
  min-height: 220px;
  display: flex;
  flex-direction: column;
}
</style>
