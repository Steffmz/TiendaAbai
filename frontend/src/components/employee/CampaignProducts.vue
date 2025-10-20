<template>
  <div class="product-page-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>
    <div v-else-if="campaign" class="product-list-container">
      <router-link to="/tienda" class="back-link">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
        </svg>
        Volver a la tienda
      </router-link>
      <div class="campaign-banner" :style="campaign.imagenUrl ? `background-image: url('${API_BASE_URL}${campaign.imagenUrl}')` : ''">
        <div class="banner-pattern"></div>
        <div class="campaign-banner-overlay">
          <div class="campaign-header">
            <h1 class="campaign-title">{{ campaign.titulo }}</h1>
            <p class="campaign-description">{{ campaign.descripcion }}</p>
          </div>
        </div>
      </div>

      <div v-if="campaign.productos && campaign.productos.length > 0" class="products-section">
        <div class="section-header">
          <h2 class="products-title">Productos Destacados</h2>
          <div class="products-count">{{ campaign.productos.length }} productos disponibles</div>
        </div>
        
        <div class="products-grid">
          <div v-for="product in campaign.productos" :key="product.id" class="product-card">
            <div class="product-image-container">
              <img 
                :src="`${API_BASE_URL}${product.imagenUrl}`" 
                :alt="product.nombre" 
                @error="$event.target.src = 'https://placehold.co/400x300/4A90E2/ffffff?text=Sin+Imagen'"
                class="product-image"
              />
              <div class="image-overlay"></div>
              <div v-if="product.stock <= 0" class="stock-badge out-of-stock">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
                Agotado
              </div>
              <div v-else class="stock-badge in-stock">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                Disponible
              </div>
            </div>
            
            <div class="product-content">
              <h3 class="product-name">{{ product.nombre }}</h3>
              
              <div class="product-footer">
                <div class="points-container">
                  <div class="points-badge">
                    <svg class="points-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <div class="points-info">
                      <span class="points-value">{{ product.precioPuntos }}</span>
                      <span class="points-label">Puntos</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="cartStore.agregarAlCarrito(product.id, $event)" 
                  class="btn-add-cart" 
                  :disabled="product.stock <= 0"
                  :class="{ 'btn-disabled': product.stock <= 0 }"
                >
                  <svg v-if="product.stock > 0" class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                  </svg>
                  <svg v-else class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                  </svg>
                  <span>{{ product.stock > 0 ? 'Agregar' : 'Agotado' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-products">
        <svg class="empty-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="3" opacity="0.2"/>
          <path d="M32 20v24M20 32h24" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.3"/>
        </svg>
        <h3>Sin productos disponibles</h3>
        <p>Esta campaña no tiene productos en este momento.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useCartStore } from '../../stores/cartStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const emit = defineEmits(['redemption-successful']);
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
    const { data } = await axios.get(`${API_BASE_URL}/api/campanas/${campaignId}`, getAuthHeaders());
    campaign.value = data;
  } catch (error) {
    console.error("Error al cargar los productos de la campaña:", error);
  } finally {
    loading.value = false;
  }
};

const cartStore = useCartStore();

onMounted(fetchCampaignProducts);
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.product-page-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0 1.5rem 2rem;
  color: var(--text-color);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.back-link:hover {
  color: #ffffff;
  background: rgba(43, 127, 255, 0.25);
  transform: translateX(-3px);
}

:root {
  --text-color: #000000;
}

.dark {
  --text-color: #ffffff;
}

.campaign-banner {
  position: relative;
  width: 95%;
  height: 320px;
  background-size: cover;
  background-position: center;
  background-color: #638de9;
  overflow: hidden;
  margin: 0 auto 2rem auto;
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); 
}

.banner-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(204, 21, 21, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.campaign-banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(43, 128, 255, 0.15) 0%, 
    rgba(26, 96, 217, 0.5) 50%,
    rgba(43, 128, 255, 0.15) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
  border-radius: 24px;
}

.campaign-header {
  text-align: center;
  color: white;
  padding: 2rem;
  max-width: 900px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.campaign-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.75rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.campaign-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}


.products-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.products-title {
  font-size: 2rem;
  font-weight: 800;
  color: #030303;
  margin: 0;
  position: relative;
  text-align: center;
}

.products-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #2b7fff, #1a5fd9);
  border-radius: 2px;
}

.products-count {
  font-size: 0.95rem;
  color: #ffffff;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: #2b7fff;
  border-radius: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}


.product-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 
              0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.product-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15),
              0 12px 24px -8px rgba(43, 127, 255, 0.2);
  border-color: rgba(43, 127, 255, 0.1);
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-image {
  transform: scale(1.15) rotate(2deg);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.product-card:hover .image-overlay {
  opacity: 1;
}

.stock-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.out-of-stock {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
  color: white;
}

.in-stock {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
  color: white;
}

.product-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 1.25rem;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  margin: 0;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: #2b7fff;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
}

.points-container {
  flex-grow: 1;
}

.points-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #2b7fff 0%, #1a5fd9 100%);
  padding: 1rem 1.25rem;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(43, 127, 255, 0.25);
  transition: all 0.3s ease;
}

.product-card:hover .points-badge {
  box-shadow: 0 6px 20px rgba(43, 127, 255, 0.35);
  transform: translateY(-2px);
}

.points-icon {
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.points-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.points-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.points-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.btn-add-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #2b7fff 0%, #1a5fd9 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(43, 127, 255, 0.3);
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-add-cart:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 24px rgba(43, 127, 255, 0.4);
  background: linear-gradient(135deg, #1a5fd9 0%, #0d4db8 100%);
}

.btn-add-cart:active:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
}

.btn-add-cart.btn-disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* Estados vacíos */
.no-products {
  text-align: center;
  padding: 6rem 2rem;
  color: #64748b;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: #cbd5e1;
}

.no-products h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.5rem;
}

.no-products p {
  font-size: 1.05rem;
  color: #94a3b8;
}

/* Loading state mejorado */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rem 2rem;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #2b7fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.125rem;
  color: #64748b;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.75rem;
  }
}

@media (max-width: 768px) {
  .campaign-banner {
    height: 280px;
  }
  
  .campaign-title {
    font-size: 2.25rem;
  }
  
  .campaign-description {
    font-size: 1.05rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .products-section {
    padding: 0 1rem 3rem 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .products-title {
    font-size: 1.5rem;
  }
  
  .back-link {
    margin-left: 1rem;
  }
}
</style>