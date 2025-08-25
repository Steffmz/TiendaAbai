<template>
  <div class="page-container">
    <div class="max-w-7xl w-full mx-auto">
      <div class="page-header">
        <h1 class="page-title">Gestión de Pedidos</h1>
        <p class="page-subtitle">Revisa y administra los canjes de puntos de los usuarios.</p>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Total Puntos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-8">Cargando pedidos...</td>
            </tr>
            <tr v-else v-for="pedido in pedidos" :key="pedido.id">
              <td>#{{ pedido.id }}</td>
              <td>{{ pedido.usuario.nombreCompleto }}</td>
              <td>{{ formatDate(pedido.fecha) }}</td>
              <td>{{ pedido.totalPuntos }}</td>
              <td>
                <span :class="['badge', getStatusClass(pedido.estado)]">
                  {{ pedido.estado }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="openDetailsModal(pedido)" class="btn btn-secondary">Detalles</button>
                <select @change="updateStatus(pedido.id, $event.target.value)" class="status-select" :value="pedido.estado">
                  <option disabled value="">Cambiar estado...</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </td>
            </tr>
             <tr v-if="!loading && pedidos.length === 0">
              <td colspan="6" class="text-center py-8">No hay pedidos para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedPedido" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-content">
        <h2 class="modal-title">Detalles del Pedido #{{ selectedPedido.id }}</h2>
        <p><strong>Usuario:</strong> {{ selectedPedido.usuario.nombreCompleto }}</p>
        <p><strong>Fecha:</strong> {{ formatDate(selectedPedido.fecha) }}</p>
        <h3 class="details-subtitle">Productos Canjeados:</h3>
        <ul class="product-list">
          <li v-for="detalle in selectedPedido.detalles" :key="detalle.id">
            {{ detalle.cantidad }} x {{ detalle.producto.nombre }} ({{ detalle.puntosUnitarios }} pts c/u)
          </li>
        </ul>
        <div class="modal-actions">
          <button @click="closeDetailsModal" class="btn btn-primary">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const pedidos = ref([]);
const loading = ref(true);
const selectedPedido = ref(null);

const API_URL = 'http://localhost:3000/api/pedidos';

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchPedidos = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(API_URL, getAuthHeaders());
    pedidos.value = data;
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar los pedidos.', 'error');
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (pedidoId, nuevoEstado) => {
  if (!nuevoEstado) return;
  
  const result = await Swal.fire({
    title: '¿Confirmar cambio de estado?',
    text: `El pedido cambiará a "${nuevoEstado}".`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, cambiar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await axios.put(`${API_URL}/${pedidoId}/estado`, { estado: nuevoEstado }, getAuthHeaders());
      Swal.fire('Éxito', 'El estado del pedido ha sido actualizado.', 'success');
      fetchPedidos();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar el estado.', 'error');
    }
  }
};

const openDetailsModal = (pedido) => {
  selectedPedido.value = pedido;
};

const closeDetailsModal = () => {
  selectedPedido.value = null;
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', {
  year: 'numeric', month: 'long', day: 'numeric'
});

const getStatusClass = (estado) => {
  const classes = {
    Pendiente: 'warning',
    Aprobado: 'success',
    Enviado: 'info',
    Entregado: 'success-dark',
    Cancelado: 'danger',
    Rechazado: 'danger',
  };
  return classes[estado] || 'secondary';
};

onMounted(fetchPedidos);
</script>

<style scoped>
/* ESTILOS UNIFICADOS CON VARIABLES DE TEMA */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  justify-content: flex-start;
}
.max-w-7xl { max-width: 80rem; width: 100%; margin-left: auto; margin-right: auto; }

.page-header { text-align: center; margin-bottom: 1.5rem; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--text); }
.page-subtitle { color: var(--text-muted); margin-top: 0.25rem; }

.table-container { background: var(--surface); border-radius: 8px; border: 1px solid var(--border); overflow-x: auto; }
table { width: 100%; border-collapse: collapse; color: var(--text); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid var(--border); text-align: center; vertical-align: middle; }
th { background-color: var(--table-header); color: white; }
.text-center { text-align: center; }

.badge { padding: 5px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; color: white; }
.badge.success { background-color: #22c55e; }
.badge.success-dark { background-color: #15803d; }
.badge.danger { background-color: #ef4444; }
.badge.warning { background-color: #f59e0b; color: #1a202c; }
.badge.info { background-color: #3b82f6; }
.badge.secondary { background-color: #6b7280; }

.actions-cell { display: flex; align-items: center; justify-content: center; gap: 1rem; }
.btn-primary { background-color: var(--primary); color: var(--primary-contrast); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.btn-secondary { background-color: var(--surface-2); color: var(--text); border: 1px solid var(--border); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.status-select { background-color: var(--surface-2); color: var(--text); border: 1px solid var(--border); padding: 0.5rem; border-radius: 6px; cursor: pointer; }

/* Estilos del Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: var(--surface); color: var(--text); padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; border: 1px solid var(--border); }
.modal-title { font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; }
.details-subtitle { font-size: 1.1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
.product-list { list-style: none; padding: 0; }
.product-list li { padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
.product-list li:last-child { border-bottom: none; }
.modal-actions { margin-top: 2rem; text-align: right; }
</style>
