<script>
import useCategorias from './useCategorias';
import Switch from './Switch.vue';
import { useRouter } from 'vue-router';

export default {
  components: { Switch },
  setup() {
    const router = useRouter();

    // Obtenemos todo de useCategorias
    const { categoriasPaginadas, cambioEstado, ...resto } = useCategorias();

    const irAProductos = (categoriaId) => {
      router.push(`/dashboard/productos/${categoriaId}`);
    };

    return { categoriasPaginadas, cambioEstado, irAProductos, ...resto };
  }
};
</script>

<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <div class="max-w-[1100px] w-full mx-auto px-4">
      <!-- Título -->
      <div class="pt-4 pb-2 px-6 mb-1 shadow-sm text-center">
        <h1 class="text-4xl font-bold text-gray-800 mb-1">Gestión de Categorías</h1>
        <p class="text-gray-500 text-lg">Administra tus categorías de forma intuitiva</p>
      </div>

      <!-- Contenedor centrado -->
      <div class="flex flex-col items-center w-full">
        <!-- Barra búsqueda y botón -->
        <div class="flex flex-col md:flex-row gap-2 mb-6 w-full max-w-5xl">
          <input
            v-model="filtro"
            type="text"
            placeholder="Buscar categorías..."
            class="flex-1 px-4 py-3 border border-yellow-400 rounded-xl text-blue-800 bg-blue-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
          <button 
            @click="abrirModalNueva" 
            class="px-6 py-3 bg-[#FFB93B] text-black rounded-xl font-semibold shadow-md hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg"
          >
            + Nueva Categoría
          </button>
        </div>

        <!-- Tabla centrada -->
        <div class="rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-5xl">
          <table class="w-full border-separate border-spacing-0 overflow-hidden rounded-xl">
            <thead class="bg-[#74B9E7] text-white">
              <tr>
                <th class="px-6 py-4 text-center font-semibold rounded-tl-xl">Imagen</th>
                <th class="px-6 py-4 text-center font-semibold">Nombre</th>
                <th class="px-22 py-4 text-center font-semibold">Descripción</th>
                <th class="px-15 py-1 text-center font-semibold">Fecha</th>
                <th class="px-10 py-4 text-center font-semibold">Estado</th>
                <th class="px-6 py-4 text-center font-semibold rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(categoria, index) in categoriasPaginadas" 
                :key="categoria.id" 
                :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
                class="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
              >
                <td class="px-6 py-4">
                  <div class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img 
                      :src="categoria.imagen || placeholder" 
                      class="w-full h-full object-cover" 
                      alt="Imagen categoría" 
                    />
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-800 font-medium">{{ categoria.nombre }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-600">{{ categoria.descripcion }}</span>
                </td>
                <td class="px-12 py-4">
                  <span class="text-gray-500 italic text-sm">
                    {{ new Date(categoria.fecha_creacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) }}
                  </span>
                </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <Switch 
                    v-model="categoria.activo" 
                    @change="cambioEstado(categoria)" 
                  />
                </div>
              </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-3">
                    
                    <button 
                      @click="abrirModalEditar(categoria)" 
                      class="bg-blue-100 text-black-700 hover:bg-blue-200 px-3 py-2 rounded-md text-xm font-medium transition-colors duration-150"
                    >
                      Editar
                    </button>
                    <button 
                      @click="irAProductos(categoria.id)" 
                      class="bg-green-100 text-black-900 hover:bg-green-200 px-4 py-2 rounded-md text-xm font-medium transition"
                    >
                      Producto
                    </button>
                    <button 
                      @click="confirmarEliminar(categoria)" 
                      class="bg-red-100 text-black-900 hover:bg-red-200 px-3 py-2 rounded-md text-xm font-medium transition-colors duration-150"
                    >
                      Eliminar
                    </button>
                    
                  </div>
                </td>
              </tr>

           

              <!-- Fila de cierre redondeada -->
              <tr class="bg-white">
                <td colspan="6" class="h-2 rounded-b-xl"></td>
              </tr>                        
            </tbody>
          </table>

          <!-- Mensaje cuando no hay categorías -->
          <div v-if="categoriasPaginadas.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-6xl mb-4">📦</div>
            <div class="text-xl font-medium mb-2">No se encontraron categorías</div>
            <div class="text-gray-400">crea una nueva categoría</div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="flex flex-col items-center justify-center mt-4 space-y-3">
        <p class="text-sm text-gray-700">
          Existen <span class="font-semibold text-blue-700">{{ totalCategorias }}</span> categoría<span v-if="totalCategorias !== 1">s</span>
        </p>
        <div>
          <button
            @click="paginaAnterior"
            :disabled="paginaActual === 1"
            class="px-3 py-1 text-sm rounded-md border border-gray-300 bg-yellow-50 text-gray-700 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ←
          </button>
          <button
            v-for="pagina in paginasVisibles"
            :key="pagina"
            @click="irAPagina(pagina)"
            :class="[
              'px-3 py-1 text-sm font-medium rounded-md border transition duration-150',
              paginaActual === pagina
                ? 'bg-blue-400 text-white border-blue-400 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
            ]"
          >
            {{ pagina }}
          </button>
          <button
            @click="paginaSiguiente"
            :disabled="paginaActual === totalPaginas"
            class="px-3 py-1 text-sm rounded-md border border-gray-300 bg-yellow-50 text-gray-700 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            →
          </button>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="mostrarModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl border border-gray-200 transition-all duration-300">
          <h2 class="text-2xl font-bold text-black mb-6 text-center">
            {{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}
          </h2>

          <form @submit.prevent="guardarCategoria" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Nombre</label>
              <input
                v-model="form.nombre"
                type="text"
                required
                class="w-full px-4 py-3 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Nombre de la categoría"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Descripción</label>
              <textarea
                v-model="form.descripcion"
                rows="3"
                class="w-full px-4 py-3 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                placeholder="Descripción de la categoría"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Imagen</label>
              <input
                type="file"
                @change="handleImageUpload"
                accept="image/*"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
              <div v-if="previewImage" class="mt-4 flex justify-center">
                <img :src="previewImage" class="w-24 h-24 rounded-lg object-cover border border-gray-300 shadow-sm" alt="Preview" />
              </div>
            </div>
            <div class="flex gap-4 pt-2">
              <button
                type="button"
                @click="cerrarModal"
                class="flex-1 px-5 py-3 rounded-lg bg-yellow-200 text-gray-800 hover:bg-yellow-300 border border-yellow-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-5 py-3 rounded-lg bg-blue-300 text-black hover:bg-blue-400 border border-blue-400 transition"
              >
                {{ editando ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
