<template>
  <div class="max-w-7xl w-full mx-auto">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Gestión de Usuarios</h1>
      <p class="page-subtitle">Administra los usuarios del sistema.</p>
    </div>

    <!-- Barra de acciones -->
    <div class="w-full flex justify-center mb-6">
      <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
        <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o cédula..." class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50
                  focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                  text-sm shadow-sm transition-all duration-200" />

        <button @click="triggerFileInput" class="px-5 py-2 bg-green-500 text-white rounded-lg font-semibold shadow-md
               hover:bg-green-600 transition-all duration-200 hover:shadow-lg">
          Importar Excel
        </button>
        <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" accept=".xlsx, .xls" />


        <button @click="openModal()" class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md
                  hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg">
          + Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Vista Desktop - Tabla -->
    <div
      class="hidden md:block rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-7xl mx-auto overflow-hidden">
      <table class="w-full border-collapse">
        <thead class="bg-[#74B9E7] text-black">
          <tr>
            <th>Nombre Completo</th>
            <th>Cédula</th>
            <th>Puntos</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeletons mientras carga -->
          <template v-if="loading">
            <tr>
              <td colspan="7" class="p-0">
                <div v-for="i in 5" :key="i" class="flex items-center p-4 gap-4 border-b border-[var(--border)]">
                  <BaseSkeleton width="150px" height="24px" radius="6px" />
                  <BaseSkeleton width="100px" height="24px" radius="6px" />
                  <BaseSkeleton width="50px" height="24px" radius="6px" />
                  <BaseSkeleton width="180px" height="24px" radius="6px" />
                  <BaseSkeleton width="80px" height="24px" radius="6px" />
                  <BaseSkeleton width="70px" height="24px" radius="6px" />
                  <div class="flex-grow flex justify-center gap-2">
                    <BaseSkeleton width="80px" height="32px" radius="6px" />
                    <BaseSkeleton width="80px" height="32px" radius="6px" />
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <!-- Usuarios -->
          <template v-else-if="filteredUsuarios.length > 0">
            <tr v-for="usuario in filteredUsuarios" :key="usuario.id">
              <td>{{ usuario.nombreCompleto }}</td>
              <td>{{ usuario.cedula }}</td>
              <td>{{ usuario.puntosTotales }}</td>
              <td>{{ usuario.email }}</td>
              <td>{{ usuario.rol }}</td>
              <td>
                <span :class="['badge', usuario.activo ? 'success' : 'danger']">
                  {{ usuario.activo ? "Activo" : "Inactivo" }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="openModal(usuario)" class="btn-edit">
                  Editar
                </button>
                <button @click="openPuntosModal(usuario)" class="btn-edit">
                  Puntos
                </button>
                <button @click="toggleStatus(usuario)" :class="usuario.activo ? 'btn-danger' : 'btn-edit'">
                  {{ usuario.activo ? "Desactivar" : "Activar" }}
                </button>
                <button @click="deleteUsuario(usuario)" class="btn-danger">
                  Eliminar
                </button>
              </td>
            </tr>
          </template>

          <!-- Estado vacío -->
          <template v-else>
            <tr>
              <td colspan="7">
                <EmptyState icon="mdi:account-search-outline" title="No se encontraron usuarios"
                  message="Prueba con otro término de búsqueda o crea un nuevo usuario." />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Vista Mobile - Cards -->
    <div class="block md:hidden">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="mobile-card mb-4">
          <BaseSkeleton width="100%" height="20px" radius="4px" class="mb-2" />
          <BaseSkeleton width="60%" height="16px" radius="4px" class="mb-2" />
          <BaseSkeleton width="40%" height="16px" radius="4px" class="mb-3" />
          <div class="flex gap-2">
            <BaseSkeleton width="70px" height="28px" radius="4px" />
            <BaseSkeleton width="70px" height="28px" radius="4px" />
          </div>
        </div>
      </template>

      <!-- Cards de usuarios -->
      <template v-else-if="filteredUsuarios.length > 0">
        <div v-for="usuario in filteredUsuarios" :key="usuario.id" class="mobile-card">
          <div class="mobile-card-header">
            <h3 class="mobile-card-title">{{ usuario.nombreCompleto }}</h3>
            <span :class="['badge', usuario.activo ? 'success' : 'danger']">
              {{ usuario.activo ? "Activo" : "Inactivo" }}
            </span>
          </div>

          <div class="mobile-card-content">
            <div class="mobile-info-item">
              <span class="mobile-label">Cédula:</span>
              <span>{{ usuario.cedula }}</span>
            </div>
            <div class="mobile-info-item">
              <span class="mobile-label">Email:</span>
              <span class="mobile-value">{{ usuario.email }}</span>
            </div>
            <div class="mobile-info-item">
              <span class="mobile-label">Rol:</span>
              <span>{{ usuario.rol }}</span>
            </div>
            <div class="mobile-info-item">
              <span class="mobile-label">Puntos:</span>
              <span class="mobile-points">{{ usuario.puntosTotales }}</span>
            </div>
          </div>

          <div class="mobile-card-actions">
            <button @click="openModal(usuario)" class="btn-edit">Editar</button>
            <button @click="openPuntosModal(usuario)" class="btn-edit">
              Puntos
            </button>
            <button @click="toggleStatus(usuario)" :class="usuario.activo ? 'btn-danger' : 'btn-edit'">
              {{ usuario.activo ? "Desactivar" : "Activar" }}
            </button>
            <button @click="deleteUsuario(usuario)" class="btn-danger">
              Eliminar
            </button>
          </div>
        </div>
      </template>

      <!-- Estado vacío para mobile -->
      <template v-else>
        <div class="mobile-empty">
          <EmptyState icon="mdi:account-search-outline" title="No se encontraron usuarios"
            message="Prueba con otro término de búsqueda o crea un nuevo usuario." />
        </div>
      </template>
    </div>

    <!-- Paginación -->
    <div v-if="!loading && totalPages > 1" class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary">
        Anterior
      </button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-secondary">
        Siguiente
      </button>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2 class="modal-title">{{ isEditMode ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
        <form @submit.prevent="saveUsuario">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-group">
              <label>Nombre Completo</label>
              <input v-model="form.nombreCompleto" type="text" required
                @input="form.nombreCompleto = capitalizeWords(form.nombreCompleto)" />
            </div>
            <!-- Cédula -->
            <div class="form-group">
              <label>Cédula</label>
              <input v-model="form.cedula" type="text" required :disabled="isEditMode" pattern="^[0-9]{5,15}$"
                maxlength="15" title="La cédula debe tener entre 5 y 15 dígitos y solo números"
                @input="form.cedula = form.cedula.replace(/[^0-9]/g, '')" />
            </div>
            <div class="form-group"><label>Email</label><input v-model="form.email" type="email" required /></div>
            <div class="form-group">
              <label>Sede</label>
              <input v-model="form.sede" type="text" required />
            </div>
            <!-- Contraseña (solo en crear) -->
            <div class="form-group" v-if="!isEditMode">
              <label>Contraseña</label>
              <input v-model="form.contrasena" type="password" required maxlength="16" pattern="^(?=.*[0-9]).{1,16}$"
                title="La contraseña debe tener máximo 16 caracteres e incluir al menos un dígito" />
            </div>
            <div class="form-group"><label>Rol</label><select v-model="form.rol" required>
                <option value="Empleado">Empleado</option>
                <option value="Administrador">Administrador</option>
              </select></div>
            <div class="form-group"><label>Cargo ID</label><input v-model.number="form.cargoId" type="number"
                placeholder="ID del Cargo existente" required /></div>
            <div class="form-group"><label>Centro de Costos ID</label><input v-model.number="form.centroDeCostosId"
                type="number" placeholder="ID del C. de Costos existente" required /></div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Ajustar Puntos -->
    <BaseModal :show="showPuntosModal" :title="`Ajustar Puntos a ${formPuntos.nombreCompleto}`"
      @close="closePuntosModal" width="500px">
      <form id="puntosForm" @submit.prevent="savePuntos">
        <div class="form-group">
          <label>Puntos a Añadir/Quitar</label>
          <input v-model.number="formPuntos.puntos" type="number" required
            placeholder="Ej: 100 para añadir, -50 para quitar" />
        </div>
        <div class="form-group">
          <label>Motivo del Ajuste</label>
          <textarea v-model="formPuntos.descripcion" required placeholder="Ej: Bono por desempeño Q3" />
        </div>
      </form>
      <template #actions>
        <button type="button" @click="closePuntosModal" class="btn btn-secondary">
          Cancelar
        </button>
        <button type="submit" form="puntosForm" class="btn btn-primary">
          Guardar Ajuste
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import BaseModal from "../shared/BaseModal.vue";
import BaseSkeleton from "../shared/BaseSkeleton.vue";
import EmptyState from "../shared/EmptyState.vue";

const usuarios = ref([]);
const loading = ref(true);
const showModal = ref(false);
const isEditMode = ref(false);
const form = ref({});
const searchQuery = ref("");
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/usuarios`;
const ADMIN_DATA_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin-data`;
const showPuntosModal = ref(false);
const formPuntos = ref({});
const cargos = ref([]);
const centrosDeCostos = ref([]);
const currentPage = ref(1);
const totalUsers = ref(0);
const usersPerPage = ref(10);
const totalPages = computed(() => Math.ceil(totalUsers.value / usersPerPage.value));
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
const fileInput = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({ page: currentPage.value, limit: usersPerPage.value });
    const usuariosRes = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeaders());
    usuarios.value = usuariosRes.data.usuarios;
    totalUsers.value = usuariosRes.data.total;
    if (cargos.value.length === 0) {
      const [cargosRes, centrosRes] = await Promise.all([
        axios.get(`${ADMIN_DATA_URL}/cargos`, getAuthHeaders()),
        axios.get(`${ADMIN_DATA_URL}/centros-de-costos`, getAuthHeaders()),
      ]);
      cargos.value = cargosRes.data;
      centrosDeCostos.value = centrosRes.data;
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
    Swal.fire("Error", "No se pudieron cargar los datos necesarios.", "error");
  } finally {
    loading.value = false;
  }
};

const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const capitalizeCargo = () => {
  if (form.cargoId && cargos.length) {
    const cargo = cargos.find(c => c.id === form.cargoId);
    if (cargo) {
      cargo.nombre = capitalizeWords(cargo.nombre);
    }
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchData();
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchData();
  }
};
onMounted(fetchData);

const filteredUsuarios = computed(() => {
  if (!searchQuery.value) return usuarios.value;
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return usuarios.value.filter(u => u.nombreCompleto.toLowerCase().includes(lowerCaseQuery) || u.cedula.includes(lowerCaseQuery));
});

const openModal = (usuario = null) => {
  if (usuario) {
    isEditMode.value = true;
    form.value = { ...usuario, cargoId: usuario.cargos?.id, centroDeCostosId: usuario.centroDeCostos?.id };
  } else {
    isEditMode.value = false;
    form.value = { rol: "Empleado", activo: true, cargoId: "", centroDeCostosId: "" };
  }
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; };

const saveUsuario = async () => {
  try {
    if (isEditMode.value) {
      await axios.put(`${API_URL}/${form.value.id}`, form.value, getAuthHeaders());
      Swal.fire("Éxito", "Usuario actualizado.", "success");
    } else {
      await axios.post(API_URL, form.value, getAuthHeaders());
      Swal.fire("Éxito", "Usuario creado.", "success");
    }
    closeModal();
    fetchData();
  } catch (error) {
    let errorHtml = error.response?.data?.message || 'No se pudo guardar el usuario.';
    if (error.response?.data?.errors) {
      errorHtml = '<ul style="text-align: left; list-style-position: inside;">' + error.response.data.errors.map(e => `<li>${e.message}</li>`).join('') + '</ul>';
    }
    Swal.fire({ icon: "error", title: "Error", html: errorHtml });
  }
};

const openPuntosModal = (usuario) => {
  formPuntos.value = { id: usuario.id, nombreCompleto: usuario.nombreCompleto, puntos: "", descripcion: "" };
  showPuntosModal.value = true;
};
const closePuntosModal = () => { showPuntosModal.value = false; };
const savePuntos = async () => {
  try {
    await axios.post(`${API_URL}/${formPuntos.value.id}/puntos`, { puntos: formPuntos.value.puntos, descripcion: formPuntos.value.descripcion }, getAuthHeaders());
    Swal.fire("Éxito", "Puntos ajustados.", "success");
    closePuntosModal();
    fetchData();
  } catch (error) {
    Swal.fire("Error", error.response?.data?.message || "No se pudo ajustar los puntos.", "error");
  }
};

const toggleStatus = async (usuario) => {
  const result = await Swal.fire({ title: '¿Confirmar?', text: `¿Quieres ${usuario.activo ? "desactivar" : "activar"} a ${usuario.nombreCompleto}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' });
  if (result.isConfirmed) {
    try {
      await axios.patch(`${API_URL}/${usuario.id}/toggle-status`, {}, getAuthHeaders());
      Swal.fire("Éxito", "Estado actualizado.", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el estado.", "error");
    }
  }
};

const deleteUsuario = async (usuario) => {
  const result = await Swal.fire({
    title: '¿ELIMINAR PERMANENTEMENTE?',
    text: `Esta acción no se puede deshacer para ${usuario.nombreCompleto}.`,
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });
  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_URL}/${usuario.id}`, getAuthHeaders());
      Swal.fire("Eliminado", "Usuario eliminado con éxito.", "success");
      if (usuarios.value.length === 1 && currentPage.value > 1) {
        currentPage.value--;
      }
      fetchData();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar.", "error");
    }
  }
};
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('archivo', file);

  Swal.fire({
    title: 'Importando usuarios...',
    text: 'Por favor, espera.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const { data } = await axios.post(`${API_URL}/importar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`
      }
    });

    await fetchData();

    let successMessage = `Se crearon ${data.creados} usuarios nuevos.`;
    if (data.errores.length > 0) {
      successMessage += `<br><br><strong>Se encontraron ${data.errores.length} errores:</strong><br><ul style="text-align: left; font-size: 0.8em;">${data.errores.map(e => `<li>${e}</li>`).join('')}</ul>`;
    }

    Swal.fire({
      icon: 'success',
      title: 'Proceso Completado',
      html: successMessage,
    });

  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo importar el archivo.', 'error');
  } finally {
    event.target.value = '';
  }
};
</script>

<style src="./Usuarios.css"></style>