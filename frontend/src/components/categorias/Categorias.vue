<template>
  <div class="max-w-7xl w-full mx-auto">
    <div class="page-header">
      <h1 class="page-title">Gestión de Categorías</h1>
      <p class="page-subtitle">Administra tus categorías de forma intuitiva.</p>
    </div>

    <div class="w-full flex justify-center mb-6">
        <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
            <input v-model="filtro" type="text" placeholder="Buscar categoría..."
                class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50
                       focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                       text-sm shadow-sm transition-all duration-200" />

            <button @click="abrirModalNueva"
                class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md
                       hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg">
                + Nueva Categoría
            </button>
        </div>
    </div>

    <div class="hidden md:block rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-7xl mx-auto overflow-hidden">
      <table class="w-full border-collapse">
        <thead class="bg-[#74B9E7] text-black">
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="p-0">
              <div v-for="i in 5" :key="i" class="flex items-center p-4 gap-4 border-b border-[var(--border)]">
                <BaseSkeleton width="56px" height="56px" radius="8px" />
                <div class="flex-grow"><BaseSkeleton width="150px" height="24px" radius="6px" /></div>
                <div class="flex-grow"><BaseSkeleton width="80px" height="24px" radius="6px" /></div>
                <div class="flex-grow flex justify-center gap-2">
                  <BaseSkeleton width="80px" height="32px" radius="6px" />
                  <BaseSkeleton width="80px" height="32px" radius="6px" />
                  <BaseSkeleton width="80px" height="32px" radius="6px" />
                </div>
              </div>
            </td>
          </tr>
          <tr v-else-if="categoriasPaginadas.length === 0">
            <td colspan="4">
              <EmptyState icon="mdi:tag-off-outline" title="No se encontraron categorías"
                message="Prueba con otro término de búsqueda o crea una nueva categoría." />
            </td>
          </tr>
          <tr v-else v-for="categoria in categoriasPaginadas" :key="categoria.id">
            <td>
              <div class="flex justify-center">
                 <img :src="categoria.imagenUrl ? `${API_BASE_URL}${categoria.imagenUrl}` : placeholder" class="w-14 h-14 object-cover rounded-lg border"/>
              </div>
            </td>
            <td>{{ categoria.nombre }}</td>
            <td>
              <span :class="['badge', categoria.activo ? 'success' : 'danger']">
                {{ categoria.activo ? "Activo" : "Inactivo" }}
              </span>
            </td>
            <td class="actions-cell">
                <button @click="abrirModalEditar(categoria)" class="bg-blue-100 text-black hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150">
                    Editar
                </button>
                <button @click="irAProductos(categoria.id)" class="bg-green-100 text-black hover:bg-green-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150">
                    Catálogo
                </button>
                <button @click="cambioEstado(categoria)" :class="[categoria.activo ? 'bg-red-100 hover:bg-red-200' : 'bg-green-100 hover:bg-green-200', 'text-black px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150']">
                    {{ categoria.activo ? 'Desactivar' : 'Activar' }}
                </button>
                <button @click="confirmarEliminar(categoria)" class="bg-red-100 text-black hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150">
                    Eliminar
                </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="block md:hidden">
       <template v-if="loading">
          <div v-for="i in 5" :key="i" class="mobile-card mb-4">
              <BaseSkeleton width="100%" height="20px" radius="4px" class="mb-2" />
              <BaseSkeleton width="60%" height="16px" radius="4px" class="mb-2" />
              <div class="flex gap-2 mt-4">
                  <BaseSkeleton width="70px" height="28px" radius="4px" />
                  <BaseSkeleton width="70px" height="28px" radius="4px" />
                  <BaseSkeleton width="70px" height="28px" radius="4px" />
              </div>
          </div>
      </template>
      <template v-else-if="categoriasPaginadas.length > 0">
        <div v-for="categoria in categoriasPaginadas" :key="categoria.id" class="mobile-card">
          <div class="flex items-center mb-4">
              <img :src="categoria.imagenUrl ? `${API_BASE_URL}${categoria.imagenUrl}` : placeholder" class="w-16 h-16 object-cover rounded-lg mr-4" alt="Foto"/>
              <h3 class="mobile-card-title flex-grow">{{ categoria.nombre }}</h3>
              <span :class="['badge', categoria.activo ? 'success' : 'danger']">
                {{ categoria.activo ? "Activo" : "Inactivo" }}
              </span>
          </div>
           <div class="mobile-card-actions">
              <button @click="abrirModalEditar(categoria)" class="bg-blue-100 text-black hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium">Editar</button>
              <button @click="irAProductos(categoria.id)" class="bg-green-100 text-black hover:bg-green-200 px-3 py-1 rounded-md text-sm font-medium">Catálogo</button>
              <button @click="cambioEstado(categoria)" :class="[categoria.activo ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800', 'px-3 py-1 rounded-md text-sm font-medium']">
                  {{ categoria.activo ? 'Desactivar' : 'Activar' }}
              </button>
              <button @click="confirmarEliminar(categoria)" class="bg-red-100 text-black hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium">Eliminar</button>
          </div>
        </div>
      </template>
       <template v-else>
          <div class="mobile-empty">
              <EmptyState icon="mdi:tag-off-outline" title="No se encontraron categorías"
                  message="Prueba con otro término de búsqueda o crea una nueva categoría." />
          </div>
      </template>
    </div>

    <div v-if="!loading && totalPaginas > 1" class="pagination-controls">
       <button @click="paginaAnterior" :disabled="paginaActual === 1" class="btn btn-secondary">
        Anterior
      </button>
      <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
      <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas" class="btn btn-secondary">
        Siguiente
      </button>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <h2 class="modal-title">{{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
        <form @submit.prevent="guardarCategoria">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.nombre" type="text" required placeholder="Nombre de la categoría" />
          </div>
          <div class="form-group">
            <label>Imagen</label>
            <input type="file" @change="handleImageUpload" accept="image/*" />
            <div v-if="previewImage" class="mt-4 flex justify-center">
              <img :src="previewImage" class="w-24 h-24 rounded-lg object-cover border" alt="Preview" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import useCategorias from './useCategorias';
// Se elimina la importación del Switch ya que no se usa
// import Switch from './Switch.vue'; 
import BaseSkeleton from "../shared/BaseSkeleton.vue";
import EmptyState from "../shared/EmptyState.vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();

const {
  categoriasPaginadas,
  totalPaginas,
  paginaActual,
  filtro,
  loading,
  placeholder,
  form,
  previewImage,
  mostrarModal,
  editando,
  cambioEstado, // Esta función ya existía y la reutilizamos para el nuevo botón
  paginaAnterior,
  paginaSiguiente,
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

<style src="./Categorias.css"></style>