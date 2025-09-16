<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1 class="page-title">Mi Perfil</h1>
      <div v-if="loading" class="text-center p-8">Cargando...</div>
      <div v-else-if="userInfo" class="user-details">
        <h2 class="user-name">{{ userInfo.nombreCompleto }}</h2>
        <p class="user-email">{{ userInfo.email }}</p>
        <div class="points-display">{{ userInfo.puntosTotales }} Puntos</div>
        <button @click="openEditModal" class="btn btn-edit">Editar Perfil</button>
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
            <button type="button" @click="closeEditModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// El script ahora no carga el historial, haciendo la página más rápida.
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const userInfo = ref(null);
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
    // Ya no pedimos el historial, solo el perfil.
    const profileRes = await axios.get(`${API_BASE_URL}/api/perfil`, getAuthHeaders());
    userInfo.value = profileRes.data;
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
    Swal.fire('Error', 'No se pudieron cargar tus datos para la edición.', 'error');
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
    
    Swal.fire('Éxito', 'Perfil actualizado.', 'success');
    closeEditModal();
    await fetchProfileData();
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar tu perfil.', 'error');
  }
};

onMounted(fetchProfileData);
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2rem;
}
.profile-card {
  width: 100%;
  max-width: 500px;
  background: var(--surface);
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  border: 1px solid var(--border);
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--text);
}
.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
}
.user-email {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}
.points-display {
  display: inline-block;
  background-color: var(--primary);
  color: var(--primary-contrast);
  padding: 0.6rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  margin-bottom: 2rem;
}
.btn-edit {
  background-color: #f59e0b;
  color: white;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-edit:hover {
  background-color: #d97706;
}
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: var(--surface); padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; border: 1px solid var(--border); color: var(--text); }
.modal-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; text-align: center; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
.form-group label { margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 4px; background-color: var(--surface-2); color: var(--text); }
.modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-primary { background-color: var(--primary); color: var(--primary-contrast); padding: 0.6rem 1rem; border: none; border-radius: 6px; }
.btn-secondary { background-color: var(--surface-2); color: var(--text); border: 1px solid var(--border); padding: 0.6rem 1rem; border-radius: 6px; }
</style>