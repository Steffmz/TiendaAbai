<template>
  <div class="space-y-16">
    <section class="text-center space-y-12">
      <h3 class="text-3xl font-extrabold text-black">Categorías</h3>
      <div v-if="loading" class="text-center">Cargando categorías...</div>
      <div v-else class="flex flex-wrap justify-center gap-8">
        <div
          v-for="cat in categorias"
          :key="cat.id"
          class="flex flex-col items-center cursor-pointer group"
          @click="seleccionarCategoria(cat.id)"
        >
          <div
            class="w-20 h-20 flex items-center justify-center rounded-full shadow-md bg-white border-2 transition group-hover:scale-110"
            :class="{ 'border-blue-400 scale-110': categoriaSeleccionadaId === cat.id }"
          >
            <img v-if="cat.imagenUrl" :src="`${API_BASE_URL}${cat.imagenUrl}`" @error="handleImageError(cat)" class="w-full h-full object-cover rounded-full" />
            <Icon v-else :icon="cat.icono || 'mdi:tag'" class="text-3xl text-blue-700" />
          </div>
          <p class="mt-2 text-gray-700 font-medium">{{ cat.nombre }}</p>
        </div>
      </div>
    </section>

    <section v-if="categoriaSeleccionadaId" class="text-center space-y-12">
        <h3 class="text-3xl font-extrabold text-black">Productos de {{ categoriaSeleccionadaNombre }}</h3>
        <div v-if="loadingProductos" class="text-center">Cargando productos...</div>
        <div v-else-if="productosPaginados.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div v-for="producto in productosPaginados" :key="producto.id" class="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition transform overflow-hidden flex flex-col">
                    <div class="relative">
                        <img :src="`${API_BASE_URL}${producto.imagenUrl}`" @error="$event.target.src = 'https://placehold.co/400x300/e2e8f0/a0aec0?text=Producto'" alt="producto" class="h-48 w-full object-cover" />
                        <span class="absolute top-3 right-3 bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">{{ producto.precioPuntos }} Pts</span>
                    </div>
                    <div class="p-5 flex-1 flex flex-col">
                        <h4 class="text-lg font-bold text-gray-800 mb-2">{{ producto.nombre }}</h4>
                        <p class="text-sm text-gray-600 flex-1">{{ producto.descripcion || "Un producto increíble te espera." }}</p>
                    </div>
                    <div class="p-5 border-t flex justify-center">
                        <button @click="verMas" class="px-5 py-2 bg-[#74B9E7] text-black font-medium rounded-lg hover:bg-[#FFB93B] transition">
                            Ver más
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex justify-center items-center gap-2 mt-8">
                <button @click="paginaActual--" :disabled="paginaActual === 1" class="px-4 py-2 rounded bg-gray-200 disabled:opacity-50">&laquo; Anterior</button>
                <span class="px-4 py-2 font-semibold">Página {{ paginaActual }} de {{ totalPaginas }}</span>
                <button @click="paginaActual++" :disabled="paginaActual === totalPaginas" class="px-4 py-2 rounded bg-gray-200 disabled:opacity-50">Siguiente &raquo;</button>
            </div>
        </div>
        <div v-else class="text-center text-gray-500 mt-10">
            <p>No hay productos en esta categoría.</p>
        </div>
    </section>


    <section class="text-center space-y-12">
      <h3 class="text-3xl font-extrabold text-black">Destacados</h3>
      <div v-if="loading" class="text-center">Cargando...</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="item in destacados"
          :key="item.id"
          class="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition transform overflow-hidden flex flex-col"
        >
          <div class="relative">
            <img :src="`${API_BASE_URL}${item.imagenUrl}`" @error="$event.target.src = 'https://placehold.co/400x300/e2e8f0/a0aec0?text=Producto'" alt="producto" class="h-48 w-full object-cover" />
            <span
              class="absolute top-3 left-3 bg-[#FFB93B] text-black text-xs font-semibold px-3 py-1 rounded-full shadow"
            >
              Destacado
            </span>
             <span class="absolute top-3 right-3 bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">{{ item.precioPuntos }} Pts</span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <h4 class="text-lg font-bold text-gray-800 mb-2">{{ item.nombre }}</h4>
            <p class="text-sm text-gray-600 flex-1">
              {{ item.descripcion || "Descubre esta novedad pensada para ti." }}
            </p>
          </div>
          <div class="p-5 border-t flex justify-center">
            <button @click="verMas" class="px-5 py-2 bg-[#74B9E7] text-black font-medium rounded-lg hover:bg-[#FFB93B] transition">
              Ver más
            </button>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import Swal from "sweetalert2";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const categorias = ref([]);
const productos = ref([]);
const loading = ref(true);
const loadingProductos = ref(false);
const categoriaSeleccionadaId = ref(null);

// Paginación
const paginaActual = ref(1);
const productosPorPagina = 4; // Puedes ajustar este número

const cargarDatos = async () => {
  loading.value = true;
  try {
    const [resCategorias, resProductos] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/categorias`),
      axios.get(`${API_BASE_URL}/api/productos`)
    ]);
    categorias.value = resCategorias.data.filter(c => c.activo && c._count.productos > 0);
    productos.value = resProductos.data.filter(p => p.estado);
  } catch (error) {
    console.error("Error al cargar datos:", error);
    Swal.fire('Error', 'No se pudieron cargar los datos de la tienda.', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(cargarDatos);

const seleccionarCategoria = (id) => {
    if (categoriaSeleccionadaId.value === id) {
        // Si se hace clic en la misma categoría, se deselecciona
        categoriaSeleccionadaId.value = null;
    } else {
        categoriaSeleccionadaId.value = id;
        paginaActual.value = 1; // Resetea la página al cambiar de categoría
    }
};

// Función para manejar errores de carga de imagen y mostrar el icono
const handleImageError = (category) => {
  category.imagenUrl = null; // Elimina la URL de la imagen para que se renderice el icono
};


const productosFiltrados = computed(() => {
  if (!categoriaSeleccionadaId.value) return [];
  return productos.value.filter(p => p.categoriaId === categoriaSeleccionadaId.value);
});

const categoriaSeleccionadaNombre = computed(() => {
    if (!categoriaSeleccionadaId.value) return '';
    const categoria = categorias.value.find(c => c.id === categoriaSeleccionadaId.value);
    return categoria ? categoria.nombre : '';
});


const totalPaginas = computed(() => Math.ceil(productosFiltrados.value.length / productosPorPagina));

const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  return productosFiltrados.value.slice(inicio, fin);
});


const destacados = computed(() => {
  return [...productos.value]
    .sort((a, b) => b.precioPuntos - a.precioPuntos)
    .slice(0, 4);
});

const verMas = () => {
  Swal.fire({
    icon: "info",
    title: "Inicia sesión",
    text: "Debes iniciar sesión para ver más detalles del producto.",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#2563eb",
  });
};

</script>