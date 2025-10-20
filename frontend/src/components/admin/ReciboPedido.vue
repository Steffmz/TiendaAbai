<template>
  <div class="page-container">
    <button @click="router.back()" class="back-button">
      &larr; Volver
    </button>
    
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router'; // ✅ IMPORTAR useRouter
import abaiLogo from '../../assets/img/abai-logo.png';

const props = defineProps({
  pedidoId: { type: String, required: true }
});

const route = useRoute();
const router = useRouter(); // ✅ INICIALIZAR ROUTER
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
/* ✅ NUEVOS ESTILOS ✅ */
.page-container {
  padding: 1.5rem;
}
.back-button {
  background-color: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
}
.back-button:hover {
  background-color: var(--border);
}
@media print {
  .page-container { padding: 0; }
  .back-button { display: none; }
}
/* --- Fin de nuevos estilos --- */

.recibo-container { background-color: transparent; padding: 0; }
.recibo-card { max-width: 600px; margin: auto; background: var(--surface); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid var(--border); }
.recibo-header { text-align: center; padding: 1.5rem; border-bottom: 1px solid var(--border); }
.logo { height: 40px; margin-bottom: 1rem; }
.recibo-body { padding: 1.5rem; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
.productos-title { font-weight: 600; margin-bottom: 0.5rem; }
.product-list { list-style: none; padding: 0; margin-bottom: 1.5rem; }
.product-list li { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed var(--border); }
.total-section { display: flex; justify-content: space-between; font-size: 1.1rem; padding-top: 1rem; border-top: 1px solid var(--text); }
.recibo-footer { text-align: center; padding: 1.5rem; border-top: 1px solid var(--border); }
.btn-imprimir { padding: 0.6rem 1.2rem; background: #4a90e2; color: white; border: none; border-radius: 6px; cursor: pointer; }
@media print {
  body * { visibility: hidden; }
  .recibo-container, .recibo-container * { visibility: visible; }
  .recibo-container { position: absolute; left: 0; top: 0; width: 100%; }
  .recibo-card { box-shadow: none; border: none; }
  .btn-imprimir { display: none; }
}
</style>