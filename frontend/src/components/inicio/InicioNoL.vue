<template>
  <div class="space-y-16">
    <!-- Categorías -->
    <section class="text-center space-y-12">
      <h3 class="text-3xl font-extrabold text-black">Categorías</h3>
      <div class="flex flex-wrap justify-center gap-8">
        <div
          v-for="(cat, i) in categorias"
          :key="i"
          class="flex flex-col items-center cursor-pointer group"
          @click="categoriaSeleccionada = cat.nombre"
        >
          <div
            class="w-20 h-20 flex items-center justify-center rounded-full shadow-md bg-white border-2 transition group-hover:scale-110"
            :class="{ 'border-blue-400 scale-110': categoriaSeleccionada === cat.nombre }"
          >
            <Icon :icon="cat.icon" class="text-3xl text-blue-700" />
          </div>
          <p class="mt-2 text-gray-700 font-medium">{{ cat.nombre }}</p>
        </div>
      </div>
    </section>

    <!-- Destacados -->
    <section class="text-center space-y-12">
      <h3 class="text-3xl font-extrabold text-black">Destacados</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="(item, i) in novedades"
          :key="i"
          class="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition transform overflow-hidden flex flex-col"
        >
          <div class="relative">
            <img :src="item.img" alt="producto" class="h-48 w-full object-cover" />
            <span
              class="absolute top-3 left-3 bg-[#FFB93B] text-black text-xs font-semibold px-3 py-1 rounded-full shadow"
            >
              Nuevo
            </span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <h4 class="text-lg font-bold text-gray-800 mb-2">{{ item.titulo }}</h4>
            <p class="text-sm text-gray-600 flex-1">
              {{ item.descripcion || "Descubre esta novedad pensada para ti." }}
            </p>
          </div>
          <div class="p-5 border-t flex justify-center">
            <button class="px-5 py-2 bg-[#74B9E7] text-black font-medium rounded-lg hover:bg-[#FFB93B] transition">
              Ver más
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Campañas -->
    <section>
    <h2 class="text-2xl font-bold text-center mb-8">Campañas Activas</h2>

    <!-- Grid de campañas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
      <div
        v-for="campana in campanasFiltradas"
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

    <!-- Botón de ver más -->
    <div class="flex justify-center">
      <button
        class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
        @click="verMasCampanas"
      >
        Ver más
      </button>
    </div>
  </section>

    <!-- Modal campaña -->
        <div
            v-if="modalAbierto"
            class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
            >
            <div
                class="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg relative transform transition-all scale-100"
            >
                <!-- Botón cerrar -->
                <button
                class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                @click="cerrarModal"
                >
                ✕
                </button>

                <!-- Imagen de campaña -->
                <div class="w-full flex justify-center mb-4">
                <img
                    v-if="campanaSeleccionada.imagenUrl"
                    :src="`http://localhost:3000${campanaSeleccionada.imagenUrl}`"
                    alt="Imagen campaña"
                    class="rounded-xl shadow-md object-cover max-h-44 w-auto"
                />
                </div>

                <!-- Título -->
                <h3 class="text-2xl font-bold text-gray-800 mb-3 text-center">
                {{ campanaSeleccionada.titulo }}
                </h3>

                <!-- Descripción -->
                <p class="text-gray-600 mb-4 text-center text-sm leading-relaxed">
                {{ campanaSeleccionada.descripcion }}
                </p>

                <!-- Fechas -->
                <div class="flex justify-between text-xs text-gray-500 mb-4 border-t pt-2">
                <p>
                    <strong>Inicio:</strong>
                    {{ new Date(campanaSeleccionada.fechaInicio).toLocaleDateString() }}
                </p>
                <p>
                    <strong>Fin:</strong>
                    {{ new Date(campanaSeleccionada.fechaFin).toLocaleDateString() }}
                </p>
                </div>

                <!-- Puntos y descuento -->
                <div class="flex justify-around text-sm text-gray-700 mb-4">
                <p class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
                    Puntos: {{ campanaSeleccionada.puntos || "N/A" }}
                </p>
                <p class="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium">
                    Descuento:
                    {{ campanaSeleccionada.descuento ? campanaSeleccionada.descuento + "%" : "N/A" }}
                </p>
                </div>

                <!-- Productos incluidos -->
                <h4 class="font-semibold text-gray-800 mb-2">Productos incluidos:</h4>
                <ul
                class="list-disc list-inside text-sm text-gray-600 space-y-1 max-h-28 overflow-y-auto"
                >
                <li
                    v-for="producto in campanaSeleccionada.productos"
                    :key="producto.id"
                >
                    {{ producto.nombre }} - {{ producto.puntos }} pts
                </li>
                <li
                    v-if="!campanaSeleccionada.productos || campanaSeleccionada.productos.length === 0"
                >
                    No hay productos asociados
                </li>
                </ul>

                <!-- Botón de acción -->
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
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import Swal from "sweetalert2";
import useCampana from "../campanas/useCampana";

const categorias = [
  { nombre: "Moda", icon: "mdi:tshirt-crew" },
  { nombre: "Belleza", icon: "mdi:heart-pulse" },
  { nombre: "Gastronomía", icon: "mdi:pizza" },
  { nombre: "Deportes", icon: "mdi:weight-lifter" },
  { nombre: "Turismo", icon: "mdi:palm-tree" },
  { nombre: "Servicios", icon: "mdi:tools" },
];

const novedades = [
  { titulo: "Nuevo Producto Moda", img: "https://picsum.photos/300/200?random=1" },
  { titulo: "Descuento Belleza", img: "https://picsum.photos/300/200?random=2" },
  { titulo: "Evento Gastronomía", img: "https://picsum.photos/300/200?random=3" },
  { titulo: "Nuevo Producto Deportes", img: "https://picsum.photos/300/200?random=4" },
];

const categoriaSeleccionada = ref("");
const { campanas, cargarCampanas } = useCampana();
const campanasFiltradas = computed(() => campanas.value.filter(c => c.aprobada));

const modalAbierto = ref(false);
const campanaSeleccionada = ref({});

onMounted(() => cargarCampanas());

const verCampana = (campana) => {
  campanaSeleccionada.value = campana;
  modalAbierto.value = true;
};
const cerrarModal = () => (modalAbierto.value = false);

const participarCampana = () => {
  Swal.fire({
    icon: "info",
    title: "Inicia sesión",
    text: "Debes iniciar sesión para participar en esta campaña.",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#2563eb",
  });
};
</script>
