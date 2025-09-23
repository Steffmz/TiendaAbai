<template>
  <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
    <section class="py-10 space-y-12">
      <!-- Categorías --> 
      <div>
        <h2 class="text-2xl font-bold text-center mb-8">Categorías</h2>
        <div class="flex items-center justify-center gap-4 mb-6">
          <label for="categoria" class="text-lg font-semibold text-gray-700">Seleccionar categoría:</label>
          <select
            id="categoria"
            v-model="categoriaSeleccionadaId"
            @change="filtrarProductos"
            class="border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300 min-w-[250px]"
          >
            <option :value="null">-- Selecciona una categoría --</option>
            <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
              {{ categoria.nombre }}
            </option>
          </select>
        </div>

        <!-- Productos -->
        <div v-if="loadingProductos" class="text-center text-gray-500 mt-10">
          Cargando productos...
        </div>

        <div v-else-if="productosFiltrados.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div
              v-for="producto in productosPaginados"
              :key="producto.id"
              class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition flex flex-col"
            >
              <!-- Imagen -->
              <img
                :src="`${API_BASE_URL}${producto.imagenUrl}`"
                :alt="producto.nombre"
                @error="$event.target.src = 'https://placehold.co/400x300/e2e8f0/a0aec0?text=Producto'"
                class="w-full h-40 object-cover rounded-lg mb-3"
              />

          <div class="flex-grow flex flex-col items-center justify-center text-center">
            <h3 class="text-lg font-semibold">{{ producto.nombre }}</h3>
            <p class="text-gray-600">{{ producto.descripcion }}</p>
            <p class="text-indigo-600 font-bold mt-2">{{ producto.precioPuntos }} Puntos</p>
          </div>

              <!-- Botón --> 
              <button
                @click="cartStore.agregarAlCarrito(producto.id, $event)"
                class="mt-auto px-5 py-2 bg-[#74B9E7] text-black font-medium rounded-lg hover:bg-[#FFB93B] transition w-full"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>

          <!-- Paginación -->
          <div class="flex justify-center items-center gap-2 mt-6">
            <button
              @click="paginaActual--"
              :disabled="paginaActual === 1"
              class="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              Anterior
            </button>
            <span class="px-3 py-1 font-semibold">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button
              @click="paginaActual++"
              :disabled="paginaActual === totalPaginas"
              class="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>

        <p v-else class="text-center text-gray-500 mt-10">
          Selecciona una categoría para ver sus productos.
        </p>
      </div>

      <!-- Campañas -->
      <div>
        <h2 class="text-2xl font-bold text-center mb-8">Campañas Activas</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="campana in campanasFiltradas"
            :key="campana.id"
            class="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition"
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ campana.titulo }}</h3>
              <span class="px-3 py-1 text-xs rounded-full font-medium bg-yellow-400 text-black">Activa</span>
            </div>
            <p class="text-sm text-gray-600 mb-6 line-clamp-3">{{ campana.descripcion }}</p>
            <button
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition self-end"
              @click="verCampana(campana)"
            >
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();
const categorias = ref([]);
const campanas = ref([]);
const productos = ref([]);
const loading = ref(true);
const loadingProductos = ref(false);
const categoriaSeleccionadaId = ref(null);

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const cargarDatosIniciales = async () => {
  loading.value = true;
  try {
    const [resCategorias, resCampanas, resProductos] = await Promise.all([
      axios.get('http://localhost:3000/api/categorias', getAuthHeaders()),
      axios.get('http://localhost:3000/api/campanas', getAuthHeaders()),
      axios.get('http://localhost:3000/api/productos', getAuthHeaders()),
    ]);
    categorias.value = resCategorias.data;
    campanas.value = resCampanas.data;
    productos.value = resProductos.data;
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar los datos de la tienda.', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(cargarDatosIniciales);

const paginaActual = ref(1);
const productosPorPagina = PAGINATION.PRODUCTS;;

const productosFiltrados = computed(() => {
  if (!categoriaSeleccionadaId.value) {
    return [];
  }
  const categoriaNombre = categorias.value.find(c => c.id === categoriaSeleccionadaId.value)?.nombre;
  if (!categoriaNombre) return [];

  return productos.value.filter(
    (p) => p.categoria.nombre === categoriaNombre
  );
});

const totalPaginas = computed(() => Math.ceil(productosFiltrados.value.length / productosPorPagina));
const productosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * productosPorPagina;
  return productosFiltrados.value.slice(start, start + productosPorPagina);
});

function filtrarProductos() {
  paginaActual.value = 1;
}

const campanasFiltradas = computed(() => campanas.value.filter(c => c.aprobada === true));

const verCampana = (campana) => {
  router.push(`/tienda/campana/${campana.id}`);
};

const formatearFecha = (f) => new Date(f).toLocaleDateString('es-CO');
const cartStore = useCartStore();

</script>