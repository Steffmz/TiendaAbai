<template>
  <div class="max-w-7xl w-full mx-auto flex flex-col h-full">

    <div class="page-header flex-shrink-0">
      <h1 class="page-title">Gestión de Categorías</h1>
      <p class="page-subtitle">Administra las categorías</p>
    </div>

    <div class="w-full flex justify-center mb-6 flex-shrink-0">
      <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
        <input v-model="filtro" type="text" placeholder="Buscar categoría..."
          class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 text-sm shadow-sm transition-all duration-200" />
        <button @click="abrirModalNueva"
          class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg">
          + Nueva Categoría
        </button>
      </div>
    </div>

    <div class="flex-grow overflow-y-auto pb-4">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 4" :key="i">
              <td>
                <BaseSkeleton width="56px" height="56px" radius="8px" />
              </td>
              <td>
                <BaseSkeleton width="150px" height="24px" radius="6px" />
              </td>
              <td>
                <BaseSkeleton width="100px" height="24px" radius="6px" />
              </td>
              <td>
                <div class="actions-cell">
                  <BaseSkeleton width="70px" height="32px" radius="6px" />
                  <BaseSkeleton width="70px" height="32px" radius="6px" />
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
                  <img :src="categoria.imagenUrl ? `${API_BASE_URL}${categoria.imagenUrl}` : placeholder"
                    class="w-14 h-14 object-cover rounded-lg border" />
                </div>
              </td>
              <td>{{ categoria.nombre }}</td>
              <td>
                <span :class="['badge', categoria.activo ? 'success' : 'danger']">
                  {{ categoria.activo ? "Activo" : "Inactivo" }}
                </span>
              </td>
              <td>
                <div class="actions-cell">
                  <button @click="abrirModalEditar(categoria)" class="btn-edit">Editar</button>
                  <button @click="irAProductos(categoria.id)"
                    class="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Catálogo</button>
                  <button @click="cambioEstado(categoria)"
                    :class="[categoria.activo ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200' : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200']">
                    {{ categoria.activo ? "Desactivar" : "Activar" }}
                  </button>
                  <button @click="confirmarEliminar(categoria)" class="btn-danger">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="cards-container md:hidden">
        <div v-if="loading">
          <div v-for="i in 4" :key="i" class="card">
            <div class="card-header">
              <BaseSkeleton width="64px" height="64px" radius="8px" />
              <div class="card-title-status flex-grow">
                <BaseSkeleton width="120px" height="20px" radius="4px" class="mb-2" />
                <BaseSkeleton width="80px" height="16px" radius="4px" />
              </div>
            </div>
            <div class="card-actions">
              <BaseSkeleton width="100%" height="28px" radius="4px" />
              <BaseSkeleton width="100%" height="28px" radius="4px" />
            </div>
          </div>
        </div>
        <div v-else-if="categoriasPaginadas.length === 0">
          <EmptyState icon="mdi:tag-off-outline" title="No se encontraron categorías"
            message="Prueba con otro término de búsqueda o crea una nueva categoría." />
        </div>
        <div v-else v-for="categoria in categoriasPaginadas" :key="categoria.id" class="card">
          <div class="card-header">
            <img :src="categoria.imagenUrl ? `${API_BASE_URL}${categoria.imagenUrl}` : placeholder"
              class="card-image" />
            <div class="card-title-status">
              <h3 class="card-title">{{ categoria.nombre }}</h3>
              <span :class="['badge', categoria.activo ? 'success' : 'danger']">
                {{ categoria.activo ? "Activo" : "Inactivo" }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button @click="abrirModalEditar(categoria)" class="btn-edit">Editar</button>
            <button @click="irAProductos(categoria.id)"
              class="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Catálogo</button>
            <button @click="cambioEstado(categoria)"
              :class="[categoria.activo ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200' : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200']">
              {{ categoria.activo ? "Desactivar" : "Activar" }}
            </button>
            <button @click="confirmarEliminar(categoria)" class="btn-danger">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && totalPaginas > 1" class="flex flex-col items-center justify-center mt-4">
        <p class="text-gray-700">
            Existen <span class="text-blue-500 font-semibold">{{ totalCategorias }}</span> categorías
        </p>
        <div class="flex items-center mt-2 space-x-1">
            <button @click="paginaAnterior" :disabled="paginaActual === 1"
              class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              ←
            </button>
            <button v-for="pagina in paginasVisibles" :key="pagina" @click="irAPagina(pagina)" :class="[
              'w-8 h-8 flex items-center justify-center rounded-md border font-medium',
              paginaActual === pagina
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-[#fffef9] border-gray-200 text-gray-600 hover:bg-gray-100',
              pagina === '...' ? 'cursor-default' : ''
            ]">
              {{ pagina }}
            </button>
            <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas"
              class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              →
            </button>
        </div>
    </div>


    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <h2 class="modal-title">{{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
        <form @submit.prevent="guardarCategoria">
          <div class="form-group"><label>Nombre</label><input v-model="form.nombre" type="text" required
              placeholder="Nombre de la categoría" /></div>
          <div class="form-group"><label>Imagen</label><input type="file" @change="handleImageUpload"
              accept="image/*" />
            <div v-if="previewImage" class="mt-4 flex justify-center"><img :src="previewImage"
                class="w-24 h-24 rounded-lg object-cover border" alt="Preview" /></div>
          </div>
          <div class="modal-actions"><button type="button" @click="cerrarModal"
              class="btn btn-secondary">Cancelar</button><button type="submit" class="btn btn-primary">{{ editando ?
                'Actualizar' : 'Crear' }}</button></div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import useCategorias from './useCategorias';
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
  cambioEstado,
  paginaAnterior,
  paginaSiguiente,
  abrirModalNueva,
  abrirModalEditar,
  cerrarModal,
  guardarCategoria,
  handleImageUpload,
  confirmarEliminar,
  totalCategorias,
  paginasVisibles,
  irAPagina
} = useCategorias();

const irAProductos = (categoriaId) => {
  router.push(`/dashboard/productos/${categoriaId}`);
};
</script>

<style src="../../assets/css/AdminGestion.css"></style>