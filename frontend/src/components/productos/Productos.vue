<script setup>
// El script no necesita cambios, se mantiene igual
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const productos = ref([]);
const categoriaNombre = ref('');
const loading = ref(false);
const mostrarDescripcionCompleta = ref(null);

const paginaActual = ref(1);
const productosPorPagina = 5;
const mostrarModal = ref(false);
const editando = ref(false);
const productoEditando = ref(null);

const form = ref({
  nombre: '',
  descripcion: '',
  precioPuntos: '',
  stock: '',
  imagen: null
});

const previewImage = ref(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const totalPaginas = computed(() => Math.ceil(productos.value.length / productosPorPagina));
const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * productosPorPagina;
  return productos.value.slice(inicio, inicio + productosPorPagina);
});

const paginasVisibles = computed(() => {
    const total = totalPaginas.value;
    const actual = paginaActual.value;
    const paginas = [];
    if (total <= 5) {
        for (let i = 1; i <= total; i++) paginas.push(i);
    } else {
        if (actual > 2) paginas.push(1, '...');
        for (let i = Math.max(1, actual - 1); i <= Math.min(total, actual + 1); i++) {
            if (!paginas.includes(i)) paginas.push(i);
        }
        if (actual < total - 1) paginas.push('...', total);
    }
    return paginas;
});

const irAPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) paginaActual.value = pagina;
};
const paginaAnterior = () => { if (paginaActual.value > 1) paginaActual.value--; };
const paginaSiguiente = () => { if (paginaActual.value < totalPaginas.value) paginaActual.value++; };

const cargarProductos = async () => {
  loading.value = true;
  try {
    const id = route.params.categoriaId;
    const res = await fetch(`${API_BASE_URL}/api/productos/categoria/${id}`);
    if (res.ok) {
      const data = await res.json();
      productos.value = Array.isArray(data) ? data : data.productos || [];
      // Mejoramos la obtención del nombre para evitar errores si no hay productos
      if (productos.value.length > 0 && productos.value[0].categoria) {
        categoriaNombre.value = productos.value[0].categoria.nombre;
      } else {
        // Opcional: Cargar nombre de la categoría por separado si no hay productos
        categoriaNombre.value = "Categoría sin productos";
      }
      paginaActual.value = 1;
    } else {
      console.error('Error al cargar productos:', await res.text());
    }
  } catch (error) {
    console.error('Error de red al cargar productos:', error);
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
    if (!editando.value) data.append('categoriaId', route.params.categoriaId);
    if (form.value.imagen) data.append('imagen', form.value.imagen);

    const url = editando.value
      ? `${API_BASE_URL}/api/productos/${productoEditando.value.id}`
      : `${API_BASE_URL}/api/productos`;
    const method = editando.value ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, { method, body: data });
        if (res.ok) {
            Swal.fire('Éxito', `Producto ${editando.value ? 'actualizado' : 'creado'}.`, 'success');
            cerrarModal();
            await cargarProductos();
        } else {
            const errorData = await res.json();
            Swal.fire('Error', errorData.error || 'No se pudo guardar el producto.', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
    } finally {
        loading.value = false;
    }
};

const eliminarProducto = async (producto) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: `Se eliminará el producto "${producto.nombre}".`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/productos/${producto.id}`, { method: 'DELETE' });
        if(res.ok) {
          Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
          await cargarProductos();
        } else {
          const errorData = await res.json();
          Swal.fire('Error', errorData.error, 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'No se pudo conectar al servidor.', 'error');
      }
    }
  });
};
</script>

<template>
  <div class="max-w-7xl w-full mx-auto">
    <div class="page-header">
      <button @click="router.back()" class="back-button">
        &larr; Volver
      </button>
      <div class="header-center">
        <h1 class="page-title">Catálogo de {{ categoriaNombre }}</h1>
        <p class="page-subtitle">{{ productos.length }} productos</p>
      </div>
       <button @click="agregarProducto" class="btn btn-primary add-button">
        + Agregar producto
      </button>
    </div>

    <div class="table-container">
      <table class="hidden md:table w-full">
        <thead>
          <tr>
            <th>Imagen</th><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Stock</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center py-8">Cargando...</td></tr>
          <tr v-else-if="productosPaginados.length === 0"><td colspan="6" class="text-center py-8">No hay productos.</td></tr>
          <tr v-else v-for="producto in productosPaginados" :key="producto.id" class="table-row">
            <td><img :src="`${API_BASE_URL}${producto.imagenUrl}`" class="table-image" alt="Producto"/></td>
            <td>{{ producto.nombre }}</td>
            <td><button @click="mostrarDescripcionCompleta = producto.descripcion" class="btn-secondary text-xs">Ver</button></td>
            <td>{{ producto.precioPuntos }} pts</td>
            <td>{{ producto.stock }}</td>
            <td class="actions-cell">
              <button @click="editarProducto(producto)" class="btn btn-edit">Editar</button>
              <button @click="eliminarProducto(producto)" class="btn btn-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="md:hidden">
        <div v-if="loading" class="text-center py-8">Cargando...</div>
        <div v-else-if="productosPaginados.length === 0" class="text-center py-8">No hay productos.</div>
        <div v-else class="cards-container">
          <div v-for="producto in productosPaginados" :key="producto.id" class="card">
            <img :src="`${API_BASE_URL}${producto.imagenUrl}`" class="card-image" alt="Producto"/>
            <div class="card-body">
              <h3 class="card-title">{{ producto.nombre }}</h3>
              <div class="card-row"><strong>Precio:</strong> {{ producto.precioPuntos }} pts</div>
              <div class="card-row"><strong>Stock:</strong> {{ producto.stock }}</div>
              <div class="card-row">
                <strong>Descripción:</strong>
                <button @click="mostrarDescripcionCompleta = producto.descripcion" class="btn-secondary text-xs">Ver</button>
              </div>
            </div>
            <div class="card-actions">
              <button @click="editarProducto(producto)" class="btn btn-edit">Editar</button>
              <button @click="eliminarProducto(producto)" class="btn btn-danger">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <div v-if="!loading && totalPaginas > 1" class="pagination-controls">
        <button @click="paginaAnterior" :disabled="paginaActual === 1">&laquo;</button>
        <template v-for="(pagina, index) in paginasVisibles" :key="index">
          <span v-if="pagina === '...'" class="pagination-ellipsis">&hellip;</span>
          <button v-else @click="irAPagina(pagina)" :class="{ active: paginaActual === pagina }">{{ pagina }}</button>
        </template>
        <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas">&raquo;</button>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal"><div class="modal-content"><h2 class="modal-title">{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</h2><form @submit.prevent="guardarProducto" class="space-y-5"><div><label>Nombre *</label><input v-model="form.nombre" type="text" required/></div><div><label>Descripción</label><textarea v-model="form.descripcion" rows="3"></textarea></div><div class="form-grid"><div><label>Precio (puntos) *</label><input v-model="form.precioPuntos" type="number" min="1" required/></div><div><label>Stock *</label><input v-model="form.stock" type="number" min="0" required/></div></div><div><label>Imagen</label><input type="file" @change="handleImageUpload" accept="image/*" class="file-input"/><img v-if="previewImage" :src="previewImage" class="preview-image" alt="Preview"/></div><div class="modal-actions"><button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button><button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Guardando...' : 'Guardar' }}</button></div></form></div></div>
    <div v-if="mostrarDescripcionCompleta" class="modal-overlay" @click.self="mostrarDescripcionCompleta = null"><div class="modal-content"><h2 class="modal-title">Descripción del Producto</h2><p class="descripcion-texto">{{ mostrarDescripcionCompleta }}</p><div class="modal-actions"><button @click="mostrarDescripcionCompleta = null" class="btn btn-primary">Cerrar</button></div></div></div>
  </div>
</template>

<style scoped>
.max-w-7xl { max-width: 80rem; width: 100%; margin: 0 auto; }

/* Encabezado corregido */
.page-header {
    display: flex;
    flex-wrap: wrap; /* Permite que los elementos se envuelvan en pantallas pequeñas */
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}
.back-button {
    background: none;
    border: none;
    font-weight: 500;
    color: var(--primary);
    cursor: pointer;
    font-size: 1rem;
    padding: 0.5rem; /* Aumenta el área de clic */
}
.header-center {
    text-align: center;
    flex-grow: 1; /* Ocupa el espacio del medio */
}
.page-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
    text-transform: capitalize; /* Pone la primera letra en mayúscula */
}
.page-subtitle {
    color: var(--text-muted);
}
.add-button {
    margin-left: auto; /* Empuja el botón a la derecha en escritorio */
}
@media (max-width: 767px) {
    .page-header {
        justify-content: center; /* Centra todo en móvil */
    }
    .header-center {
        order: -1; /* Pone el título primero en móvil */
        width: 100%; /* El título ocupa todo el ancho */
    }
    .back-button {
        position: absolute; /* Lo saca del flujo para que no afecte el centrado */
        left: 0rem;
        top: 0.5rem
    }
    .add-button {
        width: 100%;
        margin-top: 1rem;
    }
}


.table-container { background: var(--surface); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
.hidden { display: none; }
@media (min-width: 768px) { .md\:table { display: table; } .md\:hidden { display: none; } }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 1rem; text-align: center; vertical-align: middle; }
th { background-color: var(--table-header); color: white; font-weight: 600; }
.table-row { border-bottom: 1px solid var(--border); }
.table-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin: 0 auto; }
.cards-container { padding: 1rem; display: grid; gap: 1rem; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.card-image { width: 100%; height: 150px; object-fit: cover; }
.card-body { padding: 1rem; }
.card-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 0.75rem; }
.card-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
.card-row:last-child { border-bottom: none; }
.card-actions { display: flex; gap: 0.5rem; padding: 1rem; background-color: var(--surface-2); }
.card-actions .btn { flex: 1; }
.btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
.btn-primary { background-color: var(--primary); color: white; }
.btn-secondary { background-color: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
.btn-edit { background-color: #f59e0b; color: white; }
.btn-danger { background-color: #ef4444; color: white; }
.actions-cell { display: flex; justify-content: center; gap: 0.5rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
.modal-content { background: var(--surface); padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; }
.modal-title { font-size: 1.5rem; font-weight: 600; text-align: center; margin-bottom: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
input, textarea, .file-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px; background-color: var(--surface-2); }
.preview-image { max-width: 100px; margin-top: 1rem; border-radius: 8px; }
.modal-actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
.descripcion-texto { white-space: pre-wrap; word-wrap: break-word; }
.pagination-container { display: flex; justify-content: center; margin-top: 1.5rem; }
.pagination-controls { display: flex; gap: 0.5rem; }
.pagination-controls button { width: 2.5rem; height: 2.5rem; border: 1px solid var(--border); background-color: var(--surface-2); border-radius: 6px; }
.pagination-controls button.active { background-color: var(--primary); color: white; }
.pagination-ellipsis { width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; }
</style>