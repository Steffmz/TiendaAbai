<template>
  <div class="store-container">
    <div class="store-header">
      <h1>Catálogo de Canjes</h1>
      <p>Usa tus puntos para canjear increíbles productos y experiencias.</p>
    </div>

    <div v-if="loading" class="loading-state">
      Cargando campañas...
    </div>
    
    <div v-else class="campaigns-grid">
      <div v-for="campana in campanasActivas" :key="campana.id" class="campaign-card">
        <div class="campaign-image">
          <img 
            :src="`http://localhost:3000${campana.imagenUrl}`" 
            alt="Imagen de campaña" 
            @error="$event.target.src = 'https://placehold.co/400x200/e2e8f0/a0aec0?text=Sin+Imagen'"
          />
        </div>
        <div class="campaign-content">
          <h3>{{ campana.titulo }}</h3>
          <p class="campaign-dates">Válido del {{ formatDate(campana.fechaInicio) }} al {{ formatDate(campana.fechaFin) }}</p>
          
          <router-link :to="`/campana/${campana.id}`" class="btn-view">
            Ver Productos
          </router-link>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const campanas = ref([]);
const loading = ref(true);

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const campanasActivas = computed(() => 
  campanas.value.filter(c => c.aprobada)
);

const fetchCampanas = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get('http://localhost:3000/api/campanas', getAuthHeaders());
    campanas.value = data;
  } catch (error) {
    console.error("Error al cargar campañas:", error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO');

onMounted(fetchCampanas);
</script>

<style scoped>
.store-header {
  text-align: center;
  margin-bottom: 2.5rem;
}
.store-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
}
.store-header p {
  font-size: 1.125rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.campaign-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}
.campaign-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

.campaign-image img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.campaign-content {
  padding: 1.5rem;
}
.campaign-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}
.campaign-dates {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.5rem 0 1rem;
}

.btn-view {
  display: block;
  text-align: center;
  text-decoration: none;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary);
  color: var(--primary-contrast);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}
.btn-view:hover {
  background-color: #1d4ed8;
}
</style>
