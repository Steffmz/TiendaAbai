<template>
  <section class="py-10 px-6 space-y-12">
    <!-- Selección de Categorías -->
    <div>
      <h2 class="text-2xl font-bold text-center mb-8">Categorías</h2>
      <div class="flex items-center justify-center gap-4 mb-6">
        <label for="categoria" class="text-lg font-semibold text-gray-700">
          Seleccionar categoría:
        </label>
        <select
          id="categoria"
          v-model="categoriaSeleccionada"
          @change="filtrarProductos"
          class="border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
        >
          <option value="" disabled>-- Selecciona una categoría --</option>
          <option
            v-for="categoria in categorias"
            :key="categoria.nombre"
            :value="categoria.nombre"
          >
            {{ categoria.nombre }}
          </option>
        </select>
      </div>

      <!-- Grid de productos -->
      <div v-if="productosFiltrados.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="producto in productosPaginados"
            :key="producto.id"
            class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition"
          >
            <img
              :src="producto.img"
              :alt="producto.nombre"
              class="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 class="text-lg font-semibold">{{ producto.nombre }}</h3>
            <p class="text-gray-600">{{ producto.descripcion }}</p>
            <p class="text-indigo-600 font-bold mt-2">$ {{ producto.precio }}</p>
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

          <span class="px-3 py-1 font-semibold">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>

          <button
            @click="paginaActual++"
            :disabled="paginaActual === totalPaginas"
            class="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      <!-- Si no hay productos -->
      <p v-else class="text-center text-gray-500 mt-10">
        Selecciona una categoría para ver los productos
      </p>
    </div>

    <!-- Novedades / Destacados -->
    <div>
      <h2 class="text-2xl font-bold text-center mb-8">Destacados</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="item in destacados"
          :key="item.titulo"
          class="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
        >
          <img :src="item.img" :alt="item.titulo" class="w-full h-40 object-cover" />
          <div class="p-4">
            <h4 class="font-bold text-gray-700">{{ item.titulo }}</h4>
            <p class="text-xs text-gray-500">{{ item.categoria }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Campañas Activas -->
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
            <span class="px-3 py-1 text-xs rounded-full font-medium bg-yellow-400 text-black">
              Activa
            </span>
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

    <!-- Modal Detalle campaña -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <!-- Cerrar -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="cerrarModal"
        >
          ✕
        </button>

        <!-- Imagen -->
        <div class="w-full flex justify-center mb-4">
          <img
            v-if="campanaSeleccionada.imagenUrl"
            :src="`http://localhost:3000${campanaSeleccionada.imagenUrl}`"
            alt="Imagen campaña"
            class="rounded-xl shadow-md object-cover max-h-40 w-auto"
          />
        </div>

        <!-- Título y descripción -->
        <h3 class="text-2xl font-bold text-gray-800 mb-3 text-center">
          {{ campanaSeleccionada.titulo }}
        </h3>
        <p class="text-gray-600 mb-4 text-center text-sm leading-relaxed">
          {{ campanaSeleccionada.descripcion }}
        </p>

        <!-- Fechas -->
        <div class="flex justify-between text-xs text-gray-500 mb-4 border-t pt-2">
          <p><strong>Inicio:</strong> {{ formatearFecha(campanaSeleccionada.fechaInicio) }}</p>
          <p><strong>Fin:</strong> {{ formatearFecha(campanaSeleccionada.fechaFin) }}</p>
        </div>

        <!-- Puntos / Descuento -->
        <div class="flex justify-around text-sm text-gray-700 mb-4">
          <p class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
            Puntos: {{ campanaSeleccionada.puntos ?? "N/A" }}
          </p>
          <p class="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium">
            Descuento: {{ campanaSeleccionada.descuento ? campanaSeleccionada.descuento + "%" : "N/A" }}
          </p>
        </div>

        <!-- 🔥 Productos de la campaña -->
          <div v-if="campanaSeleccionada.productos?.length" class="mt-6">
            <h4 class="text-lg font-semibold text-gray-800 mb-3 text-center">
              Productos de la campaña
            </h4>

            <div class="space-y-3">
              <div
                v-for="producto in campanaSeleccionada.productos"
                :key="producto.id"
                class="border rounded-xl p-3 shadow-sm hover:shadow-md transition bg-gray-50 flex justify-between items-center"
              >
                <h5 class="font-medium text-gray-700">{{ producto.nombre }}</h5>
                <p class="text-sm text-gray-600 font-semibold">$ {{ producto.precio }}</p>
              </div>
            </div>
          </div>

        <!-- Acción -->
        <div class="flex justify-center mt-6">
          <button
            class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg hover:from-blue-500 hover:to-blue-700 transition"
            @click="participarCampana"
          >
            Participar en la campaña
          </button>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import useCampana from "../campanas/useCampana.js";

// ✅ Categorías
const categorias = [
  { nombre: "Moda" },
  { nombre: "Belleza" },
  { nombre: "Gastronomía" },
  { nombre: "Deportes" },
  { nombre: "Turismo" },
  { nombre: "Servicios" },
];

// ✅ Productos de ejemplo
const productos = [
  { id: 1, nombre: "Camiseta", descripcion: "De algodón", precio: 40, img: "https://picsum.photos/300/200?random=11", categoria: "Moda" },
  { id: 2, nombre: "Zapatos", descripcion: "De cuero", precio: 80, img: "https://picsum.photos/300/200?random=12", categoria: "Moda" },
  { id: 3, nombre: "Perfume", descripcion: "Aroma floral", precio: 120, img: "https://picsum.photos/300/200?random=13", categoria: "Belleza" },
  { id: 4, nombre: "Pizza", descripcion: "Familiar", precio: 25, img: "https://picsum.photos/300/200?random=14", categoria: "Gastronomía" },
  // agrega más...
];

// ✅ Estado productos
const categoriaSeleccionada = ref("");
const productosFiltrados = ref([]);
const paginaActual = ref(1);
const productosPorPagina = 9;

const totalPaginas = computed(() =>
  Math.ceil(productosFiltrados.value.length / productosPorPagina)
);

const productosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * productosPorPagina;
  const end = start + productosPorPagina;
  return productosFiltrados.value.slice(start, end);
});

function filtrarProductos() {
  paginaActual.value = 1;
  productosFiltrados.value = productos.filter(
    (p) => p.categoria === categoriaSeleccionada.value
  );
}

// ✅ Destacados
const destacados = [
  { titulo: "Nuevo Producto Moda", categoria: "Moda", img: "https://picsum.photos/300/200?random=1" },
  { titulo: "Descuento Belleza", categoria: "Belleza", img: "https://picsum.photos/300/200?random=2" },
  { titulo: "Evento Gastronomía", categoria: "Gastronomía", img: "https://picsum.photos/300/200?random=3" },
];

// ✅ Campañas
const { campanas, cargarCampanas } = useCampana();
const campanasFiltradas = computed(() =>
  campanas.value.filter(c => c.aprobada === true)
);

// Modal
const modalAbierto = ref(false);
const campanaSeleccionada = ref({});

onMounted(() => {
  cargarCampanas();
});

const verCampana = (campana) => {
  campanaSeleccionada.value = campana;
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  campanaSeleccionada.value = {};
};

const formatearFecha = (f) => new Date(f).toLocaleDateString();

const participarCampana = () => {
  Swal.fire({
    icon: "info",
    title: "Inicia sesión",
    text: "Debes iniciar sesión para participar en esta campaña.",
    confirmButtonText: "Ir a login",
    confirmButtonColor: "#2563eb",
  }).then(() => {
    window.location.href = "/login";
  });
};
</script>
