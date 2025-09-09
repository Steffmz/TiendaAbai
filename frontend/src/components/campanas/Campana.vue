<template>
  <div class="max-w-7xl w-full mx-auto px-4">
    <div class="page-header">
      <h1 class="page-title">Gestión de Campañas</h1>
      <p class="page-subtitle">Administra tus campañas promocionales</p>
    </div>

    <div class="actions-bar">
      <input v-model="filtro" type="text" placeholder="Buscar campañas..." class="search-input" />
      <button @click="abrirModalNueva" class="btn-primary">
        + Nueva Campaña
      </button>
    </div>

    <div class="hidden lg:block table-container">
        <table>
          <thead>
            <tr>
              <th class="w-24">Imagen</th>
              <th class="w-40">Nombre</th>
              <th class="w-24">Descripción</th>
              <th class="w-28">Puntos</th>
              <th class="w-28">Descuento</th>
              <th class="w-48">Productos</th>
              <th class="w-32">Fechas</th>
              <th class="w-28">Estado</th>
              <th class="w-36">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr>
                <td colspan="9" class="p-0">
                  <div v-for="i in 5" :key="i" class="flex items-center p-4 gap-4 border-b border-[var(--border)]">
                    <BaseSkeleton width="56px" height="56px" radius="8px" />
                    <BaseSkeleton width="120px" height="24px" radius="6px" />
                    <BaseSkeleton width="60px" height="32px" radius="6px" />
                    <BaseSkeleton width="60px" height="24px" radius="6px" />
                    <BaseSkeleton width="60px" height="24px" radius="6px" />
                    <BaseSkeleton width="80px" height="32px" radius="6px" />
                    <BaseSkeleton width="100px" height="24px" radius="6px" />
                    <BaseSkeleton width="80px" height="24px" radius="6px" />
                    <div class="flex-grow flex justify-center gap-2">
                      <BaseSkeleton width="80px" height="32px" radius="6px" />
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="campanasPaginadas.length > 0">
              <tr v-for="campana in campanasPaginadas" :key="campana.id" class="table-row">
                <td>
                  <div class="image-wrapper mx-auto">
                    <img :src="campana.imagenUrl ? `${API_BASE_URL}${campana.imagenUrl}` : placeholder" alt="Imagen campaña" class="table-image" />
                  </div>
                </td>
                <td><div class="truncate max-w-[160px] mx-auto" :title="campana.titulo">{{ campana.titulo }}</div></td>
                <td><button @click="mostrarDescripcion = campana.descripcion" class="btn btn-secondary text-xs">Ver</button></td>
                <td>{{ campana.puntos ?? '-' }}</td>
                <td>{{ (campana.descuento ?? null) !== null ? campana.descuento + '%' : '-' }}</td>
                <td>
                  <button @click="abrirModalVerProductos(campana)" class="btn btn-secondary text-xs">
                    Ver ({{ campana.productos?.length ?? 0 }})
                  </button>
                </td>
                <td>{{ new Date(campana.fechaInicio).toLocaleDateString('es-CO') }} - {{ new Date(campana.fechaFin).toLocaleDateString('es-CO') }}</td>
                <td><span :class="['badge', campana.aprobada ? 'success' : 'danger']">{{ campana.aprobada ? 'Activa' : 'Inactiva' }}</span></td>
                <td class="actions-cell">
                  <button @click="abrirModalEditar(campana)" class="btn btn-edit">Editar</button>
                  <button @click="confirmarEliminar(campana)" class="btn btn-danger">Eliminar</button>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="9">
                  <EmptyState icon="mdi:bullhorn-search-outline" title="No se encontraron campañas" message="Prueba con otro término de búsqueda o crea una nueva campaña." />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
    </div>

    <div class="lg:hidden space-y-4 mb-4">
        <div v-if="loading">
            <div v-for="i in 3" :key="i" class="bg-white rounded-xl shadow-md border p-4">
                <div class="flex items-start gap-4 mb-4">
                    <BaseSkeleton width="64px" height="64px" radius="8px" />
                    <div class="flex-1 min-w-0">
                         <BaseSkeleton width="75%" height="24px" radius="6px" />
                         <BaseSkeleton width="40%" height="20px" radius="6px" class="mt-2" />
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="campanasPaginadas.length === 0">
             <EmptyState icon="mdi:bullhorn-search-outline" title="No se encontraron campañas" message="Prueba con otro término de búsqueda o crea una nueva campaña." />
        </div>
        <div v-else v-for="campana in campanasPaginadas" :key="campana.id" class="mobile-card">
            <div class="flex items-start gap-4 mb-4">
                <div class="flex-shrink-0">
                    <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border shadow-sm">
                        <img :src="campana.imagenUrl ? `${API_BASE_URL}${campana.imagenUrl}` : placeholder" alt="Imagen campaña" class="w-full h-full object-cover" />
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold truncate mb-1">{{ campana.titulo }}</h3>
                    <span :class="['badge', campana.aprobada ? 'success' : 'danger']">{{ campana.aprobada ? 'Activa' : 'Inactiva' }}</span>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center"><p class="text-sm text-gray-500 font-medium">Puntos</p><p class="text-lg font-semibold">{{ campana.puntos ?? '-' }}</p></div>
                <div class="text-center"><p class="text-sm text-gray-500 font-medium">Descuento</p><p class="text-lg font-semibold">{{ (campana.descuento ?? null) !== null ? campana.descuento + '%' : '-' }}</p></div>
            </div>
            <div class="text-sm mb-4">
                <p><span class="font-medium">Inicio:</span> {{ new Date(campana.fechaInicio).toLocaleDateString('es-CO') }}</p>
                <p><span class="font-medium">Fin:</span> {{ new Date(campana.fechaFin).toLocaleDateString('es-CO') }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
                <button @click="mostrarDescripcion = campana.descripcion" class="btn btn-secondary">Descripción</button>
                <button @click="abrirModalVerProductos(campana)" class="btn btn-secondary">Productos ({{ campana.productos?.length ?? 0 }})</button>
                <button @click="abrirModalEditar(campana)" class="btn btn-edit">Editar</button>
                <button @click="confirmarEliminar(campana)" class="btn btn-danger">Eliminar</button>
            </div>
        </div>
    </div>
    
    <div class="pagination-container">
        <p v-if="!loading">Existen <span class="font-semibold">{{ totalCampanas }}</span> campañas</p>
        <div v-if="!loading && totalPaginas > 1" class="pagination-controls">
            <button @click="paginaAnterior" :disabled="paginaActual === 1" class="pagination-button">←</button>
            <template v-for="(pagina, index) in paginasVisibles" :key="index">
                <span v-if="pagina === '...'" class="pagination-ellipsis">&hellip;</span>
                <button v-else @click="irAPagina(pagina)" :class="['pagination-button', { 'active': paginaActual === pagina }]">{{ pagina }}</button>
            </template>
            <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas" class="pagination-button">→</button>
        </div>
    </div>
  </div>

  <BaseModal :show="modalAbierto" :title="editando ? 'Editar Campaña' : 'Nueva Campaña'" @close="cerrarModal" width="800px">
      <form id="campanaForm" @submit.prevent="guardarCampana">
          <div class="form-grid">
              <div class="form-group grid-col-span-2"><label>Nombre de la Campaña *</label><input v-model="formulario.titulo" type="text" required placeholder="Ej: Promo Verano 2024" /></div>
              <div class="form-group grid-col-span-2"><label>Descripción</label><textarea v-model="formulario.descripcion" rows="3" placeholder="Describe la campaña..."></textarea></div>
              <div class="form-group"><label>Fecha Inicio *</label><input v-model="formulario.fechaInicio" type="date" /></div>
              <div class="form-group"><label>Fecha Fin *</label><input v-model="formulario.fechaFin" type="date" /></div>
              <div class="form-group"><label>Puntos</label><input v-model.number="formulario.puntos" type="number" min="0" placeholder="Opcional. Ej: 100" /></div>
              <div class="form-group"><label>Descuento (%)</label><input v-model.number="formulario.descuento" type="number" min="0" max="100" placeholder="Opcional. Ej: 15" /></div>
              <div class="form-group"><label>Estado *</label><select v-model="formulario.aprobada" required><option :value="true">Activa</option><option :value="false">Inactiva</option></select></div>
              <div class="form-group"><label>Imagen</label><input type="file" @change="manejarSubidaImagen" accept="image/*" /></div>
              <div v-if="previewImage" class="form-group col-span-2"><label class="block font-semibold mb-2">Vista Previa</label><div class="flex justify-center"><img :src="previewImage" alt="Preview" class="max-w-[120px] max-h-[120px] object-contain rounded-md border shadow" /></div></div>
              <div class="form-group grid-col-span-2"><label>Productos</label><button type="button" class="btn btn-secondary" @click="modalSeleccionProductos = true">Seleccionar Productos ({{ productosSeleccionados.length }})</button></div>
          </div>
      </form>
      <template #actions>
          <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
          <button type="submit" form="campanaForm" class="btn btn-primary">{{ editando ? 'Actualizar Campaña' : 'Crear Campaña' }}</button>
      </template>
  </BaseModal>

  <BaseModal :show="modalVerProductos" :title="`Productos de ${campanaActual?.titulo ?? ''}`" @close="modalVerProductos = false" width="500px">
      <ul v-if="campanaActual?.productos?.length" class="product-list-modal">
          <li v-for="prod in campanaActual.productos" :key="prod.id">
              <span>{{ prod.nombre }}</span>
              <span class="font-semibold">{{ prod.precioPuntos }} pts</span>
          </li>
      </ul>
      <p v-else class="text-center text-gray-500">No hay productos en esta campaña.</p>
      <template #actions><button @click="modalVerProductos = false" class="btn btn-primary">Cerrar</button></template>
  </BaseModal>

  <BaseModal :show="modalSeleccionProductos" title="Seleccionar Productos" @close="modalSeleccionProductos = false">
      <div class="product-selection-table">
          <table>
              <thead><tr><th>✔</th><th>Nombre</th><th>Puntos</th></tr></thead>
              <tbody>
                  <tr v-for="p in productos" :key="p.id">
                      <td><input type="checkbox" :checked="isProductoSeleccionado(p)" @change="toggleProductoSeleccionado(p)" /></td>
                      <td>{{ p.nombre }}</td>
                      <td>{{ p.precioPuntos }} pts</td>
                  </tr>
              </tbody>
          </table>
      </div>
      <template #actions><button @click="modalSeleccionProductos = false" class="btn btn-primary">Aceptar</button></template>
  </BaseModal>

  <BaseModal :show="!!mostrarDescripcion" title="Descripción de la Campaña" @close="mostrarDescripcion = null" width="500px">
      <p class="whitespace-pre-wrap">{{ mostrarDescripcion }}</p>
      <template #actions><button @click="mostrarDescripcion = null" class="btn btn-primary">Cerrar</button></template>
  </BaseModal>
</template>

<script setup>
import useCampana from './useCampana';
import BaseModal from '../shared/BaseModal.vue';
import BaseSkeleton from '../shared/BaseSkeleton.vue';
import EmptyState from '../shared/EmptyState.vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const {
  filtro, placeholder, modalAbierto, modalSeleccionProductos, modalVerProductos, editando,
  previewImage, mostrarDescripcion, campanaActual, campanasPaginadas, formulario,
  productos, productosSeleccionados, abrirModalNueva, abrirModalEditar, abrirModalVerProductos,
  cerrarModal, guardarCampana, confirmarEliminar, manejarSubidaImagen, totalCampanas,
  paginaAnterior, paginaSiguiente, paginaActual, totalPaginas, paginasVisibles,
  irAPagina, isProductoSeleccionado, toggleProductoSeleccionado, loading,
} = useCampana();
</script>

<style scoped>
/* Estilos unificados de tu rama `main` con adaptaciones */
.max-w-7xl { max-width: 80rem; margin: 0 auto; width: 100%; }
.page-header { text-align: center; margin-bottom: 1.5rem; }
.page-title { font-size: 1.8rem; font-weight: 700; }
.page-subtitle { color: var(--text-muted); }
.actions-bar { display: flex; flex-direction: column; md:flex-direction: row; justify-content: center; align-items: center; margin-bottom: 1.5rem; gap: 0.75rem; }
.search-input { padding: 0.6rem 1rem; border: 1px solid var(--border); border-radius: 6px; width: 100%; md:w-80; }
.table-container { overflow-x: auto; background: var(--surface); border-radius: 8px; border: 1px solid var(--border); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px 12px; text-align: center; border-bottom: 1px solid var(--border); }
th { background-color: var(--table-header); color: white; font-weight: 600; }
.table-row:hover { background-color: rgba(0,0,0,0.02); }
.image-wrapper { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
.table-image { width: 100%; height: 100%; object-fit: cover; }
.actions-cell { display: flex; justify-content: center; gap: 0.5rem; }

/* Estilos para tarjetas móviles (de Gaviota) */
.mobile-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border);
    padding: 1rem;
    transition: box-shadow 0.2s ease;
}
.mobile-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }

/* Paginación */
.pagination-container { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0.75rem; margin-top: 1.5rem; color: var(--text-muted); }
.pagination-controls { display: flex; gap: 0.5rem; }
.pagination-button { width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid var(--border); background-color: var(--surface-2); color: var(--text); font-weight: 500; cursor: pointer; }
.pagination-button.active { background-color: var(--primary); border-color: var(--primary); color: var(--primary-contrast); }
.pagination-button:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination-ellipsis { width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; }

/* Estilos de Modales y Formularios */
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.grid-col-span-2 { grid-column: span 2; }
.form-group label { display: block; text-align: left; margin-bottom: 0.5rem; font-weight: 500; }
.product-list-modal { list-style: none; padding: 0; }
.product-list-modal li { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
.product-selection-table table { width: 100%; }
.product-selection-table th, .product-selection-table td { padding: 0.5rem; text-align: left; }
</style>