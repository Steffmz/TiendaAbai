<template>
  <div class="max-w-7xl w-full mx-auto">
    <div class="page-header">
      <h1 class="page-title">Gestión de Categorías</h1>
      <p class="page-subtitle">Administra tus categorías de forma intuitiva.</p>
    </div>

    <div class="actions-bar">
      <input
        v-model="filtro"
        type="text"
        placeholder="Buscar Categoria..."
        class="search-input"
      />
      <button @click="abrirModalNueva" class="btn btn-primary">
        + Nueva Categoria
      </button>
    </div>

    <div class="table-container">
      <table class="hidden md:table w-full border-collapse">
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
          <tr v-else v-for="categoria in categoriasPaginadas" :key="categoria.id" class="table-row">
            <td class="flex justify-center py-2">
              <div class="image-wrapper">
                <img
                  :src="categoria.imagenUrl ? `${API_BASE_URL}${categoria.imagenUrl}` : placeholder"
                  class="table-image"
                  alt="Foto"
                />
              </div>
            </td>
            <td class="text-center">{{ categoria.nombre }}</td>
            <td class="text-center">
              <button @click="mostrarDescripcion = categoria.descripcion" class="btn-secondary text-xs">
                Ver
              </button>
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

      <div class="md:hidden">
          <div v-if="loading" class="text-center py-8">Cargando categorías...</div>
          <div v-else-if="categoriasPaginadas.length === 0" class="text-center py-8">No se encontraron categorías.</div>
          <div v-else class="cards-container">
            <div v-for="categoria in categoriasPaginadas" :key="categoria.id" class="card">
              <div class="card-header">
                  <img :src="categoria.imagenUrl ? `${API_BASE_URL}${categoria.imagenUrl}` : placeholder" class="card-image" alt="Foto"/>
                  <h3 class="card-title">{{ categoria.nombre }}</h3>
              </div>
              <div class="card-body">
                <div class="card-row">
                  <strong>Estado:</strong>
                  <Switch :modelValue="categoria.activo" @update:modelValue="cambioEstado(categoria)" />
                </div>
                  <div class="card-row">
                  <strong>Descripción:</strong>
                  <button @click="mostrarDescripcion = categoria.descripcion" class="btn-secondary text-xs">Ver</button>
                </div>
              </div>
              <div class="card-actions">
                <button @click="abrirModalEditar(categoria)" class="btn btn-edit">Editar</button>
                <button @click="irAProductos(categoria.id)" class="btn btn-success">Catálogo</button>
                <button @click="confirmarEliminar(categoria)" class="btn btn-danger">Eliminar</button>
              </div>
            </div>
          </div>
      </div>
    </div>

    <div class="pagination-container">
      <p v-if="!loading">Existen {{ totalCategorias }} categorías</p>
      <div v-if="!loading && totalPaginas > 1" class="pagination-controls">
        <button @click="paginaAnterior" :disabled="paginaActual === 1">←</button>
        <template v-for="(pagina, index) in paginasVisibles" :key="index">
          <span v-if="pagina === '...'" class="pagination-ellipsis">&hellip;</span>
          <button v-else @click="irAPagina(pagina)" :class="{ active: paginaActual === pagina }">
            {{ pagina }}
          </button>
        </template>
        <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas">→</button>
      </div>
    </div>

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
// El script no necesita cambios
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
/* LOS ESTILOS PERMANECEN IGUALES, PERO YA NO SE APLICARÁ LA CLASE .page-container */

.max-w-7xl {
  max-width: 80rem;
  width: 100%;
  margin: 0 auto;
}

/* Encabezado */
.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
}
.page-subtitle {
  color: var(--text-muted);
}

/* Barra de acciones */
.actions-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 768px) {
  .actions-bar {
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
}
.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
}
@media (min-width: 768px) {
  .search-input {
    width: 300px;
  }
}

/* --- Tabla --- */
.table-container {
    overflow-x: auto;
    background: var(--surface);
    border-radius: 12px;
    border: 1px solid var(--border);
}
.table-row {
    border-bottom: 1px solid var(--border);
    transition: background-color 0.2s;
}
.table-row:hover {
    background-color: rgba(0,0,0,0.02);
}
.table-row:last-child {
    border-bottom: none;
}
.hidden { display: none; }
@media (min-width: 768px) {
    .md\:table { display: table; }
    .md\:hidden { display: none; }
}
table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text);
}
th, td {
  padding: 12px 15px;
  text-align: center;
  vertical-align: middle;
}
th {
    padding-top: 1rem;
    padding-bottom: 1rem;
    background-color: var(--table-header);
    color: white;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
}

/* --- Tarjetas (móvil) --- */
.cards-container {
  padding: 0.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.card {
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}
.card-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    object-fit: cover;
}
.card-title {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--text);
}
.card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 0.9rem;
}
.card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.card-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
}
.card-actions .btn {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.8rem;
}

/* --- Elementos Comunes --- */
.image-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
}
.table-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-primary {
  background-color: var(--primary);
  color: var(--primary-contrast);
}
.btn-secondary {
  background-color: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-edit {
  background-color: #f59e0b;
  color: white;
}
.btn-danger {
  background-color: #ef4444;
  color: white;
}
.btn-success {
  background-color: #22c55e;
  color: white;
}
.actions-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
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
.pagination-controls {
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
  transition: all 0.2s;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  background: var(--surface);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  border: 1px solid var(--border);
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-group {
  margin-bottom: 1.25rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-align: left;
}
.form-group input,
.form-group textarea,
.file-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--surface-2);
  color: var(--text);
}
.modal-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>