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
          <label>Nueva Contraseña</label>
          <input v-model="form.contrasena" type="password" placeholder="Dejar en blanco para no cambiar" />
        </div>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const props = defineProps({
  show: Boolean
});
const emit = defineEmits(['close']); // Define emit

const form = ref({
  nombreCompleto: '',
  email: '',
  contrasena: ''
});

const API_URL = 'http://localhost:3000/api/usuarios/me';

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchProfile = async () => {
  if (!props.show) return;
  try {
    const { data } = await axios.get(API_URL, getAuthHeaders());
    form.value.nombreCompleto = data.nombreCompleto;
    form.value.email = data.email;
    form.value.contrasena = '';
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar los datos del perfil.', 'error');
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
    }
    
    await axios.put(API_URL, payload, getAuthHeaders());
    Swal.fire('Éxito', 'Perfil actualizado correctamente.', 'success');
    emit('close');
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
/* Copia los estilos del modal de GestionUsuarios.vue para mantener la consistencia */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: #2d3748; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
.modal-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; text-align: center; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
.form-group label { margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.6rem; border: 1px solid #4a5568; border-radius: 4px; background-color: #1a202c; color: white; }
.modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-primary { background-color: #3b82f6; }
.btn-secondary { background-color: #6b7280; }
</style>
