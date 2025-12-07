<template>
  <span :class="badgeClass" class="px-2 py-1 rounded-full text-xs font-medium">
    {{ difficultyText }}
  </span>
</template>

<script>
export default {
  name: "DifficultyBadge",
  props: {
    difficulty: {
      type: String,
      required: true,
      validator: (value) => ["easy", "medium", "hard"].includes(value),
    },
  },
  computed: {
    badgeClass() {
      const classes = {
        easy: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        hard: "bg-red-100 text-red-800",
      };
      return classes[this.difficulty];
    },
    difficultyText() {
      const texts = {
        easy: this.$t("common.easy"),
        medium: this.$t("common.medium"),
        hard: this.$t("common.hard"),
      };
      return texts[this.difficulty];
    },
  },
};
</script>
