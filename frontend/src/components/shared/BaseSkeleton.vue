<template>
  <div class="skeleton-loader" :style="{ width, height, borderRadius: radius }"></div>
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
  radius: { type: String, default: '4px' }
});
</script>

<style scoped>
.skeleton-loader {
  background-color: #e2e8f0;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

html.dark .skeleton-loader {
  background-color: #475569;
}
</style>