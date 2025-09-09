<template>
  <div class="profile-container max-w-7xl w-full mx-auto"ÑÑ>
    <div class="profile-header">
      <h1>Mi Perfil</h1>
      <div v-if="userInfo" class="user-details">
        <h2>{{ userInfo.nombreCompleto }}</h2>
        <p>{{ userInfo.email }}</p>
        <div class="points-display">{{ userInfo.puntosTotales }} Puntos</div>
        <button @click="openEditModal" class="btn-edit">Editar Perfil</button>
      </div>
    </div>

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
          <div class="history-points" :class="item.puntos >= 0 ? 'text-success' : 'text-danger'">
            {{ item.puntos >= 0 ? '+' : '' }}{{ item.puntos }}
          </div>
        </div>
      </div>
      <div v-else class="no-history">
        <p>Aún no tienes movimientos en tu historial de puntos.</p>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <h2 class="modal-title">Editar Mi Perfil</h2>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="form.nombreCompleto" type="text" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Contraseña Actual</label>
            <input v-model="form.contrasenaActual" type="password" placeholder="Requerida si cambias la contraseña" />
          </div>
          <div class="form-group">
            <label>Nueva Contraseña</label>
            <input v-model="form.contrasena" type="password" placeholder="Dejar en blanco para no cambiar" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const userInfo = ref(null);
const historial = ref([]);
const loading = ref(true);
const showEditModal = ref(false);
const form = ref({
  nombreCompleto: '',
  email: '',
  contrasena: '',
  contrasenaActual: ''
});
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchProfileData = async () => {
  loading.value = true;
  try {
    const [profileRes, historialRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/perfil`, getAuthHeaders()),
      axios.get(`${API_BASE_URL}/api/historial`, getAuthHeaders())
    ]);
    userInfo.value = profileRes.data;
    historial.value = historialRes.data;
  } catch (error) {
    console.error("Error al cargar los datos del perfil:", error);
  } finally {
    loading.value = false;
  }
};

const openEditModal = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/usuarios/me`, getAuthHeaders());
    form.value.nombreCompleto = data.nombreCompleto;
    form.value.email = data.email;
    form.value.contrasena = '';
    form.value.contrasenaActual = '';
    showEditModal.value = true;
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar los datos para editar.', 'error');
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const updateProfile = async () => {
  try {
    const payload = {
      nombreCompleto: form.value.nombreCompleto,
      email: form.value.email
    };
    if (form.value.contrasena) {
      payload.contrasena = form.value.contrasena;
      payload.contrasenaActual = form.value.contrasenaActual;
    }
    
    await axios.put(`${API_BASE_URL}/api/usuarios/me`, payload, getAuthHeaders());
    
    Swal.fire('Éxito', 'Perfil actualizado correctamente.', 'success');
    closeEditModal();
    await fetchProfileData(); // Recargamos los datos para ver los cambios
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar el perfil.', 'error');
  }
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const getHistoryItemClass = (tipo) => {
    switch (tipo) {
        case 'CANJE': return 'bg-red-100 text-red-700';
        case 'ASIGNACION_MANUAL': case 'AJUSTE': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

onMounted(fetchProfileData);
</script>

<style scoped>
/* Estilos generales del perfil */
.profile-container { max-width: 900px; margin: auto; }
.profile-header { background: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.user-details h2 { font-size: 1.8rem; font-weight: 600; color: #1e293b; }
.user-details p { color: #64748b; }
.points-display { display: inline-block; background-color: var(--primary); color: var(--primary-contrast, white); padding: 0.5rem 1.5rem; border-radius: 9999px; font-weight: 600; margin-top: 1rem; }
.btn-edit { background-color: #f59e0b; color: white; padding: 0.5rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; margin-top: 1rem; }

/* Estilos de la sección de historial */
.history-section { margin-top: 2.5rem; }
.history-section h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b; }
.history-list { display: flex; flex-direction: column; gap: 0.75rem; }
.history-item { display: flex; align-items: center; gap: 1rem; background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.history-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
.history-details { flex-grow: 1; }
.history-description { font-weight: 500; color: #374151; }
.history-date { color: #6b7280; font-size: 0.8rem; }
.history-points { font-weight: bold; font-size: 1.1rem; }
.text-success { color: #16a34a; }
.text-danger { color: #dc2626; }
.no-history { text-align: center; padding: 2rem; background-color: white; border-radius: 8px; color: #6b7280; }

/* Estilos del modal de edición */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: var(--surface, white); padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; border: 1px solid var(--border, #e2e8f0); color: var(--text, #1e293b); }
.modal-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; text-align: center; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
.form-group label { margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.6rem; border: 1px solid var(--border, #d1d5db); border-radius: 4px; background-color: var(--surface-2, #f9fafb); color: var(--text, #1e293b); }
.modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-primary { background-color: var(--primary); color: var(--primary-contrast); padding: 0.6rem 1rem; border: none; border-radius: 6px; }
.btn-secondary { background-color: var(--surface-2); color: var(--text); border: 1px solid var(--border); padding: 0.6rem 1rem; border-radius: 6px; }
</style>