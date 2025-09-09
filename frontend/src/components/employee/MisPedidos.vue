<template>
  <div class="mis-pedidos-container">

    <div class="header-section">
      <h1 class="page-title">Mi Historial de Canjes</h1>
      <p class="page-subtitle">Aquí puedes ver todos los productos que has canjeado con tus puntos.</p>
    </div>

    <div class="content-section">
      <div v-if="loading" class="loading-state">
        <p>Cargando tus pedidos...</p>
      </div>

      <div v-else-if="pedidos.length === 0" class="empty-state">
        <p>Aún no has realizado ningún canje.</p>
        <router-link to="/tienda" class="btn-primary">Explorar catálogo</router-link>
      </div>

      <div v-else class="pedidos-list">
        <div v-for="pedido in pedidos" :key="pedido.id" class="pedido-card">
          
          <div class="pedido-header">
            <div>
              <h2 class="pedido-id">Pedido #{{ pedido.id }}</h2>
              <p class="pedido-date">{{ formatDate(pedido.fecha) }}</p>
            </div>
            <span :class="['badge', getStatusClass(pedido.estado)]">{{ pedido.estado }}</span>
          </div>
          
          <div class="pedido-body">
            <div v-for="detalle in pedido.detalles" :key="detalle.id" class="producto-item">
              <img 
                :src="`${API_BASE_URL}${detalle.producto.imagenUrl}`" 
                :alt="detalle.producto.nombre" 
                class="producto-img"
                @error="$event.target.src = 'https://placehold.co/100x100/e2e8f0/a0aec0?text=Img'"
              />
              <div class="producto-info">
                <p class="producto-nombre">{{ detalle.producto.nombre }}</p>
                <p class="producto-cantidad">Cantidad: {{ detalle.cantidad }}</p>
              </div>
              <p class="producto-puntos">{{ detalle.puntosUnitarios * detalle.cantidad }} pts</p>
            </div>
          </div>
          
          <div class="pedido-footer">
            <span>Total del Pedido:</span>
            <span class="total-puntos">{{ pedido.totalPuntos }} Puntos</span>
          </div>
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchPedidos = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/pedidos/mis-pedidos`, getAuthHeaders());
    pedidos.value = data;
  } catch (error) {
    Swal.fire('Error', 'No se pudo cargar tu historial de pedidos.', 'error');
  } finally {
    loading.value = false;
  }
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
/* Contenedor principal que centra todo */
.mis-pedidos-container {
  display: flex;
  flex-direction: column; /* Apila los hijos verticalmente */
  align-items: center; /* Centra los hijos horizontalmente */
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.header-section {
  width: 100%;
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text);
}

.page-subtitle {
  color: var(--text-muted);
}

/* Contenedor para la lista, loading o estado vacío */
.content-section {
  width: 100%;
}

.pedidos-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.pedido-card {
  background: var(--surface, white);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: box-shadow 0.3s, transform 0.3s;
}

.pedido-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--surface-2);
  border-bottom: 1px solid var(--border);
}

.pedido-id {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text);
}

.pedido-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pedido-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.producto-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.producto-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.producto-info {
  flex-grow: 1;
}

.producto-nombre {
  font-weight: 600;
  color: var(--text);
}

.producto-cantidad {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.producto-puntos {
  font-weight: 600;
  font-size: 1rem;
  color: var(--primary);
  text-align: right;
  min-width: 80px;
}

.pedido-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--surface-2);
  border-top: 1px solid var(--border);
  font-weight: 600;
}

.total-puntos {
  font-size: 1.2rem;
  color: var(--primary);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  background-color: var(--surface-2);
  border-radius: 12px;
  color: var(--text-muted);
}

.empty-state .btn-primary {
  margin-top: 1rem;
  background-color: var(--primary);
  color: var(--primary-contrast);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
  border: none;
  cursor: pointer;
}

/* Badge Styles */
.badge { padding: 5px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; color: white; text-align: center; }
.badge.success { background-color: #22c55e; }
.badge.success-dark { background-color: #15803d; }
.badge.danger { background-color: #ef4444; }
.badge.warning { background-color: #f59e0b; color: #1a202c; }
.badge.info { background-color: #3b82f6; }
.badge.secondary { background-color: #6b7280; }
</style>