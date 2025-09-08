<template>
  <div class="h-full flex flex-col">
    <div class="max-w-7xl w-full mx-auto px-4">
      <!-- Título -->
      <div class="pt-4 pb-2 px-6 mb-1 shadow-sm text-center">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1">Gestión de Campañas</h1>
        <p class="text-gray-500 text-sm sm:text-base md:text-lg">Administra tus campañas promocionales</p>
      </div>

      <!-- Barra búsqueda y botón -->
      <div class="w-full flex justify-center mb-4 sm:mb-6">
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full max-w-3xl px-2 sm:px-0">
          <input 
            v-model="filtro" 
            type="text" 
            placeholder="Buscar campañas..." 
            class="w-full sm:w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50
                   focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                   text-sm shadow-sm transition-all duration-200" 
          />

          <button 
            @click="abrirModalNueva" 
            class="w-full sm:w-auto px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md
                   hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg whitespace-nowrap">
            + Nueva Campaña
          </button>
        </div>
      </div>

      <!-- TABLA - Desktop -->
      <div class="hidden lg:block rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-7xl mx-auto overflow-hidden">
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

                <!-- Imagen -->
                <td class="px-3 py-3 text-center">
                  <div class="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm mx-auto">
                    <img :src="campana.imagenUrl
                      ? (campana.imagenUrl.startsWith('http')
                        ? campana.imagenUrl
                        : `http://localhost:3000${campana.imagenUrl}`)
                      : placeholder" alt="Imagen campaña" class="w-full h-full object-cover" />
                  </div>
                </td>

                <!-- Nombre -->
                <td class="px-3 py-3 text-gray-800 font-medium text-center">
                  <div class="truncate max-w-[160px]" :title="campana.titulo">
                    {{ campana.titulo }}
                  </div>
                </td>

                <!-- Descripción -->
                <td class="px-3 py-3 text-center">
                  <button @click="mostrarDescripcion = mostrarDescripcion === campana.id ? null : campana.id"
                    class="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm text-blue-700 font-medium transition-colors">
                    Ver
                  </button>
                </td>

                <!-- Puntos -->
                <td class="px-3 py-3 text-blue-700 font-semibold text-center">
                  {{ campana.puntos ?? '-' }}
                </td>

                <!-- Descuento -->
                <td class="px-3 py-3 text-green-600 font-semibold text-center">
                  {{ campana.descuento !== null && campana.descuento !== undefined ? campana.descuento + '%' : '-' }}
                </td>

                <!-- Productos -->
                <td class="px-4 py-2 text-center">
                  <button @click="abrirModalVerProductos(campana)"
                    class="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm text-blue-700 font-medium transition-colors">
                    Ver
                  </button>
                </td>

                <!-- Fechas -->
                <td class="px-3 py-3 text-gray-500 text-sm text-center">
                  {{ new Date(campana.fechaInicio).toLocaleDateString('es-CO') }}
                </td>
                <td class="px-3 py-3 text-gray-500 text-sm text-center">
                  {{ new Date(campana.fechaFin).toLocaleDateString('es-CO') }}
                </td>
                <td class="px-3 py-3 text-gray-500 text-sm text-center">
                  {{ new Date(campana.fechaCreacion).toLocaleDateString('es-CO') }}
                </td>

                <!-- Estado -->
                <td class="px-3 py-3 text-center">
                  <span :class="campana.aprobada
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ campana.aprobada ? 'Activa' : 'Finalizada' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-3 py-3">
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

      <!-- VISTA MÓVIL - Cards -->
      <div class="lg:hidden space-y-4 mb-4">
        <div 
          v-for="(campana, index) in campanasPaginadas" 
          :key="campana.id"
          class="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200"
        >
          <!-- Header de la card -->
          <div class="flex items-start gap-4 mb-4">
            <!-- Imagen -->
            <div class="flex-shrink-0">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img 
                  :src="campana.imagenUrl
                    ? (campana.imagenUrl.startsWith('http')
                      ? campana.imagenUrl
                      : `http://localhost:3000${campana.imagenUrl}`)
                    : placeholder" 
                  alt="Imagen campaña" 
                  class="w-full h-full object-cover" 
                />
              </div>
            </div>

            <!-- Título y Estado -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-800 truncate mb-1">
                {{ campana.titulo }}
              </h3>
              <div class="flex items-center justify-between">
                <span 
                  :class="campana.aprobada
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ campana.aprobada ? 'Activa' : 'Finalizada' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Información principal -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center">
              <p class="text-sm text-gray-500 font-medium">Puntos</p>
              <p class="text-lg font-semibold text-blue-700">{{ campana.puntos ?? '-' }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 font-medium">Descuento</p>
              <p class="text-lg font-semibold text-green-600">
                {{ campana.descuento !== null && campana.descuento !== undefined ? campana.descuento + '%' : '-' }}
              </p>
            </div>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 text-sm">
            <div>
              <p class="text-gray-500 font-medium">Inicio:</p>
              <p class="text-gray-700">{{ new Date(campana.fechaInicio).toLocaleDateString('es-CO') }}</p>
            </div>
            <div>
              <p class="text-gray-500 font-medium">Fin:</p>
              <p class="text-gray-700">{{ new Date(campana.fechaFin).toLocaleDateString('es-CO') }}</p>
            </div>
            <div>
              <p class="text-gray-500 font-medium">Creación:</p>
              <p class="text-gray-700">{{ new Date(campana.fechaCreacion).toLocaleDateString('es-CO') }}</p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <button 
              @click="mostrarDescripcion = mostrarDescripcion === campana.id ? null : campana.id"
              class="bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded-md text-blue-700 font-medium transition-colors text-center">
              Ver Descripción
            </button>
            <button 
              @click="abrirModalVerProductos(campana)"
              class="bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded-md text-blue-700 font-medium transition-colors text-center">
              Ver Productos
            </button>
            <button 
              @click="abrirModalEditar(campana)"
              class="bg-yellow-100 hover:bg-yellow-200 px-3 py-2 rounded-md text-yellow-700 font-medium transition-colors text-center">
              Editar
            </button>
            <button 
              @click="confirmarEliminar(campana)"
              class="bg-red-100 hover:bg-red-200 px-3 py-2 rounded-md text-red-700 font-medium transition-colors text-center">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de descripción -->
    <div v-if="mostrarDescripcion"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      @click="mostrarDescripcion = null">
      <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md mx-auto"
        @click.stop>

        <!-- Contenido -->
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-base text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
            {{campanas.find(c => c.id === mostrarDescripcion)?.descripcion}}
          </p>
        </div>

        <!-- Botón cerrar abajo -->
        <div class="mt-4 text-center">
          <button @click="mostrarDescripcion = null"
            class="px-4 py-2 bg-[#74B9E7] text-black rounded-lg hover:bg-[#FFB93B] transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal principal de formulario -->
    <div v-if="modalAbierto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="modal-content bg-white rounded-xl shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button 
          @click="cerrarModal"
          class="absolute top-2 right-2 p-1 z-10
                text-gray-500 hover:text-white 
                hover:bg-red-500 rounded-full 
                transition duration-200 text-xl"
         >
          &times;
        </button>

        <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 text-center pr-8">
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
                  class="max-w-[100px] sm:max-w-[120px] max-h-[100px] sm:max-h-[120px] object-contain rounded-md border shadow"
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

    <!-- Modal Selección de productos -->
    <div v-if="modalSeleccionProductos"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-4 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-3">Seleccionar Productos</h2>
        
        <!-- Versión móvil - Cards -->
        <div class="block sm:hidden space-y-3 max-h-96 overflow-y-auto">
          <div v-for="p in productos" :key="p.id" 
            class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              :checked="isProductoSeleccionado(p)"
              @change="toggleProductoSeleccionado(p)"
              class="w-4 h-4"
            />
            <div class="flex-1">
              <p class="font-medium">{{ p.nombre }}</p>
              <p class="text-sm text-gray-600">{{ p.precioPuntos }} pts</p>
            </div>
          </div>
        </div>

        <!-- Versión desktop - Tabla -->
        <div class="hidden sm:block">
          <table class="w-full border">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2">✓</th>
                <th class="p-2">Nombre</th>
                <th class="p-2">Puntos</th>
              </tr>
            </thead>
            <tbody class="max-h-60 overflow-y-auto">
              <tr v-for="p in productos" :key="p.id" class="border-t">
                <td class="text-center">
                  <input
                    type="checkbox"
                    :checked="isProductoSeleccionado(p)"
                    @change="toggleProductoSeleccionado(p)"
                  />
                </td>
                <td class="p-2">{{ p.nombre }}</td>
                <td class="p-2">{{ p.precioPuntos }} pts</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mt-3">
          <button
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            @click="modalSeleccionProductos = false"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Ver productos -->
    <div v-if="modalVerProductos" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div class="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 class="text-lg sm:text-xl font-bold mb-4 text-center">
          Productos de {{ campanaActual?.titulo }}
        </h2>

        <ul v-if="campanaActual?.productos?.length" class="divide-y space-y-2">
          <li
            v-for="prod in campanaActual.productos"
            :key="prod.id"
            class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1 sm:gap-0"
          >
            <!-- Nombre -->
            <span class="flex-1 font-medium">{{ prod.nombre }}</span>

            <div class="flex justify-between sm:block text-sm">
              <!-- Puntos -->
              <span class="text-indigo-600 sm:mr-4">
                {{ prod.precioPuntos }} pts
              </span>

              <!-- Precio -->
              <span class="font-semibold text-gray-700">
                {{ prod.precio }} $
              </span>
            </div>
          </li>
        </ul>

        <p v-else class="text-gray-500 text-center">
          No hay productos en esta campaña.
        </p>

        <div class="mt-4 text-center">
          <button
            @click="modalVerProductos = false"
            class="bg-[#74B9E7] hover:bg-[#FFB93B] text-black px-4 py-2 rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="flex flex-col items-center justify-center mt-4 px-4">
      <p class="text-gray-700 text-sm sm:text-base mb-2">
        Existen <span class="text-blue-500 font-semibold">{{ totalCampanas }}</span> campañas
      </p>

      <div class="flex items-center space-x-1 overflow-x-auto pb-2">
        <button @click="paginaAnterior" :disabled="paginaActual === 1"
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          ←
        </button>
        <button v-for="pagina in paginasVisibles" :key="pagina" @click="irAPagina(pagina)" :class="[
          'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md border font-medium',
          paginaActual === pagina
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-[#fffef9] border-gray-200 text-gray-600 hover:bg-gray-100'
        ]">
          {{ pagina }}
        </button>
        <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas"
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import useCampana from './useCampana'

const {
  BASE,
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

<style scoped>
/* =================================
   🎨 ESTILOS GENERALES Y UTILIDADES
   ================================= */

/* Transiciones suaves */
.transition-all {
  transition: all 0.2s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

.transition-shadow {
  transition: box-shadow 0.2s ease;
}

/* Estados de carga */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Accesibilidad - Focus states */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #74B9E7;
  outline-offset: 2px;
}

/* =================================
   📝 MODALES - Estilos base
   ================================= */

.modal-content {
  width: 95%;
  max-width: 800px;
  padding: 1.5rem;
  border-radius: 12px;
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  z-index: 50;
}

.modal-close-btn:hover {
  color: #ef4444;
  transform: scale(1.1);
}

.modal-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

/* =================================
   📋 FORMULARIOS - Grid y campos
   ================================= */

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

/* =================================
   🔘 BOTONES - Estilos y variantes
   ================================= */

.btn-primary,
.btn-submit {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  background-color: #FFB93B;
  color: black;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.btn-primary:hover,
.btn-submit:hover {
  background-color: #74B9E7;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  width: fit-content;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

/* =================================
   📋 LISTAS Y CARDS
   ================================= */

.product-list {
  list-style-type: disc;
  list-style-position: inside;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #4b5563;
}

/* Cards móviles */
@media (max-width: 1023px) {
  .mobile-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    padding: 1rem;
    margin-bottom: 1rem;
    transition: box-shadow 0.2s ease;
  }
  
  .mobile-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* =================================
   🎞️ SCROLL PERSONALIZADO
   ================================= */

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* =================================
   📱 RESPONSIVE DESIGN
   ================================= */

/* Tablet - 1024px y menor */
@media (max-width: 1024px) {
  .modal-content {
    max-width: 650px;
    padding: 1.5rem;
  }
}

/* Mobile - 768px y menor */
@media (max-width: 768px) {
  /* Modal */
  .modal-content {
    width: 95%;
    max-width: none;
    padding: 1rem;
    border-radius: 10px;
  }
  
  /* Grid de formularios */
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .grid-col-span-2 {
    grid-column: span 1 / span 1;
  }
  
  /* Campos de formulario */
  .form-group label {
    font-size: 0.85rem;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    font-size: 0.9rem;
    padding: 0.5rem 0.7rem;
  }
  
  /* Botones y acciones */
  .modal-actions {
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 1.5rem;
  }
  
  .btn-primary {
    width: 100%;
    padding: 0.7rem;
    font-size: 0.95rem;
  }
  
  .btn-secondary {
    width: 100%;
  }
  
  /* Tabla responsive - Card layout */
  table,
  thead,
  tbody,
  th,
  td,
  tr {
    display: block;
    width: 100%;
  }
  
  thead {
    display: none;
  }
  
  tr {
    margin-bottom: 0.8rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0.8rem 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    text-align: center;
    font-size: 0.9rem;
  }
  
  td {
    display: block;
    padding: 0.4rem 0;
    border: none;
    font-size: 0.9rem;
    text-align: center;
  }
  
  td::before {
    content: attr(data-label);
    display: block;
    font-weight: 600;
    color: #374151;
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
    text-align: center;
  }
  
  td img {
    margin: 0 auto;
    max-width: 90px;
    max-height: 90px;
    border-radius: 6px;
  }
  
  .flex.items-center.justify-center.gap-2 {
    flex-direction: column;
    gap: 0.4rem;
    align-items: center;
  }
  
  button {
    width: 85%;
    max-width: 220px;
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    border-radius: 8px !important;
    font-weight: 600;
    text-align: center;
  }
}

/* Mobile pequeño - 640px y menor */
@media (max-width: 640px) {
  .grid.grid-cols-2.sm\\:grid-cols-4 {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .grid.grid-cols-2.sm\\:grid-cols-4 button {
    width: 100%;
    text-align: center;
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}

/* Mobile muy pequeño - 480px y menor */
@media (max-width: 480px) {
  .modal-content {
    width: 98%;
    padding: 0.8rem;
    margin: 0.5rem;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    font-size: 0.85rem;
    padding: 0.45rem 0.6rem;
  }
  
  .btn-primary {
    font-size: 0.9rem;
    padding: 0.6rem;
  }
  
  /* Paginación centrada */
  .flex.items-center.space-x-1 {
    justify-content: center;
    padding: 0 1rem;
  }
  
  .flex.items-center.space-x-1 button {
    min-width: 2rem;
    min-height: 2rem;
  }
}

/* Mobile extremadamente pequeño - 375px y menor */
@media (max-width: 375px) {
  .modal-content {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
    padding: 1rem 0.5rem;
  }
  
  .fixed.inset-0 {
    padding: 0;
  }
}
</style>