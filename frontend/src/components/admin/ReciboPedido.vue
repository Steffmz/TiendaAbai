<template>
  <div class="recibo-container" v-if="pedido">
    <div class="recibo-card">
      <div class="recibo-header">
        <img :src="abaiLogo" alt="Abai Logo" class="logo">
        <h1>Recibo de Entrega</h1>
      </div>
      <div class="recibo-body">
        <div class="info-grid">
          <div><strong>Pedido ID:</strong> #{{ pedido.id }}</div>
          <div><strong>Fecha de Aprobación:</strong> {{ formatDate(pedido.fechaAprobacion) }}</div>
          <div><strong>Solicitado por:</strong> {{ pedido.usuario.nombreCompleto }}</div>
          <div><strong>Aprobado por:</strong> {{ pedido.aprobadoPor.nombreCompleto }}</div>
        </div>

        <h3 class="productos-title">Productos Canjeados</h3>
        <ul class="product-list">
          <li v-for="detalle in pedido.detalles" :key="detalle.id">
            <span>{{ detalle.cantidad }} x {{ detalle.producto.nombre }}</span>
            <span>{{ detalle.puntosUnitarios * detalle.cantidad }} pts</span>
          </li>
        </ul>

        <div class="total-section">
          <strong>Total Puntos Canjeados:</strong>
          <strong>{{ pedido.totalPuntos }} pts</strong>
        </div>
      </div>
      <div class="recibo-footer">
        <p>¡Gracias por tu dedicación!</p>
        <button @click="imprimirRecibo" class="btn-imprimir">Imprimir</button>
      </div>
    </div>
  </div>
  <div v-else class="loading">Cargando recibo...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
// --- CORRECCIÓN AQUÍ ---
import abaiLogo from '../../assets/img/abai-logo.png';

const props = defineProps({
  pedidoId: { type: String, required: true }
});

const route = useRoute();
const pedido = ref(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchPedidoDetalles = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/pedidos/${props.pedidoId}`, getAuthHeaders());
    pedido.value = data;
  } catch (error) {
    console.error("Error al cargar los detalles del pedido:", error);
  }
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const imprimirRecibo = () => {
  window.print();
};

onMounted(fetchPedidoDetalles);
</script>

<style scoped>
.recibo-container { padding: 2rem; background-color: #f4f7f6; }
.recibo-card { max-width: 600px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.recibo-header { text-align: center; padding: 1.5rem; border-bottom: 1px solid #e0e0e0; }
.logo { height: 40px; margin-bottom: 1rem; }
.recibo-body { padding: 1.5rem; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
.productos-title { font-weight: 600; margin-bottom: 0.5rem; }
.product-list { list-style: none; padding: 0; margin-bottom: 1.5rem; }
.product-list li { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed #e0e0e0; }
.total-section { display: flex; justify-content: space-between; font-size: 1.1rem; padding-top: 1rem; border-top: 1px solid #333; }
.recibo-footer { text-align: center; padding: 1.5rem; border-top: 1px solid #e0e0e0; }
.btn-imprimir { padding: 0.6rem 1.2rem; background: #4a90e2; color: white; border: none; border-radius: 6px; cursor: pointer; }
@media print {
  body * { visibility: hidden; }
  .recibo-container, .recibo-container * { visibility: visible; }
  .recibo-container { position: absolute; left: 0; top: 0; width: 100%; }
  .btn-imprimir { display: none; }
}
</style>