<template>
  <div class="max-w-7xl w-full mx-auto">
    <div class="page-header">
      <h1 class="page-title">Gestión de Pedidos</h1>
      <p class="page-subtitle">Revisa y administra los canjes de puntos de los usuarios.</p>
    </div>

    <div class="table-container">
      <table class="hidden md:table w-full">
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
          <tr v-if="loading"><td colspan="6" class="text-center py-8">Cargando pedidos...</td></tr>
          <tr v-else-if="pedidos.length === 0"><td colspan="6" class="text-center py-8">No hay pedidos para mostrar.</td></tr>
          <tr v-else v-for="pedido in pedidos" :key="pedido.id" class="table-row">
            <td>#{{ pedido.id }}</td>
            <td>{{ pedido.usuario.nombreCompleto }}</td>
            <td>{{ formatDate(pedido.fecha) }}</td>
            <td>{{ pedido.totalPuntos }}</td>
            <td><span :class="['badge', getStatusClass(pedido.estado)]">{{ pedido.estado }}</span></td>
            <td class="actions-cell">
              <button @click="openDetailsModal(pedido)" class="btn btn-secondary">Detalles</button>
              <select @change="updateStatus(pedido.id, $event.target.value)" class="status-select" :value="pedido.estado">
                <option disabled value="">Cambiar...</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="md:hidden">
          <div v-if="loading" class="text-center py-8">Cargando pedidos...</div>
          <div v-else-if="pedidos.length === 0" class="text-center py-8">No hay pedidos para mostrar.</div>
          <div v-else class="cards-container">
              <div v-for="pedido in pedidos" :key="pedido.id" class="card">
                  <div class="card-header">
                      <h3 class="card-title">Pedido #{{ pedido.id }}</h3>
                      <span :class="['badge', getStatusClass(pedido.estado)]">{{ pedido.estado }}</span>
                  </div>
                  <div class="card-body">
                      <div class="card-row"><strong>Usuario:</strong> {{ pedido.usuario.nombreCompleto }}</div>
                      <div class="card-row"><strong>Fecha:</strong> {{ formatDate(pedido.fecha) }}</div>
                      <div class="card-row"><strong>Total:</strong> {{ pedido.totalPuntos }} puntos</div>
                  </div>
                  <div class="card-actions">
                       <button @click="openDetailsModal(pedido)" class="btn btn-secondary">Detalles</button>
                      <select @change="updateStatus(pedido.id, $event.target.value)" class="status-select" :value="pedido.estado">
                          <option disabled value="">Cambiar estado...</option>
                          <option value="Aprobado">Aprobado</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Rechazado">Rechazado</option>
                          <option value="Cancelado">Cancelado</option>
                      </select>
                  </div>
              </div>
          </div>
      </div>
    </div>
    
    <div v-if="!loading && totalPages > 1" class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary">Anterior</button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-secondary">Siguiente</button>
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PAGINATION } from '../../config';

const pedidos = ref([]);
const loading = ref(true);
const selectedPedido = ref(null);
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/pedidos`;
const currentPage = ref(1);
const totalPedidos = ref(0);
const pedidosPorPagina = ref(PAGINATION.PEDIDOS);
const totalPages = computed(() => Math.ceil(totalPedidos.value / pedidosPorPagina.value));
const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }});

const fetchPedidos = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({ page: currentPage.value, limit: pedidosPorPagina.value });
    const { data } = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeaders());
    pedidos.value = data.pedidos;
    totalPedidos.value = data.total;
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar los pedidos.', 'error');
  } finally {
    loading.value = false;
  }
};

const nextPage = () => { if (currentPage.value < totalPages.value) { currentPage.value++; fetchPedidos(); }};
const prevPage = () => { if (currentPage.value > 1) { currentPage.value--; fetchPedidos(); }};
const updateStatus = async (pedidoId, nuevoEstado) => {
  if (!nuevoEstado) return;
  const result = await Swal.fire({ title: '¿Confirmar cambio de estado?', text: `El pedido cambiará a "${nuevoEstado}".`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar', });
  if (result.isConfirmed) {
    try {
      await axios.put(`${API_URL}/${pedidoId}/estado`, { estado: nuevoEstado }, getAuthHeaders());
      Swal.fire('Éxito', 'Estado actualizado.', 'success');
      fetchPedidos();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar.', 'error');
    }
  }
};
const openDetailsModal = (pedido) => { selectedPedido.value = pedido; };
const closeDetailsModal = () => { selectedPedido.value = null; };
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
const getStatusClass = (estado) => {
  const classes = {
    Pendiente: 'warning', Aprobado: 'success', Enviado: 'info',
    Entregado: 'success-dark', Cancelado: 'danger', Rechazado: 'danger',
  };
  return classes[estado] || 'secondary';
};
onMounted(fetchPedidos);
</script>

<style scoped>
.max-w-7xl { max-width: 80rem; width: 100%; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 1.5rem; }
.page-title { font-size: 1.8rem; font-weight: 700; color: var(--text); }
.page-subtitle { color: var(--text-muted); }
.table-container { background: var(--surface); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
.hidden { display: none; }
@media (min-width: 768px) { .md\:table { display: table; } .md\:hidden { display: none; } }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px 15px; text-align: center; vertical-align: middle; }
th { background-color: var(--table-header); color: white; font-weight: 600; }
.table-row { border-bottom: 1px solid var(--border); }
.cards-container { padding: 1rem; display: grid; gap: 1rem; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border); }
.card-title { font-weight: 700; }
.card-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; }
.card-row { display: flex; justify-content: space-between; }
.card-actions { display: flex; gap: 0.5rem; padding: 1rem; background-color: var(--surface-2); }
.card-actions .btn-secondary, .card-actions .status-select { flex: 1; }
.btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
.btn-primary { background-color: var(--primary); color: white; }
.btn-secondary { background-color: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
.actions-cell { display: flex; justify-content: center; gap: 0.5rem; }
.status-select { background-color: var(--surface-2); color: var(--text); border: 1px solid var(--border); padding: 0.5rem; border-radius: 6px; cursor: pointer; }
.badge { padding: 5px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; color: white; }
.badge.success { background-color: #22c55e; }
.badge.success-dark { background-color: #15803d; }
.badge.danger { background-color: #ef4444; }
.badge.warning { background-color: #f59e0b; color: #1a202c; }
.badge.info { background-color: #3b82f6; }
.badge.secondary { background-color: #6b7280; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
.modal-content { background: var(--surface); color: var(--text); padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; }
.modal-title { font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; }
.details-subtitle { font-size: 1.1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
.product-list { list-style: none; padding: 0; }
.product-list li { padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
.product-list li:last-child { border-bottom: none; }
.modal-actions { margin-top: 2rem; text-align: right; }
.pagination-controls { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1.5rem; }
</style>