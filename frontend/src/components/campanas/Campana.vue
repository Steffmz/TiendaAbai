<template>
  <div class="h-full flex flex-col">
    <div class="max-w-7xl w-full mx-auto px-4">
      <!-- Título -->
      <div class="pt-4 pb-2 px-6 mb-1 shadow-sm text-center">
        <h1 class="text-4xl font-bold text-gray-800 mb-1">Gestión de Campañas</h1>
        <p class="text-gray-500 text-lg">Administra tus campañas promocionales</p>
      </div>

      <!-- Barra búsqueda y botón -->
      <div class="w-full flex justify-center mb-6">
        <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
          <input
            v-model="filtro"
            type="text"
            placeholder="Buscar campañas..."
            class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50
                   focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                   text-sm shadow-sm transition-all duration-200"
          />
          
          <button 
            @click="abrirModalNueva" 
            class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md
                   hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg"
          >
            + Nueva Campaña
          </button>
        </div>
      </div>

      <!-- TABLA -->
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
          <th class="px-3 py-3 text-center font-semibold w-32">Fecha Inicio</th>
          <th class="px-3 py-3 text-center font-semibold w-32">Fecha Fin</th>
          <th class="px-3 py-3 text-center font-semibold w-32">Fecha Creación</th>
          <th class="px-3 py-3 text-center font-semibold w-28">Estado</th>
          <th class="px-3 py-3 text-center font-semibold w-36">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(campana, index) in campanasPaginadas" 
          :key="campana.id" 
          :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
          class="border-b border-gray-100 hover:bg-[#fac8012f] transition-colors duration-150"
        >
          <!-- Imagen -->
          <td class="px-3 py-3 text-center">
            <div class="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm mx-auto">
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
          </td>

          <!-- Nombre -->
          <td class="px-3 py-3 text-gray-800 font-medium text-center">
            <div class="truncate max-w-[160px]" :title="campana.titulo">
              {{ campana.titulo }}
            </div>
          </td>

          <!-- Descripción -->
          <td class="px-3 py-3 text-center">
            <button 
              @click="mostrarDescripcion = mostrarDescripcion === campana.id ? null : campana.id"
              class="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm text-blue-700 font-medium transition-colors"
            >
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
                <button 
                  @click="abrirModalVerProductos(campana)" 
                  class="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm text-blue-700 font-medium transition-colors"
                >
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
            <span 
              :class="campana.aprobada 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'" 
              class="px-2 py-1 rounded-full text-xs font-medium"
            >
              {{ campana.aprobada ? 'Activa' : 'Finalizada' }}
            </span>
          </td>
          <!-- Acciones -->
          <td class="px-3 py-3">
            <div class="flex items-center justify-center gap-2">  
              <button 
                @click="abrirModalEditar(campana)"  
                class="bg-blue-100 text-black hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150"
              >
                Editar
              </button>
              <button 
                @click="confirmarEliminar(campana)" 
                class="bg-red-100 text-black hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
    </div>

    <!-- Modal de descripción (fuera de la tabla) -->
            <div 
          v-if="mostrarDescripcion"
          class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          @click="mostrarDescripcion = null"
        >
          <div 
            class="relative bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl p-6 w-full max-w-md mx-auto"
            @click.stop
          >

            <!-- Contenido -->
            <div class="bg-[var(--surface-2)] rounded-lg p-4">
              <p class="text-base text-[var(--text)] leading-relaxed break-words whitespace-pre-wrap">
                {{ campanas.find(c => c.id === mostrarDescripcion)?.descripcion }}
              </p>
            </div>

            <!-- Botón cerrar abajo -->
            <div class="mt-4 text-center">
              <button 
                @click="mostrarDescripcion = null"
                class="px-4 py-2 bg-[#74B9E7] text-black rounded-lg hover:bg-[#FFB93B] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>


    <!-- Modal Nueva/Editar Campaña -->
    <div v-if="modalAbierto" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-3">
      <div class="bg-white rounded-xl max-w-lg w-full p-4 shadow-lg border border-gray-200 relative">
        <!-- X -->
        <button @click="cerrarModal" class="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-lg font-bold">✕</button>

        <h2 class="text-lg font-bold text-blue-400 mb-3 text-center">
          {{ editando ? 'Editar Campaña' : 'Nueva Campaña' }}
        </h2>
          
        <!-- Formulario -->
        <form @submit.prevent="guardarCampana" class="space-y-3">
          <!-- Nombre -->
          <div>
            <label class="block text-xs font-medium text-blue-400 mb-1 text-center">Nombre de la Campaña *</label>
            <input
              v-model="formulario.titulo"
              type="text"
              required
              placeholder="Ej: Promo Verano 2024"
              class="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-xs font-medium text-blue-400 mb-1 text-center">Descripción *</label>
            <textarea
              v-model="formulario.descripcion"
              required
              rows="2"
              placeholder="Describe la campaña..."
              class="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 placeholder-gray-500 text-center text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
            ></textarea>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-xs font-medium text-blue-400 mb-1 text-center">Estado *</label>
            <select
              v-model="formulario.aprobada"
              required
              class="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 text-center text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            >
              <option :value="true">Activa</option>
              <option :value="false">Inactiva</option>
            </select>
          </div>

          <!-- Puntos y Descuento -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-blue-400 mb-1 text-center">Puntos *</label>
              <input
                v-model.number="formulario.puntos"
                type="number"
                required
                min="1"
                placeholder="100"
                class="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 text-center text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-blue-400 mb-1 text-center">Descuento (%) *</label>
              <input
                v-model.number="formulario.descuento"
                type="number"
                required
                min="1"
                max="100"
                placeholder="15"
                class="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 text-center text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-blue-400 mb-1 text-center">Fecha Inicio *</label>
              <input
                type="date" v-model="formulario.fechaInicio"
                class="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 text-center text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-blue-400 mb-1 text-center">Fecha Fin *</label>
              <input
                type="date" v-model="formulario.fechaFin"
                class="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 text-center text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          <!-- Imagen -->
          <div>
            <label class="block text-xs font-medium text-blue-400 mb-1 text-center">Imagen</label>
            <input
              type="file"
              @change="manejarSubidaImagen" accept="image/*"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
            <div v-if="previewImage" class="mt-3 flex justify-center">
              <img :src="previewImage" class="w-16 h-16 rounded-lg object-cover border border-gray-300 shadow-sm" alt="Preview" />
            </div>
          </div>

          <!-- Productos -->
          <div>
            <label class="block text-xs font-medium text-blue-700 mb-1 text-center">Productos</label>
            <button 
              type="button"
              class="px-3 py-1 bg-blue-200 rounded-md text-sm font-semibold hover:bg-blue-300 transition"
              @click="modalSeleccionProductos = true"
            >
              Seleccionar Productos
            </button>
            <ul class="list-disc list-inside text-blue-700 mt-2 text-sm">
              <li v-for="p in productosSeleccionados" :key="p.id">{{ p.nombre }}</li>
              <li v-if="productosSeleccionados.length === 0" class="text-gray-400">Ninguno</li>
            </ul>
          </div>

          <!-- Botón Guardar -->
          <div class="pt-2 flex justify-center">
            <button
              type="submit"
              class="px-5 py-3 rounded-lg bg-blue-300 text-black hover:bg-[#FFB93B] border border-blue-400 transition"
            >
              {{ editando ? 'Actualizar' : 'Crear' }} 
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Selección de productos (formulario) -->
    <div v-if="modalSeleccionProductos" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-4 w-full max-w-lg">
        <h2 class="text-lg font-bold mb-3">Seleccionar Productos</h2>
        <table class="w-full border">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2">✔</th>
              <th class="p-2">Nombre</th>
              <th class="p-2">Precio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in productos" :key="p.id" class="border-t">
              <td class="text-center">
                <input type="checkbox" :value="p" v-model="productosSeleccionados" />
              </td>
              <td class="p-2">{{ p.nombre }}</td>
              <td class="p-2">{{ p.precioPuntos }}</td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-end mt-3">
          <button class="bg-gray-500 text-white px-3 py-1 rounded" @click="modalSeleccionProductos = false">Cerrar</button>
        </div>
      </div>
    </div>


    <!-- Modal Ver productos (tabla) -->
      <div v-if="modalVerProductos" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"> 
          <h2 class="text-xl font-bold mb-4 text-center">Productos de {{ campanaActual?.titulo }}</h2>

          <ul v-if="campanaActual?.productos?.length" class="divide-y">
            <li 
              v-for="prod in campanaActual.productos" 
              :key="prod.id" 
              class="flex justify-between py-2"
            >
              <span>{{ prod.nombre }}</span>
              <span class="font-semibold text-gray-700">{{ prod.precio }} $</span>
            </li>
          </ul>
          <p v-else class="text-gray-500 text-center">No hay productos en esta campaña.</p>

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

            <!-- Paginación -->
        <div class="flex flex-col items-center justify-center mt-4">
          <p class="text-gray-700">
            Existen <span class="text-blue-500 font-semibold">{{ totalCampanas }}</span> campañas
          </p>

          <div class="flex items-center mt-2 space-x-1">
            <button
              @click="paginaAnterior"
              :disabled="paginaActual === 1"
              class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <button
              v-for="pagina in paginasVisibles"
              :key="pagina"
              @click="irAPagina(pagina)"
              :class="[
                'w-8 h-8 flex items-center justify-center rounded-md border font-medium',
                paginaActual === pagina
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-[#fffef9] border-gray-200 text-gray-600 hover:bg-gray-100'
              ]"
            >
              {{ pagina }}
            </button>
            <button
              @click="paginaSiguiente"
              :disabled="paginaActual === totalPaginas"
              class="w-8 h-8 flex items-center justify-center rounded-md bg-[#fffef9] border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
  irAPagina          
} = useCampana()
</script>
