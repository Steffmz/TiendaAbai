<template>
  <div class="product-page-container">
    <div v-if="loading" class="loading-state">Cargando...</div>
    <div v-else-if="campaign" class="product-list-container">
      <router-link to="/" class="back-link">&larr; Volver a la tienda</router-link>
      <div class="campaign-header">
        <h1>{{ campaign.titulo }}</h1>
        <p>{{ campaign.descripcion }}</p>
      </div>
      <div v-if="campaign.productos && campaign.productos.length > 0" class="products-grid">
        <div v-for="product in campaign.productos" :key="product.id" class="product-card">
          <div class="product-info">
            <h3>{{ product.nombre }}</h3>
            <p class="points">{{ product.precioPuntos }} Puntos</p>
            <button @click="agregarAlCarrito(product.id)" class="btn-redeem" :disabled="product.stock <= 0">
              {{ product.stock > 0 ? 'Agregar al Carrito' : 'Agotado' }}
            </button>
          </div>
        </div>
      </div>
      <div velse class="no-products">
        <p>Esta campaña no tiene productos disponibles en este momento.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useCarrito } from '../../composables/useCarrito';

const emit = defineEmits(['redemption-successful']); // Para actualizar los puntos en el header
const route = useRoute();
const campaign = ref(null);
const loading = ref(true);
const campaignId = route.params.id;

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchCampaignProducts = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`http://localhost:3000/api/campanas/${campaignId}`, getAuthHeaders());
    campaign.value = data;
  } catch (error) {
    console.error("Error al cargar los productos de la campaña:", error);
  } finally {
    loading.value = false;
  }
};

const { agregarAlCarrito } = useCarrito();

onMounted(fetchCampaignProducts);
</script>

<style scoped>
/* Tus estilos se mantienen igual */
.product-page-container {
  max-width: 1200px;
  margin: auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}

.campaign-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.campaign-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
}

.campaign-header p {
  font-size: 1.125rem;
  color: #64748b;
  margin-top: 0.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.product-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.points {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary, #2b7fff);
  margin: 0.5rem 0 1rem;
}

.btn-redeem {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary, #2b7fff);
  color: var(--primary-contrast, white);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-redeem:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.no-products {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}
</style>