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
                <select @change="updateStatus(pedido.id, $event.target.value)" class="status-select">
                  <option disabled :selected="true">Cambiar...</option>
                  <option value="Aprobado">Aprobar</option>
                  <option value="Enviado">Enviar</option>
                  <option value="Entregado">Entregar</option>
                  <option value="Rechazado">Rechazar</option>
                  <option value="Cancelado">Cancelar</option>
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
/* Estilos generales de la página */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  justify-content: flex-start;
}
.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.page-title { 
  font-size: 1.8rem; 
  font-weight: 600; 
  color: #f1f5f9;
}
.page-subtitle {
  color: #94a3b8;
  margin-top: 0.25rem;
}
.table-container { overflow-x: auto; background: #2d3748; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #4a5568; }
th { background-color: #1a202c; }
.text-center { text-align: center; }

/* Contenedor para centrar */
.max-w-7xl { max-width: 80rem; }
.w-full { width: 100%; }
.mx-auto { margin-left: auto; margin-right: auto; }

/* Badges de Estado */
.badge { padding: 5px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; color: white; }
.badge.success { background-color: #22c55e; }
.badge.success-dark { background-color: #15803d; }
.badge.danger { background-color: #ef4444; }
.badge.warning { background-color: #f59e0b; color: #1a202c; }
.badge.info { background-color: #3b82f6; }
.badge.secondary { background-color: #6b7280; }

/* Acciones */
.actions-cell { display: flex; align-items: center; gap: 1rem; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background-color 0.2s; }
.btn-primary { background-color: #3b82f6; color: white; }
.btn-secondary { background-color: #6b7280; color: white; }
.status-select { background-color: #4a5568; color: white; border: 1px solid #6b7280; padding: 0.5rem; border-radius: 6px; cursor: pointer; }
.status-select:focus { outline: none; border-color: #3b82f6; }

/* Estilos del Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: #2d3748; color: #f1f5f9; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
.modal-title { font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; }
.details-subtitle { font-size: 1.1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #4a5568; padding-bottom: 0.5rem; }
.product-list { list-style: none; padding: 0; }
.product-list li { padding: 0.5rem 0; border-bottom: 1px solid #4a5568; }
.product-list li:last-child { border-bottom: none; }
.modal-actions { margin-top: 2rem; text-align: right; }
</style>
