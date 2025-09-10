<template>
  <div class="max-w-7xl w-full mx-auto flex flex-col h-full">
    
    <div class="page-header flex-shrink-0">
      <div class="flex justify-between items-center w-full flex-wrap gap-4">
        <button @click="router.back()" class="back-button">&larr; Volver</button>
        <div class="header-center">
          <h1 class="page-title">Catálogo de {{ categoriaNombre }}</h1>
          <p class="page-subtitle">{{ productos.length }} productos encontrados</p>
        </div>
        <button @click="agregarProducto" class="btn btn-primary">+ Agregar Producto</button>
      </div>
    </div>

    <div class="flex-grow overflow-y-auto pb-4">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio (Puntos)</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 6" :key="i">
              <td><BaseSkeleton width="60px" height="60px" radius="8px" /></td>
              <td><BaseSkeleton width="150px" height="24px" radius="6px" /></td>
              <td><BaseSkeleton width="60px" height="28px" radius="6px" /></td>
              <td><BaseSkeleton width="80px" height="24px" radius="6px" /></td>
              <td><BaseSkeleton width="50px" height="24px" radius="6px" /></td>
              <td>
                <div class="actions-cell">
                  <BaseSkeleton width="70px" height="32px" radius="6px" />
                  <BaseSkeleton width="70px" height="32px" radius="6px" />
                </div>
              </td>
            </tr>
            
            <tr v-else-if="productosPaginados.length === 0">
              <td colspan="6">
                <EmptyState icon="mdi:package-variant-closed-remove-outline" title="No hay productos" message="Esta categoría aún no tiene productos. ¡Añade el primero!" />
              </td>
            </tr>
            <tr v-else v-for="producto in productosPaginados" :key="producto.id">
              <td><img :src="`${API_BASE_URL}${producto.imagenUrl}`" class="table-image" alt="Producto"/></td>
              <td>{{ producto.nombre }}</td>
              <td><button @click="mostrarDescripcionCompleta = producto.descripcion" class="btn btn-secondary text-xs px-2 py-1">Ver</button></td>
              <td>{{ producto.precioPuntos }}</td>
              <td>{{ producto.stock }}</td>
              <td>
                <div class="actions-cell">
                  <button @click="editarProducto(producto)" class="btn-edit">Editar</button>
                  <button @click="eliminarProducto(producto)" class="btn-danger">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="cards-container">
        <div v-if="loading">
            <div v-for="i in 4" :key="i" class="card"><BaseSkeleton width="100%" height="300px" /></div>
        </div>
        <div v-else-if="productosPaginados.length === 0">
            <EmptyState icon="mdi:package-variant-closed-remove-outline" title="No hay productos" message="Esta categoría aún no tiene productos. ¡Añade el primero!" />
        </div>
        <div v-else v-for="producto in productosPaginados" :key="producto.id" class="card">
          <img :src="`${API_BASE_URL}${producto.imagenUrl}`" class="card-image" alt="Producto"/>
          <div class="card-body">
            <h3 class="card-title">{{ producto.nombre }}</h3>
            <div class="card-row"><strong>Precio:</strong> {{ producto.precioPuntos }} pts</div>
            <div class="card-row"><strong>Stock:</strong> {{ producto.stock }}</div>
            <div class="card-row">
              <strong>Descripción:</strong>
              <button @click="mostrarDescripcionCompleta = producto.descripcion" class="btn btn-secondary text-xs px-2 py-1">Ver</button>
            </div>
          </div>
          <div class="card-actions">
            <button @click="editarProducto(producto)" class="btn-edit">Editar</button>
            <button @click="eliminarProducto(producto)" class="btn-danger">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && totalPaginas > 1" class="pagination-controls">
      <button @click="paginaAnterior" :disabled="paginaActual === 1" class="btn btn-secondary">Anterior</button>
      <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
      <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas" class="btn btn-secondary">Siguiente</button>
    </div>
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-content">
            <h2 class="modal-title">{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
            <form @submit.prevent="guardarProducto" class="space-y-5">
                <div class="form-group"><label>Nombre *</label><input v-model="form.nombre" type="text" required/></div>
                <div class="form-group"><label>Descripción</label><textarea v-model="form.descripcion" rows="3"></textarea></div>
                <div class="form-grid">
                    <div><label>Precio (puntos) *</label><input v-model="form.precioPuntos" type="number" min="1" required/></div>
                    <div><label>Stock *</label><input v-model="form.stock" type="number" min="0" required/></div>
                </div>
                <div class="form-group">
                    <label>Imagen</label>
                    <input type="file" @change="handleImageUpload" accept="image/*" class="file-input"/>
                    <img v-if="previewImage" :src="previewImage" class="preview-image mt-4 rounded-lg border max-w-[100px]" alt="Preview"/>
                </div>
                <div class="modal-actions">
                    <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Guardando...' : 'Guardar' }}</button>
                </div>
            </form>
        </div>
    </div>
    <div v-if="mostrarDescripcionCompleta" class="modal-overlay" @click.self="mostrarDescripcionCompleta = null">
        <div class="modal-content">
            <h2 class="modal-title">Descripción del Producto</h2>
            <p class="descripcion-texto whitespace-pre-wrap break-words text-center">{{ mostrarDescripcionCompleta }}</p>
            <div class="modal-actions">
                <button @click="mostrarDescripcionCompleta = null" class="btn btn-primary">Cerrar</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { PAGINATION } from '../../config';
import BaseSkeleton from "../shared/BaseSkeleton.vue";
import EmptyState from "../shared/EmptyState.vue";

const route = useRoute();
const router = useRouter();
const productos = ref([]);
const categoriaNombre = ref('');
const loading = ref(false);
const mostrarDescripcionCompleta = ref(null);
const paginaActual = ref(1);
const productosPorPagina = PAGINATION.PRODUCTS || 6;
const mostrarModal = ref(false);
const editando = ref(false);
const productoEditando = ref(null);
const form = ref({ nombre: '', descripcion: '', precioPuntos: '', stock: '', imagen: null });
const previewImage = ref(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("authToken");
  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return { headers };
};

const totalPaginas = computed(() => Math.ceil(productos.value.length / productosPorPagina));
const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * productosPorPagina;
  return productos.value.slice(inicio, inicio + productosPorPagina);
});

const paginaAnterior = () => { if (paginaActual.value > 1) paginaActual.value--; };
const paginaSiguiente = () => { if (paginaActual.value < totalPaginas.value) paginaActual.value++; };

const cargarProductos = async () => {
  loading.value = true;
  try {
    const id = route.params.categoriaId;
    const { data } = await axios.get(`${API_BASE_URL}/api/productos/categoria/${id}`, getAuthHeaders());
    productos.value = Array.isArray(data) ? data : (data.productos || []);
    
    if (productos.value.length > 0 && productos.value[0].categoria) {
        categoriaNombre.value = productos.value[0].categoria.nombre;
    } else {
        const catRes = await axios.get(`${API_BASE_URL}/api/categorias/${id}`, getAuthHeaders());
        categoriaNombre.value = catRes.data.nombre;
    }
    paginaActual.value = 1;
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
  } finally {
    loading.value = false;
  }
};
onMounted(cargarProductos);

const agregarProducto = () => {
  editando.value = false;
  productoEditando.value = null;
  form.value = { nombre: '', descripcion: '', precioPuntos: '', stock: '', imagen: null };
  previewImage.value = null;
  mostrarModal.value = true;
};

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
  previewImage.value = producto.imagenUrl ? `${API_BASE_URL}${producto.imagenUrl}` : null;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.imagen = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const guardarProducto = async () => {
    loading.value = true;
    const data = new FormData();
    data.append('nombre', form.value.nombre);
    data.append('descripcion', form.value.descripcion || '');
    data.append('precioPuntos', form.value.precioPuntos);
    data.append('stock', form.value.stock);
    if (!editando.value) {
      data.append('categoriaId', route.params.categoriaId);
    }
    if (form.value.imagen) {
      data.append('imagen', form.value.imagen);
    }

    const url = editando.value
      ? `${API_BASE_URL}/api/productos/${productoEditando.value.id}`
      : `${API_BASE_URL}/api/productos`;
    const method = editando.value ? 'put' : 'post';

    try {
        await axios({ method, url, data, ...getAuthHeaders(true) });
        Swal.fire('Éxito', `Producto ${editando.value ? 'actualizado' : 'creado'}.`, 'success');
        cerrarModal();
        await cargarProductos();
    } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo guardar el producto.', 'error');
    } finally {
        loading.value = false;
    }
};

const eliminarProducto = async (producto) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Se eliminará el producto "${producto.nombre}".`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_BASE_URL}/api/productos/${producto.id}`, getAuthHeaders());
      Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
      await cargarProductos();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'No se pudo eliminar el producto.', 'error');
    }
  }
};
</script>

<style src="../../assets/css/AdminGestion.css"></style>