<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content" :style="{ maxWidth: width }">
        <button @click="$emit('close')" class="close-button" aria-label="Cerrar modal">&times;</button>
        <h2 v-if="title" class="modal-title">{{ title }}</h2>
        
        <slot></slot>

        <div class="modal-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '' },
  width: { type: String, default: '600px' }
});
defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: var(--surface);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  border: 1px solid var(--border);
  position: relative;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text);
}
.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-muted);
}
.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>