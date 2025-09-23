<template>
  <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
    <div class="py-10 space-y-16">
      <section class="text-center">
        <h2 class="text-3xl font-bold text-[var(--text)] mb-8">Categorías</h2>
        <div v-if="loading" class="text-center text-gray-500">Cargando categorías...</div>
        <div v-else-if="categorias.length === 0" class="text-center text-gray-500">
          <p>No hay categorías con productos disponibles en este momento.</p>
        </div>
        <div v-else class="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          <div
            v-for="cat in categorias"
            :key="cat.id"
            class="category-item group"
            @click="seleccionarCategoria(cat.id)"
          >
            <div
              class="category-icon-wrapper"
              :class="{ 'selected': categoriaSeleccionadaId === cat.id }"
            >
              <Icon :icon="cat.icon" class="text-3xl text-blue-600" />
            </div>
            <p class="category-name capitalize">{{ cat.nombre }}</p>
          </div>
        </div>
      </section>

      <section v-if="categoriaSeleccionadaId" class="text-center">
        <h3 class="text-3xl font-bold text-[var(--text)] mb-8 capitalize">Productos de {{ categoriaSeleccionadaNombre }}</h3>
        <div v-if="loadingProductos" class="text-center text-gray-500 mt-10">Cargando productos...</div>
        <div v-else-if="productosPaginados.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="producto in productosPaginados"
              :key="producto.id"
              class="product-card"
            >
              <img
                :src="`${API_BASE_URL}${producto.imagenUrl}`"
                :alt="producto.nombre"
                @error="$event.target.src = 'https://placehold.co/400x300/e2e8f0/a0aec0?text=Producto'"
                class="w-full h-40 object-cover rounded-t-xl"
              />
              <div class="p-4 flex-grow flex flex-col">
                <h3 class="text-lg font-semibold text-[var(--text)]">{{ producto.nombre }}</h3>
                <p class="text-indigo-600 font-bold my-2">{{ producto.precioPuntos }} Puntos</p>
                <button
                  @click="cartStore.agregarAlCarrito(producto.id, $event)"
                  class="mt-auto w-full px-5 py-2 bg-[#74B9E7] text-black font-semibold rounded-lg hover:bg-[#FFB93B] transition"
                  :disabled="producto.stock <= 0"
                >
                  {{ producto.stock > 0 ? 'Agregar al Carrito' : 'Agotado' }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-center items-center gap-2 mt-8">
            <button @click="paginaActual--" :disabled="paginaActual === 1" class="pagination-btn">Anterior</button>
            <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button @click="paginaActual++" :disabled="paginaActual === totalPaginas" class="pagination-btn">Siguiente</button>
          </div>
        </div>
        <p v-else class="text-center text-gray-500 mt-10">No hay productos disponibles en esta categoría.</p>
      </section>

      <section>
        <h2 class="text-3xl font-bold text-[var(--text)] mb-8 text-center">Campañas Activas</h2>
        <div v-if="loading" class="text-center text-gray-500">Cargando campañas...</div>
        <div v-else-if="campanasFiltradas.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="campana in campanasFiltradas"
            :key="campana.id"
            class="campaign-card"
          >
            <div class="p-6 flex flex-col justify-between h-full">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <h3 class="text-lg font-semibold text-[var(--text)]">{{ campana.titulo }}</h3>
                  <span class="px-3 py-1 text-xs rounded-full font-medium bg-yellow-400 text-black">Activa</span>
                </div>
                <p class="text-sm text-gray-600 mb-6 line-clamp-3">{{ campana.descripcion }}</p>
              </div>
              <button
                class="w-full mt-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                @click="verCampana(campana)"
              >
                Ver campaña
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-center text-gray-500 mt-10">No hay campañas activas en este momento.</p>
      </section>
    </div>
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
const cartStore = useCartStore();

const categorias = ref([]);
const campanas = ref([]);
const productos = ref([]);
const loading = ref(true);
const loadingProductos = ref(false);
const categoriaSeleccionadaId = ref(null);
const paginaActual = ref(1);
const productosPorPagina = PAGINATION.PRODUCTS || 6;

const iconMap = {
  'moda': 'mdi:tshirt-crew',
  'tecnologia': 'mdi:laptop',
  'cocina': 'mdi:silverware-fork-knife',
  'hogar': 'mdi:lamp',
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
    
    // ✅ CORRECCIÓN: Filtrar categorías con productos y luego mapear
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

const productosFiltrados = computed(() => {
  if (!categoriaSeleccionadaId.value) return [];
  return productos.value.filter(p => p.categoriaId === categoriaSeleccionadaId.value && p.estado);
});

const totalPaginas = computed(() => Math.ceil(productosFiltrados.value.length / productosPorPagina));

const productosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * productosPorPagina;
  return productosFiltrados.value.slice(start, start + productosPorPagina);
});

const categoriaSeleccionadaNombre = computed(() => {
  return categorias.value.find(c => c.id === categoriaSeleccionadaId.value)?.nombre || '';
});

const campanasFiltradas = computed(() => campanas.value.filter(c => c.aprobada));

const seleccionarCategoria = (id) => {
  if (categoriaSeleccionadaId.value === id) {
    categoriaSeleccionadaId.value = null;
  } else {
    categoriaSeleccionadaId.value = id;
    paginaActual.value = 1;
  }
};

const verCampana = (campana) => {
  router.push(`/tienda/campana/${campana.id}`);
};
</script>

<style scoped lang="postcss">
/* Estilos para los nuevos elementos de categoría */
.category-item {
  @apply flex flex-col items-center cursor-pointer transition-transform duration-200;
}
.category-item:hover {
  @apply transform -translate-y-1;
}
.category-icon-wrapper {
  @apply w-20 h-20 flex items-center justify-center rounded-full shadow-md bg-[var(--surface)] border-2 border-transparent transition-all duration-200;
}
.category-icon-wrapper.selected {
  @apply border-blue-500 scale-110 shadow-lg;
}
.category-name {
  @apply mt-2 text-[var(--text-muted)] font-medium;
}

/* Estilos para las tarjetas de campaña y productos */
.campaign-card, .product-card {
  @apply bg-[var(--surface)] rounded-xl shadow-md flex flex-col transition-all duration-300;
}
.campaign-card:hover, .product-card:hover {
  @apply shadow-xl -translate-y-1;
}

/* Paginación */
.pagination-btn {
  @apply px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition;
}
</style>