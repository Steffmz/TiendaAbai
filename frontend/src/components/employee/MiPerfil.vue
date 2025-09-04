<template>
  <div class="profile-container">
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
      <h2>Mi Historial de Canjes</h2>
      <div v-if="loading">Cargando historial...</div>
      <div v-else-if="pedidos.length > 0" class="orders-list">
        <div v-for="pedido in pedidos" :key="pedido.id" class="order-card">
          <div class="order-info">
            <span class="order-date">{{ formatDate(pedido.fecha) }}</span>
            <span :class="['badge', getStatusClass(pedido.estado)]">{{ pedido.estado }}</span>
          </div>
          <ul class="product-list">
            <li v-for="detalle in pedido.detalles" :key="detalle.id">
              {{ detalle.cantidad }} x {{ detalle.producto.nombre }}
            </li>
          </ul>
          <div class="order-total">
            Total: {{ pedido.totalPuntos }} Puntos
          </div>
        </div>
      </div>
      <div velse class="no-orders">
        <p>Aún no has realizado ningún canje.</p>
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
const pedidos = ref([]);
const loading = ref(true);

const showEditModal = ref(false);
const form = ref({
  nombreCompleto: '',
  email: '',
  contrasena: '',
  contrasenaActual: ''
});

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchProfileData = async () => {
  try {
    const [profileRes, pedidosRes] = await Promise.all([
      axios.get('http://localhost:3000/api/perfil', getAuthHeaders()),
      axios.get('http://localhost:3000/api/pedidos/mis-pedidos', getAuthHeaders())
    ]);
    userInfo.value = profileRes.data;
    pedidos.value = pedidosRes.data;
  } catch (error) {
    console.error("Error al cargar los datos del perfil:", error);
  } finally {
    loading.value = false;
  }
};

const openEditModal = () => {
  form.value.nombreCompleto = userInfo.value.nombreCompleto;
  form.value.email = userInfo.value.email;
  form.value.contrasena = '';
  form.value.contrasenaActual = '';
  showEditModal.value = true;
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
    
    await axios.put('http://localhost:3000/api/usuarios/me', payload, getAuthHeaders());
    
    await Swal.fire('Éxito', 'Perfil actualizado correctamente.', 'success');
    closeEditModal();
    await fetchProfileData();
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar el perfil.', 'error');
  }
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', { dateStyle: 'long' });

const getStatusClass = (estado) => ({
  'Pendiente': 'warning', 'Aprobado': 'success', 'Enviado': 'info',
  'Entregado': 'success-dark', 'Cancelado': 'danger', 'Rechazado': 'danger'
}[estado] || 'secondary');

onMounted(fetchProfileData);
</script>

<style scoped>
/* Estilos existentes */
.profile-container { max-width: 900px; margin: auto; }
.profile-header { background: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.user-details h2 { font-size: 1.8rem; font-weight: 600; color: #1e293b; }
.user-details p { color: #64748b; }
.points-display { display: inline-block; background-color: var(--primary); color: var(--primary-contrast, white); padding: 0.5rem 1.5rem; border-radius: 9999px; font-weight: 600; margin-top: 1rem; }
.history-section { margin-top: 2.5rem; }
h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b; }
.orders-list { display: grid; gap: 1rem; }
.order-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.order-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.order-date { font-weight: 500; color: #64748b; }
.product-list { list-style: none; padding-left: 1rem; border-left: 3px solid #e2e8f0; }
.order-total { text-align: right; font-weight: 600; margin-top: 1rem; }
.badge { padding: 5px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; color: white; }
.badge.success { background-color: #22c55e; }
.badge.danger { background-color: #ef4444; }
.badge.warning { background-color: #f59e0b; color: #1a202c; }
.no-orders { text-align: center; padding: 2rem; color: #64748b; }

/* Nuevos estilos para el botón de editar y el modal */
.btn-edit { background-color: #f59e0b; color: white; padding: 0.5rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; margin-top: 1rem; }
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