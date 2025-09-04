<template>
  <div class="page-container">
    <div class="max-w-7xl w-full mx-auto">
      <div class="page-header">
        <h1 class="page-title">Gestión de Usuarios</h1>
        <p class="page-subtitle">Administra los usuarios del sistema.</p>
      </div>

      <div class="actions-bar">
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o cédula..." class="search-input" />
        <button @click="openModal()" class="btn-primary">+ Nuevo Usuario</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Cédula</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-8">Cargando...</td>
            </tr>
            <tr v-for="usuario in filteredUsuarios" :key="usuario.id">
              <td>{{ usuario.nombreCompleto }}</td>
              <td>{{ usuario.cedula }}</td>
              <td>{{ usuario.email }}</td>
              <td>{{ usuario.rol }}</td>
              <td>
                <span :class="['badge', usuario.activo ? 'success' : 'danger']">
                  {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="openModal(usuario)" class="btn btn-edit">Editar</button>
                <button @click="toggleStatus(usuario)"
                  :class="['btn', usuario.activo ? 'btn-danger' : 'btn-success']">{{ usuario.activo ? 'Desactivar' :
                  'Activar' }}</button>
                <button @click="deleteUsuario(usuario)" class="btn btn-danger">Eliminar</button>
              </td>
            </tr>
            <tr v-if="!loading && filteredUsuarios.length === 0">
              <td colspan="6" class="text-center py-8">No se encontraron usuarios.</td>
            </tr>
          </tbody>
        </table>
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
/* --- ESTILOS UNIFICADOS CON VARIABLES DE TEMA --- */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* <-- Esta es la línea que faltaba */
  padding: 2rem;
  justify-content: flex-start;
}

.max-w-7xl {
  max-width: 80rem;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text);
}

.page-subtitle {
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-input {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  width: 300px;
  background-color: var(--surface-2);
  color: var(--text);
}

/* Tabla */
.table-container {
  overflow-x: auto;
  background: var(--surface);
  border-radius: 8px;
  border: 1px solid var(--border);
}

table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text);
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  background-color: var(--table-header);
  color: white;
  text-align: center;
}

td {
  text-align: center;
}

/* Botones y Badges */
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

.btn-secondary {
  background-color: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
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

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--surface);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  border: 1px solid var(--border);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text);
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
  color: var(--text);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--surface-2);
  color: var(--text);
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
