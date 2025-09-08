<template>
  <div class="empty-state">
    <div class="icon-wrapper">
      <Icon :icon="icon" class="icon" />
    </div>
    <h3 class="title">{{ title }}</h3>
    <p class="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  icon: { type: String, default: 'mdi:information-outline' },
  title: { type: String, required: true },
  message: { type: String, required: true }
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background-color: var(--surface-2);
  border-radius: 8px;
  color: var(--text-muted);
}
.icon-wrapper {
  margin: 0 auto 1rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  font-size: 2rem;
  color: var(--primary);
}
.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}
</style>