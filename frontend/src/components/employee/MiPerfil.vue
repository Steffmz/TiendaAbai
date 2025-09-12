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
/* Contenedor principal */
.profile-container {
  max-width: 900px;
  margin: auto;
  min-height: 100vh; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 1rem;
  box-sizing: border-box;
  overflow: hidden; /* Quitamos scroll general */
}

/* Encabezado del perfil */
.profile-header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  margin-bottom: 1.5rem;
}

.user-details h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
}
.user-details p {
  color: #64748b;
}

/* Botón de puntos */
.points-display {
  display: inline-block;
  background: linear-gradient(90deg, var(--primary), #2563eb);
  color: white;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 1rem;
  margin-right: 0.75rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease-in-out;
}
.points-display:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.4);
}

/* Botón Editar Perfil */
.btn-edit {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  color: white;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
  margin-top: 1rem;
  transition: all 0.2s ease-in-out;
}
.btn-edit:hover {
  background: linear-gradient(90deg, #d97706, #f59e0b);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(245, 158, 11, 0.4);
}

/* Sección de historial */
.history-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.history-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

/* Lista con scroll */
.history-list {
  flex-grow: 1;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.5rem;
}

/* Estilo scroll */
.history-list::-webkit-scrollbar {
  width: 6px;
}
.history-list::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 10px;
}
.history-list::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 10px;
}
.history-list::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Items historial */
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
  flex-shrink: 0;
}
.history-details { flex-grow: 1; }
.history-description { font-weight: 500; color: #374151; }
.history-date { color: #6b7280; font-size: 0.8rem; }
.history-points { font-weight: bold; font-size: 1.1rem; }
.text-success { color: #16a34a; }
.text-danger { color: #dc2626; }
.no-history {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  color: #6b7280;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: var(--surface, white);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  border: 1px solid var(--border, #e2e8f0);
  color: var(--text, #1e293b);
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--border, #d1d5db);
  border-radius: 4px;
  background-color: var(--surface-2, #f9fafb);
  color: var(--text, #1e293b);
}

/* Modal Botones */
.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.modal-actions .btn-primary {
  background: linear-gradient(90deg, var(--primary), #2563eb);
  color: white;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease-in-out;
}
.modal-actions .btn-primary:hover {
  transform: translateY(-2px);
  background: linear-gradient(90deg, #1d4ed8, #1e40af);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.4);
}

.modal-actions .btn-secondary {
  background: #f3f4f6;
  color: #374151;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease-in-out;
}
.modal-actions .btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}
</style>


