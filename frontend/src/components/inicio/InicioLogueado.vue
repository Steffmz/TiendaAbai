<template>
  <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
    <section class="py-10 space-y-12">
      <div>
        <h2 class="text-2xl font-bold text-center mb-8">Categorías</h2>
        <div v-if="loading" class="text-center text-gray-500">Cargando categorías...</div>
        <div v-else class="category-grid">
          <div v-for="categoria in categorias" :key="categoria.id" 
               class="category-card"
               :class="{ 'active': categoriaSeleccionadaId === categoria.id }"
               @click="seleccionarCategoria(categoria.id)">
            <div class="icon-wrapper">
              <Icon :icon="categoria.icon || 'mdi:tag-heart'" class="category-icon" />
            </div>
            <p class="category-name">{{ categoria.nombre }}</p>
          </div>
        </div>
      </div>

      <div v-if="categoriaSeleccionadaId">
        <h3 class="text-2xl font-bold text-center mb-8 capitalize">Productos de {{ categoriaSeleccionadaNombre }}</h3>
        <div v-if="loadingProductos" class="text-center text-gray-500 mt-10">Cargando productos...</div>
        <div v-else-if="productosPaginados.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div v-for="producto in productosPaginados" :key="producto.id"
              class="product-card">
              <img :src="`${API_BASE_URL}${producto.imagenUrl}`" :alt="producto.nombre"
                @error="$event.target.src = 'https://placehold.co/400x300/e2e8f0/a0aec0?text=Producto'"
                class="product-image" />
              <div class="product-info">
                  <h3 class="product-name">{{ producto.nombre }}</h3>
                  <p class="product-points">{{ producto.precioPuntos }} Puntos</p>
                  <button @click="cartStore.agregarAlCarrito(producto.id, $event)"
                    class="btn-add-cart">
                    Agregar al Carrito
                  </button>
              </div>
            </div>
          </div>
          
          <div class="flex justify-center items-center gap-2 mt-8">
            <button @click="paginaActual--" :disabled="paginaActual === 1" class="pagination-btn">Anterior</button>
            <span class="pagination-info">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button @click="paginaActual++" :disabled="paginaActual === totalPaginas" class="pagination-btn">Siguiente</button>
          </div>
        </div>
        <p v-else class="text-center text-gray-500 mt-10">
          No hay productos disponibles en esta categoría.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-center mb-8">Campañas Activas</h2>
        <div v-if="loading" class="text-center text-gray-500">Cargando...</div>
        <div v-else-if="campanasFiltradas.length === 0" class="text-center text-gray-500">No hay campañas activas en este momento.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="campana in campanasFiltradas" :key="campana.id"
            class="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ campana.titulo }}</h3>
              <span class="px-3 py-1 text-xs rounded-full font-medium bg-yellow-400 text-black">Activa</span>
            </div>
            <p class="text-sm text-gray-600 mb-6 line-clamp-3">{{ campana.descripcion }}</p>
            <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition self-end"
              @click="verCampana(campana)">
              Ver campaña
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from 'axios';
import Swal from "sweetalert2";
import { useCartStore } from '../../stores/cartStore';
import { PAGINATION } from '../../config';
import { Icon } from "@iconify/vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();
const categorias = ref([]);
const campanas = ref([]);
const productos = ref([]);
const loading = ref(true);
const loadingProductos = ref(false);
const categoriaSeleccionadaId = ref(null);

const iconMap = {
  'cocina': 'mdi:silverware-fork-knife',
  'tecnologia': 'mdi:laptop',
  'hogar': 'mdi:lamp',
  'moda': 'mdi:tshirt-crew',
  'deportes': 'mdi:weight-lifter',
  'turismo': 'mdi:palm-tree'
};

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const cargarDatosIniciales = async () => {
  loading.value = true;
  try {
    const [resCategorias, resCampanas, resProductos] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/categorias`, getAuthHeaders()),
      axios.get(`${API_BASE_URL}/api/campanas`, getAuthHeaders()),
      axios.get(`${API_BASE_URL}/api/productos`, getAuthHeaders()),
    ]);
    categorias.value = resCategorias.data
      .filter(c => c.activo && c._count.productos > 0)
      .map(c => ({
        ...c,
        icon: iconMap[c.nombre.toLowerCase()] || 'mdi:tag-heart'
      }));
    campanas.value = resCampanas.data;
    productos.value = resProductos.data;
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar los datos de la tienda.', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(cargarDatosIniciales);

const seleccionarCategoria = (id) => {
    if (categoriaSeleccionadaId.value === id) {
        categoriaSeleccionadaId.value = null; // Deseleccionar si se hace clic de nuevo
    } else {
        categoriaSeleccionadaId.value = id;
        paginaActual.value = 1;
    }
};

const paginaActual = ref(1);
const productosPorPagina = PAGINATION.PRODUCTS;

const productosFiltrados = computed(() => {
  if (!categoriaSeleccionadaId.value) return [];
  return productos.value.filter(p => p.categoriaId === categoriaSeleccionadaId.value);
});

const categoriaSeleccionadaNombre = computed(() => {
    return categorias.value.find(c => c.id === categoriaSeleccionadaId.value)?.nombre || '';
});

const totalPaginas = computed(() => Math.ceil(productosFiltrados.value.length / productosPorPagina));

const productosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * productosPorPagina;
  return productosFiltrados.value.slice(start, start + productosPorPagina);
});

const campanasFiltradas = computed(() => campanas.value.filter(c => c.aprobada === true));

const verCampana = (campana) => {
  router.push(`/tienda/campana/${campana.id}`);
};

const cartStore = useCartStore();
</script>

<style scoped>
/* Estilos para las nuevas tarjetas de categoría */
.category-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.category-card:hover {
  transform: translateY(-5px);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--surface);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.category-card.active .icon-wrapper {
  border-color: var(--primary);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(43, 127, 255, 0.5);
}

.category-icon {
  font-size: 2.5rem;
  color: var(--primary);
}

.category-name {
  margin-top: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: capitalize;
}

.category-card.active .category-name {
  color: var(--primary);
  font-weight: 600;
}

/* Estilos mejorados para tarjetas de producto */
.product-card {
    background: var(--surface);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}
.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}
.product-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
}
.product-info {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.product-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.5rem;
}
.product-points {
    font-size: 1rem;
    font-weight: bold;
    color: var(--primary);
    margin-bottom: 1rem;
}
.btn-add-cart {
    margin-top: auto;
    width: 100%;
    padding: 0.6rem;
    background-color: var(--primary);
    color: var(--primary-contrast);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

/* Estilos para paginación */
.pagination-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background-color: var(--surface-2);
    border: 1px solid var(--border);
}
.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.pagination-info {
    font-weight: 500;
}
</style>