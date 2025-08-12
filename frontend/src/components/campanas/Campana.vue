<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <div class="max-w-[1100px] w-full mx-auto px-4">
      <!-- Título -->
      <div class="pt-4 pb-2 px-6 mb-1 shadow-sm text-center">
        <h1 class="text-4xl font-bold text-gray-800 mb-1">Gestión de Campañas</h1>
        <p class="text-gray-500 text-lg">Administra tus campañas promocionales</p>
      </div>

      <!-- Barra búsqueda y botón -->
      <div class="flex flex-col md:flex-row gap-2 mb-6 w-full max-w-5xl">
        <input
          v-model="filtro"
          type="text"
          placeholder="Buscar campañas..."
          class="flex-1 px-4 py-3 border border-yellow-400 rounded-xl text-blue-800 bg-blue-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
        <button 
          @click="abrirModalNueva" 
          class="px-6 py-3 bg-[#FFB93B] text-black rounded-xl font-semibold shadow-md hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg"
        >
          + Nueva Campaña
        </button>
      </div>

      <!-- Tabla -->
      <div class="rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-5xl">
        <table class="w-full border-separate border-spacing-0 overflow-hidden rounded-xl">
          <thead class="bg-[#74B9E7] text-white">
            <tr>
              <th class="px-6 py-4 text-center font-semibold rounded-tl-xl">Imagen</th>
              <th class="px-6 py-4 text-center font-semibold">Nombre</th>
              <th class="px-6 py-4 text-center font-semibold">Categoría</th>
              <th class="px-6 py-4 text-center font-semibold">Puntos</th>
              <th class="px-6 py-4 text-center font-semibold">Descuento</th>
              <th class="px-6 py-4 text-center font-semibold">Fecha</th>
              <th class="px-6 py-4 text-center font-semibold rounded-tr-xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(campana, index) in campanasPaginadas" 
              :key="campana.id" 
              :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
              class="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
            >
              <td class="px-6 py-4">
                <div class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img 
                    :src="campana.imagen || placeholder" 
                    class="w-full h-full object-cover" 
                    alt="Imagen campaña" 
                  />
                </div>
              </td>
              <td class="px-6 py-4 text-gray-800 font-medium">{{ campana.nombre }}</td>
              <td class="px-6 py-4 text-gray-600">{{ campana.categoria }}</td>
              <td class="px-6 py-4 text-blue-700 font-semibold">{{ campana.puntos }}</td>
              <td class="px-6 py-4 text-green-600 font-semibold">{{ campana.descuento }}%</td>
              <td class="px-6 py-4 text-gray-500 italic text-sm">
                {{ new Date(campana.fecha_creacion).toLocaleDateString('es-CO') }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-3">
                  <button @click="abrirModalEditar(campana)" class="bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded-md">
                    Editar
                  </button>
                  <button @click="confirmarEliminar(campana)" class="bg-red-100 hover:bg-red-200 px-3 py-2 rounded-md">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mensaje vacío -->
        <div v-if="campanasPaginadas.length === 0" class="text-center py-12 text-gray-500">
          <div class="text-6xl mb-4">📢</div>
          <div class="text-xl font-medium mb-2">No se encontraron campañas</div>
          <div class="text-gray-400">Crea una nueva campaña</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filtro = ref('')
const placeholder = '/img/no-image.png'

const campanas = ref([
  {
    id: 1,
    nombre: 'Promo Verano',
    categoria: 'Ropa',
    puntos: 200,
    descuento: 15,
    fecha_creacion: '2025-08-01',
    imagen: ''
  }
])

const campanasPaginadas = computed(() => {
  return campanas.value.filter(c => c.nombre.toLowerCase().includes(filtro.value.toLowerCase()))
})

const abrirModalNueva = () => {}
const abrirModalEditar = () => {}
const confirmarEliminar = () => {}
</script>
