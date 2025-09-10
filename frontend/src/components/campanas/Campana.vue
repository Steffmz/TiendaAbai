<template>
  <div class="max-w-7xl w-full mx-auto flex flex-col h-full">

    <div class="page-header flex-shrink-0">
      <h1 class="page-title">Gestión de Campañas</h1>
      <p class="page-subtitle">Crea y administra tus campañas promocionales.</p>
    </div>

    <div class="actions-bar">
      <input v-model="filtro" type="text" placeholder="Buscar campaña por título..." class="search-input" />
      <button @click="abrirModalNueva" class="btn-new-item">+ Nueva Campaña</button>
    </div>

    <div class="flex-grow overflow-y-auto pb-4">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Fechas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 6" :key="i">
              <td><BaseSkeleton width="56px" height="56px" radius="8px" /></td>
              <td><BaseSkeleton width="150px" height="24px" radius="6px" /></td>
              <td><BaseSkeleton width="60px" height="28px" radius="6px" /></td>
              <td><BaseSkeleton width="120px" height="24px" radius="6px" /></td>
              <td><BaseSkeleton width="80px" height="24px" radius="6px" /></td>
              <td>
                <div class="actions-cell">
                  <BaseSkeleton width="70px" height="32px" radius="6px" />
                  <BaseSkeleton width="70px" height="32px" radius="6px" />
                </div>
              </td>
            </tr>
            <tr v-else-if="campanasPaginadas.length === 0">
              <td colspan="6">
                <EmptyState icon="mdi:bullhorn-off-outline" title="No se encontraron campañas" message="Prueba con otro término de búsqueda o crea una nueva campaña." />
              </td>
            </tr>
            <tr v-else v-for="campana in campanasPaginadas" :key="campana.id">
              <td><img :src="`${API_BASE_URL}${campana.imagenUrl}`" class="table-image" alt="Campaña"/></td>
              <td>{{ campana.titulo }}</td>
              <td><button @click="mostrarDescripcion = campana.descripcion" class="btn btn-secondary text-xs px-2 py-1">Ver</button></td>
              <td>{{ formatDate(campana.fechaInicio) }} - {{ formatDate(campana.fechaFin) }}</td>
              <td><span :class="['badge', campana.aprobada ? 'success' : 'danger']">{{ campana.aprobada ? 'Activa' : 'Inactiva' }}</span></td>
              <td>
                <div class="actions-cell">
                  <button @click="abrirModalEditar(campana)" class="btn-edit">Editar</button>
                  <button @click="confirmarEliminar(campana)" class="btn-danger">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="cards-container">
        <div v-if="loading">
          <div v-for="i in 4" :key="i" class="card"><BaseSkeleton width="100%" height="220px" /></div>
        </div>
        <div v-else-if="campanasPaginadas.length === 0">
          <EmptyState icon="mdi:bullhorn-off-outline" title="No se encontraron campañas" message="Prueba con otro término de búsqueda o crea una nueva campaña." />
        </div>
        <div v-else v-for="campana in campanasPaginadas" :key="campana.id" class="card">
          <div class="card-header">
            <img :src="`${API_BASE_URL}${campana.imagenUrl}`" class="card-image" />
            <div class="card-title-status">
              <h3 class="card-title">{{ campana.titulo }}</h3>
              <span :class="['badge', campana.aprobada ? 'success' : 'danger']">{{ campana.aprobada ? 'Activa' : 'Inactiva' }}</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-row"><strong>Inicia:</strong> {{ formatDate(campana.fechaInicio) }}</div>
            <div class="card-row"><strong>Finaliza:</strong> {{ formatDate(campana.fechaFin) }}</div>
          </div>
          <div class="card-actions">
            <button @click="abrirModalEditar(campana)" class="btn-edit">Editar</button>
            <button @click="confirmarEliminar(campana)" class="btn-danger">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && totalPaginas > 1" class="pagination-controls">
      <button @click="paginaAnterior" :disabled="paginaActual === 1" class="btn btn-secondary">Anterior</button>
      <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
      <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas" class="btn btn-secondary">Siguiente</button>
    </div>

    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <h2 class="modal-title">{{ editando ? 'Editar Campaña' : 'Nueva Campaña' }}</h2>
        <form @submit.prevent="guardarCampana">
          <div class="form-grid">
            <div class="form-group grid-col-span-2">
              <label>Nombre de la Campaña</label>
              <input v-model="formulario.titulo" type="text" required />
            </div>
            <div class="form-group grid-col-span-2">
              <label>Descripción</label>
              <textarea v-model="formulario.descripcion" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Fecha Inicio</label>
              <input v-model="formulario.fechaInicio" type="date" required />
            </div>
            <div class="form-group">
              <label>Fecha Fin</label>
              <input v-model="formulario.fechaFin" type="date" required />
            </div>
            <div class="form-group">
              <label>Puntos</label>
              <input v-model.number="formulario.puntos" type="number" min="0" />
            </div>
            <div class="form-group">
              <label>Descuento (%)</label>
              <input v-model.number="formulario.descuento" type="number" min="0" max="100" />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="formulario.aprobada">
                <option :value="true">Activa</option>
                <option :value="false">Inactiva</option>
              </select>
            </div>
            <div class="form-group">
              <label>Imagen</label>
              <input type="file" @change="manejarSubidaImagen" accept="image/*" />
            </div>
            <div v-if="previewImage" class="form-group grid-col-span-2">
                <label>Vista Previa</label>
                <img :src="previewImage" class="max-w-[150px] rounded-md border" />
            </div>
            <div class="form-group grid-col-span-2">
              <label>Productos Asociados</label>
              </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="mostrarDescripcion" class="modal-overlay" @click.self="mostrarDescripcion = null">
      <div class="modal-content">
        <h2 class="modal-title">Descripción</h2>
        <p class="text-center">{{ mostrarDescripcion }}</p>
        <div class="modal-actions">
          <button @click="mostrarDescripcion = null" class="btn btn-primary">Cerrar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { PAGINATION } from "../../config";
import BaseSkeleton from "../shared/BaseSkeleton.vue";
import EmptyState from "../shared/EmptyState.vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/campanas`;
const API_PRODUCTOS = `${API_BASE_URL}/api/productos`;

// --- STATE ---
const campanas = ref([]);
const productos = ref([]);
const loading = ref(true);
const filtro = ref("");
const paginaActual = ref(1);
const modalAbierto = ref(false);
const editando = ref(false);
const previewImage = ref(null);
const productosSeleccionados = ref([]);
const mostrarDescripcion = ref(null);

const formulario = ref({
  id: null,
  titulo: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
  aprobada: false,
  puntos: null,
  descuento: null,
  imagen: null,
});

// --- HELPERS ---
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("authToken");
  const headers = { Authorization: `Bearer ${token}` };
  if (isFormData) {
    headers["Content-Type"] = "multipart/form-data";
  }
  return { headers };
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', { timeZone: 'UTC' });
const formatDateForInput = (dateString) => new Date(dateString).toISOString().split("T")[0];

// --- PAGINACIÓN ---
const elementosPorPagina = PAGINATION.CAMPAIGNS || 6;
const campanasFiltradas = computed(() =>
  campanas.value.filter((c) =>
    c.titulo.toLowerCase().includes(filtro.value.toLowerCase())
  )
);
const totalPaginas = computed(() => Math.ceil(campanasFiltradas.value.length / elementosPorPagina));
const campanasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina;
  return campanasFiltradas.value.slice(inicio, inicio + elementosPorPagina);
});

const paginaAnterior = () => { if (paginaActual.value > 1) paginaActual.value--; };
const paginaSiguiente = () => { if (paginaActual.value < totalPaginas.value) paginaActual.value++; };


// --- LÓGICA DE DATOS ---
const cargarDatos = async () => {
  loading.value = true;
  try {
    const [resCampanas, resProductos] = await Promise.all([
      axios.get(API_URL, getAuthHeaders()),
      axios.get(API_PRODUCTOS, getAuthHeaders())
    ]);
    campanas.value = resCampanas.data;
    productos.value = resProductos.data;
  } catch (err) {
    Swal.fire("Error", "No se pudieron cargar los datos necesarios.", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(cargarDatos);

// --- LÓGICA DE MODAL Y FORMULARIO ---
const abrirModalNueva = () => {
  editando.value = false;
  formulario.value = {
    id: null,
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    aprobada: true,
    puntos: null,
    descuento: null,
    imagen: null,
  };
  productosSeleccionados.value = [];
  previewImage.value = null;
  modalAbierto.value = true;
};

const abrirModalEditar = (campana) => {
  editando.value = true;
  formulario.value = {
    ...campana,
    fechaInicio: formatDateForInput(campana.fechaInicio),
    fechaFin: formatDateForInput(campana.fechaFin),
    imagen: null,
  };
  previewImage.value = campana.imagenUrl ? `${API_BASE_URL}${campana.imagenUrl}` : null;
  productosSeleccionados.value = campana.productos || [];
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
};

const manejarSubidaImagen = (event) => {
  const file = event.target.files[0];
  if (file) {
    formulario.value.imagen = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const guardarCampana = async () => {
  const formData = new FormData();
  Object.keys(formulario.value).forEach(key => {
    if (key === 'imagen') return;
    if (formulario.value[key] !== null) {
      formData.append(key, formulario.value[key]);
    }
  });
  if (formulario.value.imagen) formData.append("imagen", formulario.value.imagen);
  if (productosSeleccionados.value.length > 0) {
    formData.append("productosIds", JSON.stringify(productosSeleccionados.value.map(p => p.id)));
  }

  try {
    const url = editando.value ? `${API_URL}/${formulario.value.id}` : API_URL;
    const method = editando.value ? 'put' : 'post';
    await axios({ method, url, data: formData, ...getAuthHeaders(true) });
    
    await cargarDatos();
    cerrarModal();
    Swal.fire("Éxito", `Campaña ${editando.value ? 'actualizada' : 'creada'}.`, "success");
  } catch (err) {
    Swal.fire("Error", "No se pudo guardar la campaña.", "error");
  }
};

const confirmarEliminar = (campana) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: `Se eliminará la campaña "${campana.titulo}"`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${campana.id}`, getAuthHeaders());
        await cargarDatos();
        Swal.fire("Eliminado", "La campaña ha sido eliminada.", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo eliminar la campaña.", "error");
      }
    }
  });
};
</script>

<style src="../../assets/css/AdminGestion.css"></style>