// steffmz/tiendaabai/TiendaAbai-Wil/frontend/src/components/campanas/Campana.vue

<template>
  <div class="max-w-7xl w-full mx-auto flex flex-col h-full">
    
    <div class="page-header flex-shrink-0">
        <h1 class="page-title">Gestión de Campañas</h1>
        <p class="page-subtitle">Administra tus campañas promocionales</p>
    </div>

    <div class="w-full flex justify-center mb-6">
      <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
        <input v-model="filtro" type="text" placeholder="Buscar campañas..." class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50
                 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                 text-sm shadow-sm transition-all duration-200" />

        <button @click="abrirModalNueva" class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md
                 hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg">
          + Nueva Campaña
        </button>
      </div>
    </div>

    <div class="flex-grow overflow-y-auto pb-4">
        <div class="table-container">
            <table class="w-full border-collapse">
              <thead class="bg-[#74B9E7] text-black">
                <tr>
                  <th class="px-3 py-3 text-center font-semibold w-24">Imagen</th>
                  <th class="px-3 py-3 text-center font-semibold w-40">Nombre</th>
                  <th class="px-3 py-3 text-center font-semibold w-24">Descripción</th>
                  <th class="px-3 py-3 text-center font-semibold w-28">Puntos</th>
                  <th class="px-3 py-3 text-center font-semibold w-28">Descuento</th>
                  <th class="px-3 py-3 text-center font-semibold w-48">Productos</th>
                  <th class="px-3 py-3 text-center font-semibold w-32">Fecha Inicio</th>
                  <th class="px-3 py-3 text-center font-semibold w-32">Fecha Fin</th>
                  <th class="px-3 py-3 text-center font-semibold w-32">Fecha Creación</th>
                  <th class="px-3 py-3 text-center font-semibold w-28">Estado</th>
                  <th class="px-3 py-3 text-center font-semibold w-36">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(campana, index) in campanasPaginadas" :key="campana.id"
                  :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
                  class="border-b border-gray-100 hover:bg-[#fac8012f] transition-colors duration-150">

                  <td data-label="Imagen" class="px-3 py-3 text-center">
                      <div class="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm mx-auto">
                        <img :src="campana.imagenUrl
                          ? (campana.imagenUrl.startsWith('http')
                            ? campana.imagenUrl
                            : `http://localhost:3000${campana.imagenUrl}`)
                          : placeholder" alt="Imagen campaña" class="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td data-label="Nombre" class="px-3 py-3 text-gray-800 font-medium text-center">
                      <div class="truncate max-w-[160px]" :title="campana.titulo">
                        {{ campana.titulo }}
                      </div>
                    </td>
                    <td data-label="Descripción" class="px-3 py-3 text-center">
                      <button @click="mostrarDescripcion = mostrarDescripcion === campana.id ? null : campana.id"
                        class="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm text-blue-700 font-medium transition-colors">
                        Ver
                      </button>
                    </td>
                    <td data-label="Puntos" class="px-3 py-3 text-green-500 font-semibold text-center">
                      {{ campana.puntos ?? '-' }}
                    </td>
                    <td data-label="Descuento" class="px-3 py-3 text-green-500 font-semibold text-center">
                      {{ campana.descuento !== null && campana.descuento !== undefined ? campana.descuento + '%' : '-' }}
                    </td>
                    <td data-label="Productos" class="px-4 py-2 text-center">
                      <button @click="abrirModalVerProductos(campana)"
                        class="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm text-blue-700 font-medium transition-colors">
                        Ver
                      </button>
                    </td>
                    <td data-label="Fecha Inicio" class="px-3 py-3 text-gray-500 text-sm text-center">
                      {{ new Date(campana.fechaInicio).toLocaleDateString('es-CO') }}
                    </td>
                    <td data-label="Fecha Fin" class="px-3 py-3 text-gray-500 text-sm text-center">
                      {{ new Date(campana.fechaFin).toLocaleDateString('es-CO') }}
                    </td>
                    <td data-label="Fecha Creación" class="px-3 py-3 text-gray-500 text-sm text-center">
                      {{ new Date(campana.fechaCreacion).toLocaleDateString('es-CO') }}
                    </td>
                    <td data-label="Estado" class="px-3 py-3 text-center">
                      <span :class="campana.aprobada
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'"
                        class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ campana.aprobada ? 'Activa' : 'Finalizada' }}
                      </span>
                    </td>
                    <td data-label="Acciones" class="px-3 py-3">
                      <div class="flex items-center justify-center gap-2">
                        <button @click="abrirModalEditar(campana)"
                          class="bg-blue-100 text-black hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                          Editar
                        </button>
                        <button @click="confirmarEliminar(campana)"
                          class="bg-red-100 text-black hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </td>
                </tr>
              </tbody>
            </table>
        </div>
    </div>
    
    <div v-if="mostrarDescripcion"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      @click="mostrarDescripcion = null">
      <div
        class="relative bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl p-6 w-full max-w-md mx-auto"
        @click.stop>
        <div class="bg-[var(--surface-2)] rounded-lg p-4">
          <p class="text-base text-[var(--text)] leading-relaxed break-words whitespace-pre-wrap">
            {{campanas.find(c => c.id === mostrarDescripcion)?.descripcion}}
          </p>
        </div>
        <div class="mt-4 text-center">
          <button @click="mostrarDescripcion = null"
            class="px-4 py-2 bg-[#74B9E7] text-black rounded-lg hover:bg-[#FFB93B] transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
    <div v-if="modalAbierto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="modal-content bg-white rounded-xl shadow-lg relative">
        <button 
          @click="cerrarModal"
          class="absolute top-2 right-2 p-1 
                text-gray-500 hover:text-white 
                hover:bg-red-500 rounded-full 
                transition duration-200 text-xl"
         >
          &times;
        </button>
        <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">
          {{ editando ? 'Editar Campaña' : 'Nueva Campaña' }}
        </h2>
        <form @submit.prevent="guardarCampana">
          <div class="form-grid">
            <div class="form-group grid-col-span-2">
              <label>Nombre de la Campaña *</label>
              <input v-model="formulario.titulo" type="text" required placeholder="Ej: Promo Verano 2024" />
            </div>
            <div class="form-group grid-col-span-2">
              <label>Descripción *</label>
              <textarea v-model="formulario.descripcion" required rows="3"
                placeholder="Describe la campaña..."></textarea>
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
              <label>Puntos *</label>
              <input v-model.number="formulario.puntos" type="number" required min="1" placeholder="100" />
            </div>
            <div class="form-group">
              <label>Descuento (%) *</label>
              <input v-model.number="formulario.descuento" type="number" required min="1" max="100" placeholder="15" />
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
                  <img 
                    :src="previewImage" 
                    alt="Preview" 
                    class="max-w-[120px] max-h-[120px] object-contain rounded-md border shadow"
                  />
                </div>
            </div>
            <div class="form-group grid-col-span-2">
              <label>Productos</label>
              <button type="button" class="btn btn-secondary" @click="modalSeleccionProductos = true">
                Seleccionar Productos
              </button>
              <ul class="product-list">
                <li v-for="p in productosSeleccionados" :key="p.id">{{ p.nombre }}</li>
                <li v-if="productosSeleccionados.length === 0" class="text-gray-400">Ninguno seleccionado</li>
              </ul>
            </div>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">
              {{ editando ? 'Actualizar Campaña' : 'Crear Campaña' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <div 
      v-if="modalSeleccionProductos"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="modal-content bg-white relative">
        <button 
          class="modal-close-btn" 
          @click="modalSeleccionProductos = false"
        >
          ✖
        </button>
        <h2 class="text-lg font-bold mb-3">Seleccionar Productos</h2>
        <table class="w-full border product-table">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2">✔</th>
              <th class="p-2">Nombre</th>
              <th class="p-2">Puntos</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="p in productos" 
              :key="p.id" 
              class="border-t"
            >
              <td class="text-center" data-label="Seleccionar">
                <input
                  type="checkbox"
                  :checked="isProductoSeleccionado(p)"
                  @change="toggleProductoSeleccionado(p)"
                />
              </td>
              <td class="p-2" data-label="Nombre">{{ p.nombre }}</td>
              <td class="p-2" data-label="Puntos">{{ p.precioPuntos }} pts</td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-end mt-3">
          <button
            class="bg-gray-500 text-white px-3 py-1 rounded"
            @click="modalSeleccionProductos = false"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
    <div v-if="modalVerProductos" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4 text-center">
          Productos de {{ campanaActual?.titulo }}
        </h2>
        <ul v-if="campanaActual?.productos?.length" class="divide-y">
          <li
            v-for="prod in campanaActual.productos"
            :key="prod.id"
            class="flex justify-between items-center py-2"
          >
            <span class="flex-1">{{ prod.nombre }}</span>
            <span class="text-sm text-indigo-600 mr-4">
              {{ prod.precioPuntos }} pts
            </span>
            <span class="font-semibold text-gray-700">
              {{ prod.precio }} $
            </span>
          </li>
        </ul>
        <p v-else class="text-gray-500 text-center">
          No hay productos en esta campaña.
        </p>
        <div class="mt-4 text-right">
          <button
            @click="modalVerProductos = false"
            class="bg-[#74B9E7] hover:bg-[#FFB93B] text-white px-4 py-2 rounded transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>


    <div class="pagination-controls flex-shrink-0">
      <p class="text-gray-700">
        Existen <span class="text-blue-500 font-semibold">{{ totalCampanas }}</span> campañas
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
            : 'bg-[#fffef9] border-gray-200 text-gray-600 hover:bg-gray-100'
        ]">
          {{ pagina }}
        </button>
        <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas"
          class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import useCampana from './useCampana'

const {
  // ... (el script no necesita cambios) ...
  filtro,
  placeholder,
  modalAbierto,
  modalSeleccionProductos,
  modalVerProductos,
  editando,
  previewImage,
  mostrarDescripcion,
  campanaActual,
  campanas,
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
} = useCampana()
</script>

<style src="../campanas/Campana.css"></style>