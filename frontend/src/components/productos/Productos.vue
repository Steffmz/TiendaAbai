<script>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  props: ['categoriaId'],
  setup() {
    const route = useRoute();
    const productos = ref([]);
    const categoriaNombre = ref('');
    const loading = ref(false);
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Paginación
    const paginaActual = ref(1);
    const productosPorPagina = 5;

    // Estado modal
    const mostrarModal = ref(false);
    const editando = ref(false);
    const productoEditando = ref(null);

    // Formulario
    const form = ref({
      nombre: '',
      descripcion: '',
      precioPuntos: '',
      stock: '',
      imagen: null
    });

    const previewImage = ref(null);

    // Computed para paginación
    const totalPaginas = computed(() => Math.ceil(productos.value.length / productosPorPagina));

    const productosPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * productosPorPagina;
      return productos.value.slice(inicio, inicio + productosPorPagina);
    });

    const paginasVisibles = computed(() => {
      const total = totalPaginas.value;
      const actual = paginaActual.value;
      const inicio = Math.max(1, actual - 2);
      const fin = Math.min(total, inicio + 4);
      return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
    });

    // Funciones de paginación
    const irAPagina = (pagina) => {
      if (pagina >= 1 && pagina <= totalPaginas.value) paginaActual.value = pagina;
    };
    const paginaAnterior = () => { if (paginaActual.value > 1) paginaActual.value--; };
    const paginaSiguiente = () => { if (paginaActual.value < totalPaginas.value) paginaActual.value++; };

    // Cargar productos
    const cargarProductos = async () => {
      try {
        const id = route.params.categoriaId;
        const res = await fetch(`${baseUrl}/api/productos/categoria/${id}`);
        if (res.ok) {
          const data = await res.json();
          productos.value = Array.isArray(data) ? data : data.productos || [];
          if (data.categoria) categoriaNombre.value = data.categoria.nombre;
          paginaActual.value = 1;
        } else {
          console.error('Error al cargar productos:', await res.text());
        }
      } catch (error) {
        console.error('Error de red al cargar productos:', error);
      }
    };
    onMounted(cargarProductos);

    // Abrir modal para agregar
    const agregarProducto = () => {
      editando.value = false;
      productoEditando.value = null;
      form.value = { nombre: '', descripcion: '', precioPuntos: '', stock: '', imagen: null };
      previewImage.value = null;
      mostrarModal.value = true;
    };

    // Abrir modal para editar
    const editarProducto = (producto) => {
      editando.value = true;
      productoEditando.value = producto;
      form.value = {
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precioPuntos: producto.precioPuntos.toString(),
        stock: producto.stock.toString(),
        imagen: null
      };
      previewImage.value = producto.imagenUrl ? `${baseUrl}${producto.imagenUrl}` : null;
      mostrarModal.value = true;
    };

    const cerrarModal = () => {
      mostrarModal.value = false;
      form.value = { nombre: '', descripcion: '', precioPuntos: '', stock: '', imagen: null };
      previewImage.value = null;
      editando.value = false;
      productoEditando.value = null;
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        form.value.imagen = file;
        previewImage.value = URL.createObjectURL(file);
      }
    };

    // Guardar producto (crear o actualizar)
    const guardarProducto = async () => {
      try {
        loading.value = true;

        if (!form.value.nombre || !form.value.precioPuntos || !form.value.stock) {
          Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos obligatorios',
            confirmButtonColor: '#3085d6'
          });
          return;
        }

        const data = new FormData();
        data.append('nombre', form.value.nombre);
        data.append('descripcion', form.value.descripcion || '');
        data.append('precioPuntos', form.value.precioPuntos);
        data.append('stock', form.value.stock);
        if (!editando.value) data.append('categoriaId', route.params.categoriaId);
        data.append('estado', 'true');
        if (form.value.imagen) data.append('imagen', form.value.imagen);

        const url = editando.value
          ? `${baseUrl}/api/productos/${productoEditando.value.id}`
          : `${baseUrl}/api/productos`;
        const method = editando.value ? 'PUT' : 'POST';

        const res = await fetch(url, { method, body: data });
        const responseData = await res.json();

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: editando.value ? 'Producto actualizado' : 'Producto creado',
            text: editando.value
              ? 'El producto fue actualizado exitosamente.'
              : 'El producto fue creado exitosamente.',
            confirmButtonColor: '#28a745'
          });
          mostrarModal.value = false;
          await cargarProductos();
        } else {
          console.error('Error del servidor:', responseData);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: responseData.error || 'Error desconocido',
            confirmButtonColor: '#d33'
          });
        }
      } catch (error) {
        console.error('Error al guardar producto:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar al servidor.',
          confirmButtonColor: '#d33'
        });
      } finally {
        loading.value = false;
      }
    };

    // Eliminar producto
    const eliminarProducto = async (producto) => {
      const confirmDelete = await Swal.fire({
        title: '¿Eliminar producto?',
        text: `El producto "${producto.nombre}" se eliminará permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (!confirmDelete.isConfirmed) return;

      try {
        loading.value = true;
        const res = await fetch(`${baseUrl}/api/productos/${producto.id}`, { method: 'DELETE' });
        const responseData = await res.json();

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El producto fue eliminado exitosamente.',
            confirmButtonColor: '#28a745'
          });
          await cargarProductos();
        } else {
          console.error('Error del servidor:', responseData);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: responseData.error || 'Error desconocido',
            confirmButtonColor: '#d33'
          });
        }
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar al servidor.',
          confirmButtonColor: '#d33'
        });
      } finally {
        loading.value = false;
      }
    };

    return {
      baseUrl,
      productos,
      categoriaNombre,
      mostrarModal,
      editando,
      form,
      previewImage,
      loading,
      paginaActual,
      totalPaginas,
      productosPaginados,
      paginasVisibles,
      irAPagina,
      paginaAnterior,
      paginaSiguiente,
      agregarProducto,
      editarProducto,
      eliminarProducto,
      cerrarModal,
      handleImageUpload,
      guardarProducto
    };
  }
};
</script>


  <template>
    <div class="h-full bg-gray-50 flex flex-col">
      <div class="max-w-[1100px] w-full mx-auto px-4">
        <!-- Flecha para volver atrás -->
        <div class="pt-4 px-6 mb-2">
          <button 
            @click="$router.go(-1)"
            class="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Volver
          </button>
        </div>

        <!-- Título y botón -->
        <div class="pb-2 px-6 mb-4 shadow-sm">
          <div class="text-center mb-4">
            <h1 class="text-4xl font-bold text-gray-800 mb-1">
              Catalogo de  {{ categoriaNombre || 'Categoría' }}
            </h1>
            <p class="text-gray-500 text-lg"> 
              <span v-if="productos.length > 0" class="font-medium">
                ({{ productos.length }} productos)
              </span>
            </p>
          </div>
          <div class="flex justify-end">
            <button
              @click="agregarProducto"
              class="px-8 py-2 bg-[#FFB93B] text-black rounded-lg font-medium shadow hover:bg-[#74B9E7] transition-all duration-200"
              :disabled="loading"
            >
              + Agregar producto
            </button>
          </div>
        </div>

        <!-- Tabla de productos -->
        <div class="rounded-xl border border-gray-200 shadow-sm mb-4 w-full max-w-5xl">
          <table class="w-full border-separate border-spacing-0 overflow-hidden rounded-xl">
            <thead class="bg-[#74B9E7] text-white">
              <tr>
                <th class="px-6 py-4 text-center font-semibold">Imagen</th>
                <th class="px-6 py-4 text-center font-semibold">Nombre</th>
                <th class="px-6 py-4 text-center font-semibold">Precio</th>
                <th class="px-6 py-4 text-center font-semibold">Stock</th>
                <th class="px-6 py-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="productos.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  No hay productos en esta categoría
                </td>
              </tr>
              <tr
                v-for="producto in productosPaginados"
                :key="producto.id"
                class="border-b border-gray-100"
              >
                <td class="px-6 py-4 text-center">
                  <img 
                    v-if="producto.imagenUrl" 
                    :src="`${baseUrl}${producto.imagenUrl}`"
                    class="w-16 h-16 object-cover rounded-lg mx-auto" 
                    @error="$event.target.style.display='none'"
                  />
                  <div v-else class="w-16 h-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <span class="text-gray-400 text-xs">Sin imagen</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">{{ producto.nombre }}</td>
                <td class="px-6 py-4 text-center">{{ producto.precioPuntos }} puntos</td>
                <td class="px-6 py-4 text-center">{{ producto.stock }}</td>
                <td class="px-6 py-4 text-center space-x-2">
                  <button 
                    @click="editarProducto(producto)"
                    class="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-blue-700 font-medium transition-colors"
                    :disabled="loading"
                  >
                    Editar
                  </button>
                  <button 
                    @click="eliminarProducto(producto)"
                    class="bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-red-700 font-medium transition-colors"
                    :disabled="loading"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Información de productos y controles de paginación -->
        <div class="text-center mb-6">

          <!-- Controles de paginación -->
          <div 
            v-if="totalPaginas > 1" 
            class="flex justify-center items-center space-x-4"
          >
            <!-- Botón página anterior -->
            <button
              @click="paginaAnterior"
              :disabled="paginaActual === 1"
              class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>

            <!-- Página actual -->
            <div class="px-3 py-1 bg-[#74B9E7] text-white text-sm rounded-md font-medium">
              {{ paginaActual }}
            </div>

            <!-- Botón página siguiente -->
            <button
              @click="paginaSiguiente"
              :disabled="paginaActual === totalPaginas"
              class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de producto -->
      <div
        v-if="mostrarModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl border border-gray-200 transition-all duration-300"
        >
          <h2 class="text-2xl font-bold text-black mb-6 text-center">
            {{ editando ? 'Editar Producto' : 'Nuevo Producto' }}
          </h2>

          <form @submit.prevent="guardarProducto" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Nombre *</label>
              <input
                v-model="form.nombre"
                type="text"
                required
                class="w-full px-4 py-3 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Descripción</label>
              <textarea
                v-model="form.descripcion"
                rows="3"
                class="w-full px-4 py-3 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                placeholder="Descripción del producto"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Precio (puntos) *</label>
              <input
                v-model="form.precioPuntos"
                type="number"
                min="1"
                required
                class="w-full px-4 py-3 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Precio en puntos"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Stock *</label>
              <input
                v-model="form.stock"
                type="number"
                min="0"
                required
                class="w-full px-4 py-3 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Cantidad en stock"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">
                Imagen {{ editando ? '(dejar vacío para mantener actual)' : '' }}
              </label>
              <input
                type="file"
                @change="handleImageUpload"
                accept="image/*"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
              <div v-if="previewImage" class="mt-4 flex justify-center">
                <img
                  :src="previewImage"
                  class="w-24 h-24 rounded-lg object-cover border border-gray-300 shadow-sm"
                  alt="Preview"
                />
              </div>
            </div>
            <div class="flex gap-4 pt-2">
              <button
                type="button"
                @click="cerrarModal"
                class="flex-1 px-5 py-3 rounded-lg bg-yellow-200 text-gray-800 hover:bg-yellow-300 border border-yellow-300 transition"
                :disabled="loading"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-5 py-3 rounded-lg bg-blue-300 text-black hover:bg-blue-400 border border-blue-400 transition disabled:opacity-50"
                :disabled="loading"
              >
                {{ loading ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>