<template>
  <div class="max-w-7xl w-full mx-auto">
    <div class="page-header">
      <h1 class="page-title">Gestión de Pedidos</h1>
      <p class="page-subtitle">Revisa y administra los canjes de puntos de los usuarios.</p>
    </div>

    <div class="table-container">
      <table class="hidden md:table w-full">
        <thead class="bg-[#74B9E7] text-black">
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
          <tr v-else v-for="pedido in pedidos" :key="pedido.id">
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
    
    <div v-if="!loading && totalPages > 1" class="flex flex-col items-center justify-center mt-4">
        <p class="text-gray-700">
            Existen <span class="text-blue-500 font-semibold">{{ totalPedidos }}</span> pedidos
        </p>
        <div class="flex items-center mt-2 space-x-1">
            <button @click="prevPage" :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              ←
            </button>
            <button v-for="pagina in paginasVisibles" :key="pagina" @click="goToPage(pagina)" :class="[
              'w-8 h-8 flex items-center justify-center rounded-md border font-medium',
              currentPage === pagina
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-[#fffef9] border-gray-200 text-gray-600 hover:bg-gray-100',
              pagina === '...' ? 'cursor-default' : ''
            ]">
              {{ pagina }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              →
            </button>
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PAGINATION } from '../../config';
// CAMBIO: Se importa el archivo de estilos centralizado
import '../../assets/css/AdminGestion.css';

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
const paginasVisibles = computed(() => {
    const total = totalPages.value;
    const actual = currentPage.value;
    const rango = 1;
    const paginas = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) paginas.push(i);
      return paginas;
    }

    paginas.push(1);
    if (actual > rango + 2) paginas.push('...');
    for (let i = Math.max(2, actual - rango); i <= Math.min(total - 1, actual + rango); i++) {
      paginas.push(i);
    }
    if (actual < total - rango - 1) paginas.push('...');
    paginas.push(total);

    return paginas;
});

const goToPage = (pagina) => {
    if (typeof pagina === 'number') {
        currentPage.value = pagina;
        fetchPedidos();
    }
};
onMounted(fetchPedidos);
</script>

<style scoped>
/* Los estilos específicos de esta tabla se mantienen aquí */
.status-select {
  background-color: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.badge.success-dark {
  background-color: #15803c88;
}

.modal-content p {
  margin-bottom: 0.5rem;
}

.details-subtitle {
  font-size: 1.1rem;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
  font-weight: 600;
}

.product-list {
  list-style: none;
  padding: 0;
}

.product-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.product-list li:last-child {
  border-bottom: none;
}
</style>