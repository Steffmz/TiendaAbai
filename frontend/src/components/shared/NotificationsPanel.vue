<template>
  <transition name="fade">
    <div v-if="show" class="notifications-panel" ref="panel">
      <div class="panel-header">
        <h3>Notificaciones</h3>
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>
      <div v-if="loading" class="loading">Cargando...</div>
      <ul v-else-if="notifications.length > 0" class="notifications-list">
        <li v-for="notif in notifications" :key="notif.id">
          <strong>{{ notif.titulo }}</strong>
          <p>{{ notif.mensaje }}</p>
          <small>{{ timeAgo(notif.fechaEnvio) }}</small>
        </li>
      </ul>
      <div v-else class="empty">No tienes notificaciones nuevas.</div>
    </div>
  </transition>
</template>

<script setup>
// El script no necesita cambios
import { ref, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const props = defineProps({ show: Boolean });
const emit = defineEmits(['close']);
const notifications = ref([]);
const loading = ref(false);
const panel = ref(null);

const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }});

const fetchNotifications = async () => {
  if (!props.show) return;
  loading.value = true;
  try {
    const { data } = await axios.get('http://localhost:3000/api/notificaciones', getAuthHeaders());
    notifications.value = data;
  } catch (error) {
    console.error("Error al cargar notificaciones:", error);
  } finally {
    loading.value = false;
  }
};

const timeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
};

const handleClickOutside = (event) => {
  if (panel.value && !panel.value.contains(event.target)) {
    emit('close');
  }
};

watch(() => props.show, (newValue) => {
  if (newValue) {
    fetchNotifications();
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notifications-panel {
  position: absolute;
  top: 70px; 
  right: 1rem; 
  width: calc(100% - 2rem); 
  max-width: 360px; 
  background-color: var(--surface, white);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 100;
  color: var(--text);
}

@media (min-width: 640px) {
  .notifications-panel {
    right: 2rem;
    width: 360px; 
  }
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h3 { margin: 0; font-size: 1.1rem; }
.close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }

.notifications-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 60vh; 
  overflow-y: auto;
}
.notifications-list li { padding: 1rem; border-bottom: 1px solid var(--border); }
.notifications-list li:last-child { border-bottom: none; }
.notifications-list p { margin: 0.25rem 0; font-size: 0.9rem; }
.notifications-list small { color: var(--text-muted); font-size: 0.75rem; }

.loading, .empty { padding: 2rem; text-align: center; color: var(--text-muted); }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>