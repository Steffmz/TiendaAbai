<template>
  <div class="h-full flex flex-col">
    <div class="max-w-7xl w-full mx-auto px-4">
      <div class="pt-4 pb-2 px-6 mb-1 shadow-sm text-center">
        <h1 class="text-4xl font-bold text-gray-800 mb-1">Gestión de Campañas</h1>
        <p class="text-gray-500 text-lg">Administra tus campañas promocionales</p>
      </div>

      <div class="w-full flex justify-center mb-6">
        <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
          <input v-model="filtro" type="text" placeholder="Buscar campañas..."
            class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 text-sm shadow-sm transition-all duration-200" />
          <button @click="abrirModalNueva"
            class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg">
            + Nueva Campaña
          </button>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-7xl mx-auto overflow-hidden">
        <div>
          <table class="w-full border-collapse">
            <thead class="bg-[#74B9E7] text-black">
              <tr>
                <th class="px-3 py-3 text-center font-semibold w-24">Imagen</th>
                <th class="px-3 py-3 text-center font-semibold w-40">Nombre</th>
                <th class="px-3 py-3 text-center font-semibold w-24">Descripción</th>
                <th class="px-3 py-3 text-center font-semibold w-28">Puntos</th>
                <th class="px-3 py-3 text-center font-semibold w-28">Descuento</th>
                <th class="px-3 py-3 text-center font-semibold w-48">Productos</th>
                <th class="px-3 py-3 text-center font-semibold w-32">Fechas</th>
                <th class="px-3 py-3 text-center font-semibold w-28">Estado</th>
                <th class="px-3 py-3 text-center font-semibold w-36">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
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

              <!-- Con datos -->
              <template v-else-if="campanasPaginadas.length > 0">
                <tr v-for="(campana, index) in campanasPaginadas" :key="campana.id"
                  :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
                  class="border-b border-gray-100 hover:bg-[#fac8012f] transition-colors duration-150">
                  <td class="px-3 py-3 text-center">
                    <div class="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm mx-auto">
                      <img :src="campana.imagenUrl ? `${API_BASE_URL}${campana.imagenUrl}` : placeholder"
                        alt="Imagen campaña" class="w-full h-full object-cover" />
                    </div>
                  </td>

                  <td class="px-3 py-3 text-gray-800 font-medium text-center">
                    <div class="truncate max-w-[160px]" :title="campana.titulo">{{ campana.titulo }}</div>
                  </td>

                  <td class="px-3 py-3 text-center">
                    <button @click="mostrarDescripcion = campana.descripcion"
                      class="btn btn-secondary text-xs">Ver</button>
                  </td>

                  <td class="px-3 py-3 text-blue-700 font-semibold text-center">{{ campana.puntos ?? '-' }}</td>

                  <td class="px-3 py-3 text-green-600 font-semibold text-center">
                    {{ (campana.descuento ?? null) !== null ? campana.descuento + '%' : '-' }}
                  </td>

                  <td class="px-4 py-2 text-center">
                    <button @click="abrirModalVerProductos(campana)" class="btn btn-secondary text-xs">
                      Ver ({{ campana.productos?.length ?? 0 }})
                    </button>
                  </td>

                  <td class="px-3 py-3 text-gray-500 text-sm text-center">
                    {{ new Date(campana.fechaInicio).toLocaleDateString('es-CO') }} -
                    {{ new Date(campana.fechaFin).toLocaleDateString('es-CO') }}
                  </td>

                  <td class="px-3 py-3 text-center">
                    <span :class="['badge', campana.aprobada ? 'success' : 'danger']">
                      {{ campana.aprobada ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>

                  <td class="px-3 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="abrirModalEditar(campana)" class="btn btn-edit">Editar</button>
                      <button @click="confirmarEliminar(campana)" class="btn btn-danger">Eliminar</button>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Empty -->
              <template v-else>
                <tr>
                  <td colspan="9">
                    <EmptyState icon="mdi:bullhorn-search-outline" title="No se encontraron campañas"
                      message="Prueba con otro término de búsqueda o crea una nueva campaña." />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar (con slots correctos) -->
    <BaseModal :show="modalAbierto" :title="editando ? 'Editar Campaña' : 'Nueva Campaña'" @close="cerrarModal"
      width="800px">
      <form id="campanaForm" @submit.prevent="guardarCampana">
        <div class="form-grid">
          <div class="form-group grid-col-span-2">
            <label>Nombre de la Campaña *</label>
            <input v-model="formulario.titulo" type="text" required placeholder="Ej: Promo Verano 2024" />
          </div>

          <div class="form-group grid-col-span-2">
            <label>Descripción</label>
            <textarea v-model="formulario.descripcion" rows="3" placeholder="Describe la campaña..."></textarea>
          </div>

          <div class="form-group">
            <label>Fecha Inicio *</label>
            <input type="date" v-model="formulario.fechaInicio" />
          </div>
          <div class="form-group">
            <label>Fecha Fin *</label>
            <input type="date" v-model="formulario.fechaFin" />
          </div>

          <div class="form-group">
            <label>Puntos</label>
            <input v-model.number="formulario.puntos" type="number" min="0" placeholder="Opcional. Ej: 100" />
          </div>
          <div class="form-group">
            <label>Descuento (%)</label>
            <input v-model.number="formulario.descuento" type="number" min="0" max="100"
              placeholder="Opcional. Ej: 15" />
          </div>

          <div class="form-group">
            <label>Estado *</label>
            <select v-model="formulario.aprobada" required>
              <option :value="true">Activa</option>
              <option :value="false">Inactiva</option>
            </select>
          </div>

          <div class="form-group">
            <label>Imagen</label>
            <input type="file" @change="manejarSubidaImagen" accept="image/*" />
          </div>

          <div v-if="previewImage" class="form-group col-span-2">
            <label class="block font-semibold mb-2">Vista Previa</label>
            <div class="flex justify-center">
              <img :src="previewImage" alt="Preview"
                class="max-w-[120px] max-h-[120px] object-contain rounded-md border shadow" />
            </div>
          </div>

          <div class="form-group grid-col-span-2">
            <label>Productos</label>
            <button type="button" class="btn btn-secondary" @click="modalSeleccionProductos = true">
              Seleccionar Productos ({{ productosSeleccionados.length }})
            </button>
          </div>
        </div>
      </form>

      <!-- 👇 acciones como hijo directo del modal -->
      <template #actions>
        <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
        <button type="submit" form="campanaForm" class="btn btn-primary">
          {{ editando ? 'Actualizar Campaña' : 'Crear Campaña' }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal Ver productos -->
    <BaseModal :show="modalVerProductos" :title="`Productos de ${campanaActual?.titulo ?? ''}`"
      @close="modalVerProductos = false" width="500px">
      <ul v-if="campanaActual?.productos?.length" class="product-list-modal">
        <li v-for="prod in campanaActual.productos" :key="prod.id">
          <span>{{ prod.nombre }}</span>
          <span class="font-semibold">{{ prod.precioPuntos }} pts</span>
        </li>
      </ul>
      <p v-else class="text-center text-gray-500">No hay productos en esta campaña.</p>

      <template #actions>
        <button @click="modalVerProductos = false" class="btn btn-primary">Cerrar</button>
      </template>
    </BaseModal>

    <!-- Modal Selección de productos -->
    <BaseModal :show="modalSeleccionProductos" title="Seleccionar Productos" @close="modalSeleccionProductos = false">
      <div class="product-selection-table">
        <table>
          <thead>
            <tr>
              <th>✔</th>
              <th>Nombre</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in productos" :key="p.id">
              <td><input type="checkbox" :checked="isProductoSeleccionado(p)" @change="toggleProductoSeleccionado(p)" />
              </td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.precioPuntos }} pts</td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #actions>
        <button @click="modalSeleccionProductos = false" class="btn btn-primary">Aceptar</button>
      </template>
    </BaseModal>

    <!-- Modal Descripción -->
    <BaseModal :show="!!mostrarDescripcion" title="Descripción de la Campaña" @close="mostrarDescripcion = null"
      width="500px">
      <p class="whitespace-pre-wrap">{{ mostrarDescripcion }}</p>
      <template #actions>
        <button @click="mostrarDescripcion = null" class="btn btn-primary">Cerrar</button>
      </template>
    </BaseModal>

    <!-- Paginación -->
    <div class="flex flex-col items-center justify-center mt-4">
      <p v-if="!loading" class="text-gray-700">
        Existen <span class="text-blue-500 font-semibold">{{ totalCampanas }}</span> campañas
      </p>
      <div v-if="!loading && totalPaginas > 1" class="flex items-center mt-2 space-x-1">
        <button @click="paginaAnterior" :disabled="paginaActual === 1" class="pagination-button">←</button>
        <template v-for="(pagina, index) in paginasVisibles" :key="index">
          <span v-if="pagina === '...'" class="pagination-ellipsis">&hellip;</span>
          <button v-else @click="irAPagina(pagina)"
            :class="['pagination-button', { 'active': paginaActual === pagina }]">
            {{ pagina }}
          </button>
        </template>
        <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas" class="pagination-button">→</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import useCampana from './useCampana';
import BaseModal from '../shared/BaseModal.vue';
import BaseSkeleton from '../shared/BaseSkeleton.vue';
import EmptyState from '../shared/EmptyState.vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const {
  filtro,
  placeholder,
  modalAbierto,
  modalSeleccionProductos,
  modalVerProductos,
  editando,
  previewImage,
  mostrarDescripcion,
  campanaActual,
  campanasPaginadas,
  formulario,
  productos,
  productosSeleccionados,
  abrirModalNueva,
  abrirModalEditar,
  abrirModalVerProductos,
  cerrarModal,
  guardarCampana,
  confirmarEliminar,
  manejarSubidaImagen,
  totalCampanas,
  paginaAnterior,
  paginaSiguiente,
  paginaActual,
  totalPaginas,
  paginasVisibles,
  irAPagina,
  isProductoSeleccionado,
  toggleProductoSeleccionado,
  loading,
} = useCampana();
</script>

<style scoped>
.modal-content {
  width: 95%;
  max-width: 800px;
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
}

.grid-col-span-2 {
  grid-column: span 2 / span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  text-align: left;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #f9fafb;
  text-align: left;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #74B9E7;
  box-shadow: 0 0 0 2px rgba(116, 185, 231, 0.4);
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  width: fit-content;
  border: 1px solid #d1d5db;
}

.product-list-modal {
  list-style: none;
  padding: 0;
}

.product-list-modal li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.product-selection-table table {
  width: 100%;
}

.product-selection-table th,
.product-selection-table td {
  padding: 0.5rem;
  text-align: left;
}

.modal-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.pagination-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--border);
  background-color: var(--surface-2);
  color: var(--text);
  font-weight: 500;
  cursor: pointer;
}

.pagination-button.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--primary-contrast);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-ellipsis {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.badge.success {
  background-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.badge.danger {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--primary-contrast);
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

.btn-info {
  background-color: #3b82f6;
  color: white;
}
</style>
