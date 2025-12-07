<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div
      class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <div class="text-4xl mr-4">{{ service.icon }}</div>
            <div>
              <h2 class="text-2xl font-bold">{{ service.title }}</h2>
              <p class="text-gray-600">{{ service.description }}</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Service Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-sm text-blue-600 font-medium mb-1">
              {{ $t("procedures.duration") }}
            </div>
            <div class="text-lg font-semibold">{{ service.estimatedTime }}</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-green-600 font-medium mb-1">
              {{ $t("procedures.cost") }}
            </div>
            <div class="text-lg font-semibold">{{ service.cost }}</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-sm text-purple-600 font-medium mb-1">
              {{ $t("common.difficulty") }}
            </div>
            <DifficultyBadge :difficulty="service.difficulty" />
          </div>
        </div>

        <!-- Requirements -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">
            {{ $t("procedures.requirements") }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div
              v-for="req in service.requirements"
              :key="req"
              class="flex items-center p-2 bg-gray-50 rounded"
            >
              <span class="text-green-500 mr-2">✓</span>
              {{ req }}
            </div>
          </div>
        </div>

        <!-- Offline Warning -->
        <div
          v-if="!service.offline && !isOnline"
          class="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
        >
          <p class="text-red-700">
            {{ $t("errors.offline") }}. {{ $t("errors.tryAgain") }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
        <button @click="$emit('close')" class="btn-secondary">
          {{ $t("common.cancel") }}
        </button>
        <button
          @click="$emit('start', service.id)"
          :disabled="!service.offline && !isOnline"
          class="btn-primary"
        >
          {{ $t("procedures.startProcedure") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import DifficultyBadge from "./DifficultyBadge.vue";

export default {
  name: "ServiceDetailModal",
  components: {
    DifficultyBadge,
  },
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const isOnline = ref(navigator.onLine);

    window.addEventListener("online", () => (isOnline.value = true));
    window.addEventListener("offline", () => (isOnline.value = false));

    return {
      isOnline,
    };
  },
};
</script>
