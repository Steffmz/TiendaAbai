<template>
  <div class="page-container">
    <div class="max-w-7xl w-full mx-auto">
      <div class="page-header">
        <h1 class="page-title">Gestión de Usuarios</h1>
        <p class="page-subtitle">Administra los usuarios del sistema.</p>
      </div>

      <div class="w-full flex justify-center mb-6">
        <div class="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
          <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o cédula..."
            class="w-64 md:flex-1 px-3 py-2 border border-yellow-400 rounded-lg text-blue-800 bg-blue-50
                  focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                  text-sm shadow-sm transition-all duration-200" />

          <button @click="openModal()"
            class="px-5 py-2 bg-[#FFB93B] text-black rounded-lg font-semibold shadow-md
                  hover:bg-[#74B9E7] transition-all duration-200 hover:shadow-lg">
            + Nuevo Usuario
          </button>
        </div>
      </div>

     <div class="rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-7xl mx-auto overflow-hidden">
  <div>
    <table class="w-full border-collapse">
      <thead class="bg-[#74B9E7] text-black">
        <tr>
          <th class="px-3 py-3 text-center font-semibold">Nombre Completo</th>
          <th class="px-3 py-3 text-center font-semibold">Cédula</th>
          <th class="px-3 py-3 text-center font-semibold">Email</th>
          <th class="px-3 py-3 text-center font-semibold">Rol</th>
          <th class="px-3 py-3 text-center font-semibold">Estado</th>
          <th class="px-3 py-3 text-center font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="6" class="text-center py-8">Cargando...</td>
        </tr>

        <tr v-for="(usuario, index) in filteredUsuarios" :key="usuario.id"
          :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
          class="border-b border-gray-100 hover:bg-[#fac8012f] transition-colors duration-150">

          <!-- Nombre -->
          <td class="px-3 py-3 text-gray-800 font-medium text-center">
            {{ usuario.nombreCompleto }}
          </td>

          <!-- Cédula -->
          <td class="px-3 py-3 text-gray-600 text-center">
            {{ usuario.cedula }}
          </td>

          <!-- Email -->
          <td class="px-3 py-3 text-gray-600 text-center">
            {{ usuario.email }}
          </td>

          <!-- Rol -->
          <td class="px-3 py-3 text-gray-700 font-semibold text-center">
            {{ usuario.rol }}
          </td>

          <!-- Estado -->
          <td class="px-3 py-3 text-center">
            <span :class="usuario.activo
              ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'
              : 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium'">
              {{ usuario.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>

          <!-- Acciones -->
          <td class="px-3 py-3">
            <div class="flex items-center justify-center gap-2">
              <button @click="openModal(usuario)"
                class="bg-blue-100 text-black hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150">
                Editar
              </button>
              <button @click="toggleStatus(usuario)"
                :class="[usuario.activo
                  ? 'bg-red-100 hover:bg-red-200'
                  : 'bg-green-100 hover:bg-green-200',
                  'text-black px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150']">
                {{ usuario.activo ? 'Desactivar' : 'Activar' }}
              </button>
              <button @click="deleteUsuario(usuario)"
                class="bg-red-100 text-black hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150">
                Eliminar
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!loading && filteredUsuarios.length === 0">
          <td colspan="6" class="text-center py-8">No se encontraron usuarios.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2 class="modal-title">{{ isEditMode ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
        <form @submit.prevent="saveUsuario">
          <div class="form-grid">
            <div class="form-group"><label>Nombre Completo</label><input v-model="form.nombreCompleto" type="text"
                required /></div>
            <div class="form-group"><label>Cédula</label><input v-model="form.cedula" type="text" :disabled="isEditMode"
                required /></div>
            <div class="form-group"><label>Email</label><input v-model="form.email" type="email" required /></div>
            <div class="form-group"><label>Sede</label><input v-model="form.sede" type="text" required /></div>
            <div class="form-group" v-if="!isEditMode"><label>Contraseña</label><input v-model="form.contrasena"
                type="password" required /></div>
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
  </div>
</template>

<script setup>
// El script no necesita cambios
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const usuarios = ref([]);
const loading = ref(true);
const showModal = ref(false);
const isEditMode = ref(false);
const form = ref({});
const searchQuery = ref('');
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/usuarios`;

const filteredUsuarios = computed(() => {
  if (!searchQuery.value) return usuarios.value;
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return usuarios.value.filter(usuario =>
    usuario.nombreCompleto.toLowerCase().includes(lowerCaseQuery) ||
    usuario.cedula.includes(lowerCaseQuery)
  );
});

const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });

const fetchUsuarios = async () => {
  loading.value = true;
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    usuarios.value = response.data;
  } catch (error) { console.error("Error al cargar usuarios:", error); }
  finally { loading.value = false; }
};
const saveUsuario = async () => {
  try {
    if (isEditMode.value) {
      await axios.put(`${API_URL}/${form.value.id}`, form.value, getAuthHeaders());
      alert('Usuario actualizado con éxito.');
    } else {
      await axios.post(API_URL, form.value, getAuthHeaders());
      alert('Usuario creado con éxito.');
    }
    closeModal();
    fetchUsuarios();
  } catch (error) {
    alert(`Error: ${error.response?.data?.message || 'No se pudo guardar el usuario.'}`);
  }
};
const toggleStatus = async (usuario) => {
  if (!confirm(`¿Estás seguro de que quieres ${usuario.activo ? 'desactivar' : 'activar'} a ${usuario.nombreCompleto}?`)) return;
  try {
    await axios.patch(`${API_URL}/${usuario.id}/toggle-status`, {}, getAuthHeaders());
    alert('Estado del usuario actualizado.');
    fetchUsuarios();
  } catch (error) { alert('No se pudo actualizar el estado.'); }
};
const deleteUsuario = async (usuario) => {
  if (!confirm(`¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE a ${usuario.nombreCompleto}?`)) return;
  try {
    await axios.delete(`${API_URL}/${usuario.id}`, getAuthHeaders());
    alert('Usuario eliminado con éxito.');
    fetchUsuarios();
  } catch (error) { alert('No se pudo eliminar el usuario.'); }
};
const openModal = (usuario = null) => {
  if (usuario) {
    isEditMode.value = true;
    form.value = { ...usuario, cargoId: usuario.cargos?.id, centroDeCostosId: usuario.centroDeCostos?.id };
  } else {
    isEditMode.value = false;
    form.value = { rol: 'Empleado', activo: true };
  }
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; };
onMounted(fetchUsuarios);
</script>

<style scoped>

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;   /* ocupa toda la ventana */
  padding: 2rem;
  justify-content: flex-start;
  overflow-x: hidden;  /* quita scroll horizontal */
  overflow-y: hidden;  /* quita scroll vertical */
}

.max-w-7xl {
  max-width: 80rem;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

/* ---- Header ---- */
.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1f2937;
}

.page-subtitle {
  color: #6b7280;
  margin-top: 0.25rem;
}

/* ---- Barra de acciones ---- */

.btn-primary {
  background-color: #fbbf24;
  color: #111827;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none; 
  transition: 0.2s;
  box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
}

.btn-primary:hover {
  background-color: #f59e0b;
}

/* ---- Tabla ---- */
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background-color: #74B9E7;
  color: black;
  font-weight: 600;
  font-size: 0.95rem;
}

tbody tr:hover {
  background-color: #f9fafb;
}

/* --- Tarjetas responsivas para móvil --- */
@media (max-width: 768px) {
  table, thead, tbody, th, td, tr {
    display: block;
    width: 100%;
  }

  thead {
    display: none;
  }

  tr {
    margin-bottom: 0.8rem; /* menos espacio entre tarjetas */
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px; /* menos redondeo */
    padding: 0.8rem 0.9rem; /* menos padding */
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    text-align: center;
    font-size: 0.9rem; /* texto un poco más pequeño */
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
    margin-bottom: 0.2rem;
    font-size: 0.85rem; /* títulos más pequeños */
    text-align: center;
  }

  /* Estado */
  td span {
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 9999px;
    display: inline-block;
    margin-top: 0.2rem;
  }

  /* Acciones */
  td:last-child {
    margin-top: 0.5rem;
  }

  .flex.items-center.justify-center.gap-2 {
    flex-direction: column;
    gap: 0.3rem; /* menos espacio entre botones */
    align-items: center;
  }

  button {
    width: 85%; /* menos ancho */
    max-width: 220px;
    padding: 0.4rem 0.6rem; /* más compacto */
    font-size: 0.8rem;
    border-radius: 8px !important;
    font-weight: 600;
    text-align: center;
  }
}

/* ---- Botones ---- */
.btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.btn-edit {
  background-color: #bfdbfe;
  color: #1e40af;
}

.btn-edit:hover {
  background-color: #93c5fd;
}

.btn-danger {
  background-color: #fecaca;
  color: #b91c1c;
}

.btn-danger:hover {
  background-color: #fca5a5;
}

.btn-success {
  background-color: #bbf7d0;
  color: #166534;
}

.btn-success:hover {
  background-color: #86efac;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* ---- Badges ---- */
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.badge.success {
  background-color: #d1fae5;
  color: #10b981;
}

.badge.danger {
  background-color: #fee2e2;
  color: #ef4444;
}

/* ---- Modal ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  border: 1px solid #e5e7eb;
  box-shadow: 0px 5px 15px rgba(0,0,0,0.2);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1f2937;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #f9fafb;
  color: #111827;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}
</style>
