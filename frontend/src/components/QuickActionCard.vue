<template>
  <div
    @click="$emit('click')"
    class="quick-action-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
  >
    <div class="text-center">
      <div class="text-4xl mb-3">{{ action.icon }}</div>
      <h3 class="text-lg font-semibold mb-2">{{ action.title }}</h3>
      <p class="text-gray-600 text-sm">{{ action.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuickActionCard",
  props: {
    action: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.quick-action-card {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
