<template>
  <div class="user-management">
    <div class="header">
      <h1>Gestión de Usuarios</h1>
      <router-link to="/dashboard/usuarios/nuevo" class="btn-new">
        + Crear Nuevo Usuario
      </router-link>
    </div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre Completo</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Puntos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in usuarios" :key="usuario.id">
          <td>{{ usuario.id }}</td>
          <td>{{ usuario.nombreCompleto }}</td>
          <td>{{ usuario.email }}</td>
          <td>{{ usuario.rol }}</td>
          <td>{{ usuario.puntosTotales }}</td>
          <td class="actions-cell">
            <button @click="openPointsModal(usuario)" class="btn-points">Asignar Puntos</button>
            <button @click="editarUsuario(usuario.id)" class="btn-edit">Editar</button>
            <button @click="eliminarUsuario(usuario.id)" class="btn-delete">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Asignar Puntos a {{ selectedUser.nombreCompleto }}</h3>
      <form @submit.prevent="submitPoints">
        <div class="form-group">
          <label for="puntos">Puntos a Asignar:</label>
          <input type="number" id="puntos" v-model.number="pointsToAdd" required>
          <small>Usa un número negativo para restar puntos (ej: -50).</small>
        </div>
        <div class="form-group">
          <label for="descripcion">Motivo / Descripción:</label>
          <textarea id="descripcion" v-model="description" required></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
          <button type="submit" class="btn-confirm">Confirmar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { useRouter } from 'vue-router';

const usuarios = ref([]);
const router = useRouter();

// Lógica del modal para asignar puntos
const showModal = ref(false);
const selectedUser = ref(null);
const pointsToAdd = ref(0);
const description = ref('');

const openPointsModal = (usuario) => {
  selectedUser.value = usuario;
  pointsToAdd.value = 0;
  description.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const submitPoints = async () => {
  if (!selectedUser.value) return;
  try {
    const response = await api.post(
      `/api/admin/usuarios/${selectedUser.value.id}/puntos`,
      {
        puntos: pointsToAdd.value,
        descripcion: description.value,
      }
    );
    const userIndex = usuarios.value.findIndex(u => u.id === selectedUser.value.id);
    if (userIndex !== -1) {
      usuarios.value[userIndex].puntosTotales = response.data.usuario.puntosTotales;
    }
    alert('Puntos asignados con éxito');
    closeModal();
  } catch (error) {
    console.error("Error al asignar puntos:", error);
    alert('Hubo un error al asignar los puntos.');
  }
};

const editarUsuario = (id) => {
  router.push(`/dashboard/usuarios/editar/${id}`);
};

async function eliminarUsuario(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
    return;
  }
  try {
    await api.delete(`/api/admin/usuarios/${id}`);
    usuarios.value = usuarios.value.filter(u => u.id !== id);
    alert('Usuario eliminado con éxito.');
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    alert('Hubo un error al eliminar el usuario.');
  }
}

// Cargar los usuarios cuando el componente se monta
onMounted(async () => {
  try {
    const response = await api.get(`/api/admin/usuarios`);
    usuarios.value = response.data;
  } catch (error) {
    console.error("No tienes permiso o hubo un error:", error);
    router.push('/');
  }
});
</script>

<style scoped>
.user-management {
  padding: 2rem;
  font-family: "Quicksand", sans-serif;
  background-color: #f8fafc;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.btn-new {
  background-color: #16a34a;
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
}
.btn-delete { background-color: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.9rem;
}
th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
thead th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
tbody tr:hover {
  background-color: #f1f5f9;
}
.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.btn-points, .btn-edit {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}
.btn-points:hover, .btn-edit:hover {
  opacity: 0.85;
}
.btn-points {
  background-color: #22c55e;
}
.btn-edit {
  background-color: #3b82f6;
}
/* Estilos para el Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #334155;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
}
.form-group small {
  font-size: 0.8rem;
  color: #64748b;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.btn-cancel,
.btn-confirm {
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-cancel {
  background-color: #e2e8f0;
  color: #334155;
}
.btn-confirm {
  background-color: #22c55e;
  color: white;
}
</style>