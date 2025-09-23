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
            <Icon :icon="cat.icon" class="text-3xl text-blue-700" />
          </div>
          <p class="mt-2 text-gray-700 font-medium capitalize">{{ cat.nombre }}</p>
        </div>
      </div>
    </section>

    <section v-if="categoriaSeleccionadaId" class="text-center space-y-12">
        <h3 class="text-3xl font-extrabold text-black capitalize">Productos de {{ categoriaSeleccionadaNombre }}</h3>
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
                        <button @click="verProducto(producto)" class="px-5 py-2 bg-[#74B9E7] text-black font-medium rounded-lg hover:bg-[#FFB93B] transition">
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
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="item in destacados"
          :key="item.id"
          class="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition transform overflow-hidden flex flex-col"
        >
          <div class="relative">
            <img :src="`${API_BASE_URL}${item.imagenUrl}`" @error="$event.target.src = 'https://placehold.co/400x300/e2e8f0/a0aec0?text=Producto'" alt="producto" class="h-48 w-full object-cover" />
            <span class="absolute top-3 left-3 bg-[#FFB93B] text-black text-xs font-semibold px-3 py-1 rounded-full shadow">Destacado</span>
            <span class="absolute top-3 right-3 bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">{{ item.precioPuntos }} Pts</span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <h4 class="text-lg font-bold text-gray-800 mb-2">{{ item.nombre }}</h4>
            <p class="text-sm text-gray-600 flex-1">{{ item.descripcion || "Descubre esta novedad pensada para ti." }}</p>
          </div>
          <div class="p-5 border-t flex justify-center">
            <button @click="verProducto(item)" class="px-5 py-2 bg-[#74B9E7] text-black font-medium rounded-lg hover:bg-[#FFB93B] transition">
              Ver más
            </button>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-bold text-center mb-8">Campañas Activas</h2>
      <div v-if="loading" class="text-center">Cargando campañas...</div>
      <div v-else-if="campanasActivas.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        <div
          v-for="campana in campanasActivas"
          :key="campana.id"
          class="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">{{ campana.titulo }}</h3>
            <span class="px-3 py-1 text-xs rounded-full font-medium bg-yellow-400 text-black">Activa</span>
          </div>
          <p class="text-sm text-gray-600 mb-6">{{ campana.descripcion }}</p>
          <button
            class="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition self-end"
            @click="verCampana(campana)"
          >
            Ver campaña
          </button>
        </div>
      </div>
       <div v-else class="text-center text-gray-500">
        <p>No hay campañas activas en este momento.</p>
      </div>
    </section>

    <div v-if="modalAbierto" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm" @click="cerrarModal">
      <div class="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg relative transform transition-all scale-100" @click.stop>
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition" @click="cerrarModal">✕</button>
        <div class="w-full flex justify-center mb-4">
          <img v-if="campanaSeleccionada.imagenUrl" :src="`${API_BASE_URL}${campanaSeleccionada.imagenUrl}`" alt="Imagen campaña" class="rounded-xl shadow-md object-cover max-h-44 w-auto" />
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-3 text-center">{{ campanaSeleccionada.titulo }}</h3>
        <p class="text-gray-600 mb-4 text-center text-sm leading-relaxed">{{ campanaSeleccionada.descripcion }}</p>
        <div class="flex justify-between text-xs text-gray-500 mb-4 border-t pt-2">
          <p><strong>Inicio:</strong> {{ new Date(campanaSeleccionada.fechaInicio).toLocaleDateString() }}</p>
          <p><strong>Fin:</strong> {{ new Date(campanaSeleccionada.fechaFin).toLocaleDateString() }}</p>
        </div>
        <div class="flex justify-around text-sm text-gray-700 mb-4">
          <p class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">Puntos: {{ campanaSeleccionada.puntos || "N/A" }}</p>
          <p class="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium">Descuento: {{ campanaSeleccionada.descuento ? campanaSeleccionada.descuento + "%" : "N/A" }}</p>
        </div>
        <h4 class="font-semibold text-gray-800 mb-2">Productos incluidos:</h4>
        <ul class="list-disc list-inside text-sm text-gray-600 space-y-1 max-h-28 overflow-y-auto">
          <li v-for="producto in campanaSeleccionada.productos" :key="producto.id">{{ producto.nombre }} - {{ producto.precioPuntos }} pts</li>
          <li v-if="!campanaSeleccionada.productos || campanaSeleccionada.productos.length === 0">No hay productos asociados</li>
        </ul>
        <div class="flex justify-center mt-6">
          <button class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg hover:from-blue-500 hover:to-blue-700 transition" @click="participarCampana">
            Participar en la campaña
          </button>
        </div>
      </div>
    </div>

    <div v-if="productoModalAbierto" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm" @click="cerrarProductoModal">
      <div class="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg relative transform transition-all scale-100" @click.stop>
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition" @click="cerrarProductoModal">✕</button>
        <div class="w-full flex justify-center mb-4">
          <img v-if="productoSeleccionado.imagenUrl" :src="`${API_BASE_URL}${productoSeleccionado.imagenUrl}`" alt="Imagen producto" class="rounded-xl shadow-md object-cover max-h-52 w-auto" />
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-3 text-center">{{ productoSeleccionado.nombre }}</h3>
        <p class="text-gray-600 mb-4 text-center text-sm leading-relaxed">{{ productoSeleccionado.descripcion || 'No hay descripción disponible para este producto.' }}</p>
        <div class="text-center my-4">
          <span class="text-2xl font-bold text-blue-600">{{ productoSeleccionado.precioPuntos }} Puntos</span>
        </div>
        <div class="flex justify-center mt-6">
          <button class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg hover:from-blue-500 hover:to-blue-700 transition" @click="iniciarSesionParaComprar">
            Iniciar Sesión para Canjear
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import Swal from "sweetalert2";
import axios from 'axios';
import { useRouter } from 'vue-router';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();

const iconMap = {
  'cocina': 'mdi:silverware-fork-knife',
  'tecnologia': 'mdi:laptop',
  'hogar': 'mdi:lamp',
  'moda': 'mdi:tshirt-crew',
  'deportes': 'mdi:weight-lifter',
  'turismo': 'mdi:palm-tree'
};

// Refs para datos
const categorias = ref([]);
const productos = ref([]);
const campanas = ref([]);
const loading = ref(true);
const loadingProductos = ref(false);

// Refs para estado de la UI
const categoriaSeleccionadaId = ref(null);
const modalAbierto = ref(false);
const campanaSeleccionada = ref({});
const productoModalAbierto = ref(false);
const productoSeleccionado = ref(null);

// Paginación
const paginaActual = ref(1);
const productosPorPagina = 4;

const cargarDatos = async () => {
  loading.value = true;
  try {
    const [resCategorias, resProductos, resCampanas] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/categorias`),
      axios.get(`${API_BASE_URL}/api/productos`),
      axios.get(`${API_BASE_URL}/api/campanas`)
    ]);
    
    categorias.value = resCategorias.data
      .filter(c => c.activo && c._count.productos > 0)
      .map(c => ({
        ...c,
        icon: iconMap[c.nombre.toLowerCase()] || 'mdi:tag-heart' 
      }));

    productos.value = resProductos.data.filter(p => p.estado);
    campanas.value = resCampanas.data;
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
        categoriaSeleccionadaId.value = null;
    } else {
        categoriaSeleccionadaId.value = id;
        paginaActual.value = 1;
    }
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

const campanasActivas = computed(() => campanas.value.filter(c => c.aprobada));

const verCampana = (campana) => {
  campanaSeleccionada.value = campana;
  modalAbierto.value = true;
};
const cerrarModal = () => (modalAbierto.value = false);

const verProducto = (producto) => {
  productoSeleccionado.value = producto;
  productoModalAbierto.value = true;
};

const cerrarProductoModal = () => {
  productoModalAbierto.value = false;
};

const iniciarSesionParaComprar = () => {
  cerrarProductoModal();
  Swal.fire({
    icon: "info",
    title: "Inicia sesión para continuar",
    text: "Debes iniciar sesión para poder canjear este producto.",
    confirmButtonText: "Ir a Iniciar Sesión",
    showCancelButton: true,
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      router.push('/login');
    }
  });
};

const participarCampana = () => {
  iniciarSesionParaComprar();
};
</script>