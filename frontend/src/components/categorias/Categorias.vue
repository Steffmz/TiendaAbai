<template>
  <div class="page-container">
    <div class="max-w-7xl w-full mx-auto">
      <!-- Encabezado -->
      <div class="page-header">
        <h1 class="text-4xl font-bold text-gray-800 mb-1">Gestión de Categorías</h1>
        <p class="text-gray-500 text-lg">Administra tus categorías de forma intuitiva.</p>
      </div>

      <!-- Barra de Búsqueda y Botón -->
      <div class="w-full flex justify-center mb-6">
        <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
          <input v-model="filtro" type="text" placeholder="Buscar Categoria..." class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50
                   focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                   text-sm shadow-sm transition-all duration-200" />

          <button @click="abrirModalNueva" class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md
                   hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg">
            + Nueva Categoria
          </button>
        </div>
      </div>
      <!-- Tabla de Categorías -->
      <div class="rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-7xl mx-auto overflow-hidden">
        <table class="w-full border-collapse">
          <thead class="bg-[#74B9E7] text-black">
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-8">Cargando categorías...</td>
            </tr>
            <tr v-else-if="categoriasPaginadas.length === 0">
              <td colspan="5" class="text-center py-8">No se encontraron categorías.</td>
            </tr>
            <tr v-else v-for="categoria in categoriasPaginadas" :key="categoria.id">
              <td class="flex justify-center py-2">
                <div class="w-14 h-14 rounded-lg overflow-hidden border image-border">
                  <img :src="categoria.imagenUrl ? `${API_BASE_URL}${categoria.imagenUrl}` : placeholder"
                    class="w-full h-full object-cover" alt="Foto" />
                </div>
              </td>
              <td class="text-center">{{ categoria.nombre }}</td>
              <td class="text-center">
                <button @click="mostrarDescripcion = categoria.descripcion" class="btn-secondary text-xs">Ver</button>
              </td>
              <td class="text-center">
                <Switch :modelValue="categoria.activo" @update:modelValue="cambioEstado(categoria)" />
              </td>
              <td class="actions-cell">
                <button @click="abrirModalEditar(categoria)" class="btn btn-edit">Editar</button>
                <button @click="irAProductos(categoria.id)" class="btn btn-success">Catálogo</button>
                <button @click="confirmarEliminar(categoria)" class="btn btn-danger">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="pagination-container">
        <p v-if="!loading">Existen {{ totalCategorias }} categorías</p>

        <div v-if="!loading && totalPaginas > 1">
          <button @click="paginaAnterior" :disabled="paginaActual === 1">←</button>
          <template v-for="(pagina, index) in paginasVisibles" :key="index">
            <span v-if="pagina === '...'" class="pagination-ellipsis">&hellip;</span>
            <button v-else @click="irAPagina(pagina)" :class="{ active: paginaActual === pagina }">{{ pagina }}</button>
          </template>
          <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas">→</button>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <h2 class="modal-title">{{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
        <form @submit.prevent="guardarCategoria" class="space-y-5">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.nombre" type="text" required placeholder="Nombre de la categoría" />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" rows="3" placeholder="Descripción de la categoría"></textarea>
          </div>
          <div class="form-group">
            <label>Imagen</label>
            <input type="file" @change="handleImageUpload" accept="image/*" class="file-input" />
            <div v-if="previewImage" class="mt-4 flex justify-center">
              <img :src="previewImage" class="w-24 h-24 rounded-lg object-cover border image-border" alt="Preview" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de descripción -->
    <div v-if="mostrarDescripcion" class="modal-overlay" @click="mostrarDescripcion = null">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">Descripción</h2>
        <p>{{ mostrarDescripcion }}</p>
        <div class="modal-actions mt-4">
          <button @click="mostrarDescripcion = null" class="btn btn-primary">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useCategorias from './useCategorias';
import Switch from './Switch.vue';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();
const mostrarDescripcion = ref(null);

const {
  categoriasPaginadas,
  totalCategorias,
  totalPaginas,
  paginaActual,
  paginasVisibles,
  filtro,
  loading,
  placeholder,
  form,
  previewImage,
  mostrarModal,
  editando,
  cambioEstado,
  paginaAnterior,
  paginaSiguiente,
  irAPagina,
  abrirModalNueva,
  abrirModalEditar,
  cerrarModal,
  guardarCategoria,
  handleImageUpload,
  confirmarEliminar
} = useCategorias();

const irAProductos = (categoriaId) => {
  router.push(`/dashboard/productos/${categoriaId}`);
};
</script>

<style scoped>
/* --- ESTILOS UNIFICADOS CON VARIABLES DE TEMA --- */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  justify-content: flex-start;
}

.max-w-7xl {
  max-width: 80rem;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

/* Encabezado y Acciones */
.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text);
}

.page-subtitle {
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-input {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  width: 300px;
  background-color: var(--surface-2);
  color: var(--text);
}

/* Tabla */
.table-container {
  overflow-x: auto;
  background: var(--surface);
  border-radius: 8px;
  border: 1px solid var(--border);
}

table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text);
}

th,
td {
  padding: 12px 15px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid var(--border);
}

th {
  background-color: var(--table-header);
  color: white;
}

.image-border {
  border-color: var(--border);
}

/* Botones */
.btn-primary {
  background-color: var(--primary);
  color: var(--primary-contrast);
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background-color: var(--surface-2);
  color: var(--text);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.btn-edit {
  background-color: #f59e0b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
}

.btn-success {
  background-color: #22c55e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* Paginación */
.pagination-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  color: var(--text-muted);
}

.pagination-container div {
  display: flex;
  gap: 0.5rem;
}

.pagination-container button {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border);
  background-color: var(--surface-2);
  color: var(--text);
  border-radius: 6px;
}

.pagination-container button.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--primary-contrast);
}

.pagination-container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--surface);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  border: 1px solid var(--border);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-align: left;
  color: var(--text);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--surface-2);
  color: var(--text);
}

.file-input {
  font-size: 0.9rem;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.pagination-container button.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--primary-contrast);
}

.pagination-container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-ellipsis {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
