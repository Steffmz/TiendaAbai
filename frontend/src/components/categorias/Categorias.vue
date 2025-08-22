<script>
import { ref } from 'vue'
import useCategorias from './useCategorias';
import Switch from './Switch.vue';
import { useRouter } from 'vue-router';

export default {
  components: { Switch },
  setup() {
    const router = useRouter();
    const { 
      categoriasPaginadas, 
      cambioEstado, 
      totalCategorias,
      totalPaginas,
      paginaActual,
      paginasVisibles,
      paginaAnterior,
      paginaSiguiente,
      irAPagina,
      ...resto 
    } = useCategorias();

    const mostrarDescripcion = ref(null);

    const irAProductos = (categoriaId) => {
      router.push(`/dashboard/productos/${categoriaId}`);
    };

    const formatearFecha = (fecha) => {
      const d = new Date(fecha);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    return { 
      categoriasPaginadas, 
      cambioEstado, 
      irAProductos,
      mostrarDescripcion,
      formatearFecha,
      totalCategorias,
      totalPaginas,
      paginaActual,
      paginasVisibles,
      paginaAnterior,
      paginaSiguiente,
      irAPagina,
      ...resto 
    };
  }
};
</script>

  <template>
    <div class="h-full  flex flex-col">
      <div class="max-w-7xl w-full mx-auto px-4">
        <div class="pt-4 pb-2 px-6 mb-1 shadow-sm text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-1">Gestión de Categorías</h1>
          <p class="text-gray-500 text-lg">Administra tus categorías de forma intuitiva</p>
        </div>

        <div class="flex flex-col items-center w-full">
      <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl mx-auto mb-6">
          <input
            v-model="filtro"
            type="text"
            placeholder="Buscar categorías..."
            class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50
                  focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                  text-sm shadow-sm transition-all duration-200"
          />
          <button 
            @click="abrirModalNueva" 
            class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md
                  hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg"
          >
            + Nueva Categoría
          </button>
        </div>

        <!--TABLA-->
          <div class="rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-6xl mx-auto ">
            <table class="w-full border-collapse ">
              <thead class="bg-[#74B9E7] text-black">
                <tr>
                  <th class="px-6 py-4 text-center font-semibold rounded-tl-xl">Imagen</th>
                  <th class="px-20 py-4 text-center font-semibold">Nombre</th>
                  <th class="px-6 py-4 text-center font-semibold">Descripción</th>
                  <th class="px-15 py-1 text-center font-semibold">Fecha</th>
                  <th class="px-10 py-4 text-center font-semibold">Estado</th>
                  <th class="px-6 py-4 text-center font-semibold rounded-tr-xl">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(categoria, index) in categoriasPaginadas" 
                  :key="categoria.id" 
                  :class="index % 2 === 0 ? 'bg-surface-2' : 'bg-surface'"
                  class="border-b border-gray-100 hover:bg-[#fac8012f] transition-colors duration-150"
                >
                  <td class="px-6 py-4">
                    <div class="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img 
                        :src="categoria.imagen || placeholder" 
                        class="w-full h-full object-cover" 
                        alt="Foto" 
                      />
                    </div>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <span class="text-gray-800 font-medium text-center">{{ categoria.nombre }}</span>
                  </td>
                  <td class="px-3 py-3 text-center">
                  <button 
                    @click="mostrarDescripcion = mostrarDescripcion === categoria.id ? null : categoria.id"
                    class="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm text-blue-700 font-medium transition-colors"
                  >
                    Ver
                  </button>
                </td>

                  <td class="px-12 py-4">
                    <span class="text-gray-500 italic text-sm">
                  {{ new Date(categoria.fecha_creacion).getDate() }}/{{ new Date(categoria.fecha_creacion).getMonth() + 1 }}/{{ new Date(categoria.fecha_creacion).getFullYear() }}
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

                  <td class="px-3 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="abrirModalEditar(categoria)" 
                        class="bg-blue-100 text-black hover:bg-blue-200 px-3 py-1 rounded-md text-xm font-medium transition-colors duration-150"
                      >
                        Editar
                      </button>
                      <button 
                        @click="irAProductos(categoria.id)" 
                        class="bg-green-100 text-black hover:bg-green-200 px-3 py-1 rounded-md text-xm font-medium transition"
                      >
                        Catalogo
                      </button>
                      <button 
                        @click="confirmarEliminar(categoria)" 
                        class="bg-red-100 text-black hover:bg-red-200 px-3 py-1 rounded-md text-xm font-medium transition-colors duration-150"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="bg-surface">
                  <td colspan="6" class="h-2 rounded-b-xl"></td>
                </tr>                        
              </tbody>
            </table>

            <!-- Mensaje cuando no hay categorías -->
            <div v-if="categoriasPaginadas.length === 0" class="text-center py-12 text-gray-500">
              <div class="text-6xl mb-4">📦</div>
              <div class="text-xl font-medium mb-2">No se encontraron categorías</div>
              <div class="text-gray-400">Crea una nueva categoría</div>
            </div>
          </div>
        </div>


                <!-- Modal de descripción -->
           <div 
            v-if="mostrarDescripcion"
            class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            @click="mostrarDescripcion = null"
          >
            <div 
              class="relative bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl p-6 w-full max-w-md mx-auto"
              @click.stop
            >

              <!-- Contenido -->
              <div class="bg-[var(--surface-2)] rounded-lg p-4">
                <p class="text-base text-[var(--text)] leading-relaxed break-words whitespace-pre-wrap">
                  {{ categorias.find(c => c.id === mostrarDescripcion)?.descripcion }}
                </p>
              </div>

              <!-- Botón abajo -->
              <div class="mt-4 text-center">
                <button 
                  @click="mostrarDescripcion = null"
                  class="px-4 py-2 bg-[#74B9E7] text-black rounded-lg hover:bg-[#FFB93B] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>

                        

                    <!-- Paginación -->
            <div class="flex flex-col items-center justify-center mt-1">
              <p class="text-gray-700">
                Existen <span class="text-blue-500 font-semibold">{{ totalCategorias }}</span> categorías
              </p>

              <div class="flex items-center mt-2 space-x-1">
                <button
                  @click="paginaAnterior"
                  :disabled="paginaActual === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] 
                        border border-gray-200 text-gray-600 hover:bg-gray-100 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                <button
                  v-for="pagina in paginasVisibles"
                  :key="pagina"
                  @click="irAPagina(pagina)"
                  :class="[
                    'w-8 h-8 flex items-center justify-center rounded-md border font-medium',
                    paginaActual === pagina
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-[#fffef9] border-gray-200 text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  {{ pagina }}
                </button>
                <button
                  @click="paginaSiguiente"
                  :disabled="paginaActual === totalPaginas"
                  class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] 
                        border border-gray-200 text-gray-600 hover:bg-gray-100 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            </div>

          <!-- Modal -->
          <div v-if="mostrarModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div class="relative rounded-2xl max-w-md w-full p-8 shadow-xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300">
          <button @click="cerrarModal" class="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold">
            ✕
          </button>

              <h2 class="text-2xl font-bold text-blue-400 mb-6 text-center">
                {{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}
              </h2>

              <form @submit.prevent="guardarCategoria" class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-blue-400 mb-2 text-center">Nombre</label>
                  <input
                    v-model="form.nombre"
                    type="text"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="Nombre de la categoría"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-blue-400 mb-2 text-center">Descripción</label>
                  <textarea
                    v-model="form.descripcion"
                    rows="3"
                    class="w-full px-4 py-3 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                    placeholder="Descripción de la categoría"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-blue-400 mb-2 text-center">Imagen</label>
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

                <div class="pt-2 flex justify-center">
                  <button
                    type="submit"
                    class="px-5 py-3 rounded-lg bg-blue-300 text-black hover:bg-[#FFB93B] border border-blue-400 transition"
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
