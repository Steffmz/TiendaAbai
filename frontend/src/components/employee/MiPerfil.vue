<template>
  <div class="profile-container">
    <div class="history-section">
      <h2>Mi Historial de Puntos</h2>
      <div v-if="loading" class="text-center p-4">Cargando historial...</div>
      <div v-else-if="historial.length > 0" class="history-list">
        <div v-for="item in historial" :key="item.id" class="history-item">
          <div class="history-icon" :class="getHistoryItemClass(item.tipo)">
            <span>{{ item.tipo.charAt(0) }}</span>
          </div>
          <div class="history-details">
            <p class="history-description">{{ item.descripcion }}</p>
            <small class="history-date">{{ formatDate(item.fecha) }}</small>
          </div>
          <div class="history-points" :class="item.puntos > 0 ? 'text-success' : 'text-danger'">
            {{ item.puntos > 0 ? '+' : '' }}{{ item.puntos }}
          </div>
        </div>
      </div>
      <div velse class="no-history">
        <p>Aún no tienes movimientos en tu historial de puntos.</p>
      </div>
    </div>
  </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const userInfo = ref(null);
const pedidos = ref([]);
const historial = ref([]); // <-- NUEVO ESTADO PARA EL HISTORIAL
const loading = ref(true);
const showEditModal = ref(false);
const form = ref({ /* ... */ });
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchProfileData = async () => {
  loading.value = true;
  try {
    // Hacemos todas las llamadas en paralelo para mayor eficiencia
    const [profileRes, pedidosRes, historialRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/perfil`, getAuthHeaders()),
      axios.get(`${API_BASE_URL}/api/pedidos/mis-pedidos`, getAuthHeaders()),
      axios.get(`${API_BASE_URL}/api/historial`, getAuthHeaders()) // <-- NUEVA LLAMADA
    ]);
    userInfo.value = profileRes.data;
    pedidos.value = pedidosRes.data;
    historial.value = historialRes.data; // <-- GUARDAMOS EL HISTORIAL
  } catch (error) {
    console.error("Error al cargar los datos del perfil:", error);
  } finally {
    loading.value = false;
  }
};

// ... (resto de tus funciones: openEditModal, closeEditModal, updateProfile) ...

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const getHistoryItemClass = (tipo) => {
    switch (tipo) {
        case 'CANJE': return 'bg-red-100 text-red-700';
        case 'ASIGNACION_MANUAL': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

onMounted(fetchProfileData);
</script>

<style scoped>
/* ... (tus estilos existentes) ... */

/* NUEVOS ESTILOS PARA EL HISTORIAL */
.history-section {
  margin-top: 2.5rem;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.history-details {
  flex-grow: 1;
}
.history-description {
  font-weight: 500;
  color: #374151;
}
.history-date {
  color: #6b7280;
  font-size: 0.8rem;
}
.history-points {
  font-weight: bold;
  font-size: 1.1rem;
}
.text-success { color: #16a34a; }
.text-danger { color: #dc2626; }

.no-history {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  color: #6b7280;
}
</style>