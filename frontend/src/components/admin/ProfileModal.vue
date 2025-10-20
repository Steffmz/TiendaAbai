<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
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
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const props = defineProps({ show: Boolean });
const emit = defineEmits(['close', 'profileUpdated']); 

const form = ref({
  nombreCompleto: '',
  email: '',
  contrasena: '',
  contrasenaActual: ''
});

const API_URL_PERFIL = 'http://localhost:3000/api/perfil'; // Para obtener los datos iniciales
const API_URL_UPDATE = 'http://localhost:3000/api/usuarios/me'; // Para actualizar
const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });

const fetchProfile = async () => {
  try {
    const { data } = await axios.get(API_URL_PERFIL, getAuthHeaders());
    form.value.nombreCompleto = data.nombreCompleto;
    form.value.email = data.email;
    form.value.contrasena = ''; // Siempre limpiar la contraseña al abrir
    form.value.contrasenaActual = ''; // Siempre limpiar al abrir
  } catch (error) {
    console.error("Error al cargar datos del perfil del admin:", error);
    Swal.fire('Error', 'No se pudieron cargar los datos de tu perfil.', 'error');
  }
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

    await axios.put(API_URL_UPDATE, payload, getAuthHeaders());
    Swal.fire('Éxito', 'Perfil actualizado correctamente.', 'success');
    emit('close');
    emit('profileUpdated'); 
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar el perfil.', 'error');
  }
};

watch(() => props.show, (newValue) => {
  if (newValue) {
    fetchProfile(); 
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  color: #333;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1a202c;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #f7fafc;
  color: #1a202c;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary {
  background-color: #4299e1;
  color: white;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}

.btn-primary:hover {
  background-color: #3182ce;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #4a5568;
  padding: 0.75rem 1.25rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.btn-secondary:hover {
  background-color: #cbd5e0;
  border-color: #a0aec0;
}
</style>
