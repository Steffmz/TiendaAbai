<template>
    <div class="page-container">
        <div class="page-header">
            <h1 class="page-title">Gestión de Usuarios</h1>
            <p class="page-subtitle">Administra los usuarios del sistema.</p>
        </div>

        <div class="actions-bar">
            <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o cédula..." class="search-input" />
            <button @click="openModal()" class="btn btn-primary">+ Nuevo Usuario</button>
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
                        <td colspan="6" class="text-center">Cargando...</td>
                    </tr>
                    <tr v-else v-for="usuario in filteredUsuarios" :key="usuario.id">
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
                                :class="['btn', usuario.activo ? 'btn-danger' : 'btn-success']">
                                {{ usuario.activo ? 'Desactivar' : 'Activar' }}
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!loading && filteredUsuarios.length === 0">
                        <td colspan="6" class="text-center">No se encontraron usuarios.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <h2>{{ isEditMode ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
                <form @submit.prevent="saveUsuario">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input v-model="form.nombreCompleto" type="text" required />
                    </div>
                    <div class="form-group">
                        <label>Cédula</label>
                        <input v-model="form.cedula" type="text" :disabled="isEditMode" required />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input v-model="form.email" type="email" required />
                    </div>
                    <div class="form-group" v-if="!isEditMode">
                        <label>Contraseña</label>
                        <input v-model="form.contrasena" type="password"
                            placeholder="Dejar en blanco para no cambiar" />
                    </div>
                    <div class="form-group">
                        <label>Rol</label>
                        <select v-model="form.rol" required>
                            <option value="Empleado">Empleado</option>
                            <option value="Administrador">Administrador</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Sede</label>
                        <input v-model="form.sede" type="text" placeholder="Ej: Bogotá, Medellín" required />
                    </div>


                    <div class="form-group">
                        <label>Cargo ID</label>
                        <input v-model.number="form.cargoId" type="number" placeholder="ID del Cargo" required />
                    </div>
                    <div class="form-group">
                        <label>Centro de Costos ID</label>
                        <input v-model.number="form.centroDeCostosId" type="number"
                            placeholder="ID del Centro de Costos" required />
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- VARIABLES REACTIVAS ---
const usuarios = ref([]);
const loading = ref(true);
const showModal = ref(false);
const isEditMode = ref(false);
const form = ref({});
const searchQuery = ref('');

// --- PROPIEDAD COMPUTADA PARA BÚSQUEDA ---
const filteredUsuarios = computed(() => {
    if (!searchQuery.value) {
        return usuarios.value;
    }
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    return usuarios.value.filter(usuario =>
        usuario.nombreCompleto.toLowerCase().includes(lowerCaseQuery) ||
        usuario.cedula.includes(lowerCaseQuery)
    );
});

const API_URL = 'http://localhost:3000/api/usuarios';

// --- FUNCIONES DE LA API (AQUÍ ESTÁ LA LÓGICA) ---
const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchUsuarios = async () => {
    loading.value = true;
    try {
        const response = await axios.get(API_URL, getAuthHeaders());
        usuarios.value = response.data;
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
        alert('No se pudieron cargar los usuarios.');
    } finally {
        loading.value = false;
    }
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
        console.error("Error al guardar usuario:", error);
        alert(`Error: ${error.response?.data?.message || 'No se pudo guardar el usuario.'}`);
    }
};

const toggleStatus = async (usuario) => {
    if (!confirm(`¿Estás seguro de que quieres ${usuario.activo ? 'desactivar' : 'activar'} a ${usuario.nombreCompleto}?`)) {
        return;
    }
    try {
        await axios.patch(`${API_URL}/${usuario.id}/toggle-status`, {}, getAuthHeaders());
        alert('Estado del usuario actualizado.');
        fetchUsuarios();
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        alert('No se pudo actualizar el estado del usuario.');
    }
};

// --- CONTROL DEL MODAL (AQUÍ ESTABA EL ERROR) ---
const openModal = (usuario = null) => {
    if (usuario) {
        isEditMode.value = true;
        // Aseguramos que los IDs se asignen correctamente para el formulario
        form.value = {
            ...usuario,
            cargoId: usuario.cargos?.id,
            centroDeCostosId: usuario.centroDeCostos?.id
        };
    } else {
        isEditMode.value = false;
        form.value = { rol: 'Empleado', activo: true }; // Objeto vacío para crear
    }
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

// --- CICLO DE VIDA ---
onMounted(fetchUsuarios);
</script>

<style scoped>
/* Usaremos estilos más alineados a tu captura de pantalla */
.page-container {
    padding: 2rem;
}

.page-header {
    margin-bottom: 1.5rem;
}

.page-title {
    font-size: 1.8rem;
    font-weight: 600;
}

.page-subtitle {
    color: #6b7280;
    /* Gris */
}

.actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.search-input {
    padding: 0.6rem 1rem;
    border: 1px solid #d1d5db;
    /* Borde gris claro */
    border-radius: 6px;
    width: 300px;
}

.btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    color: white;
}

.btn-primary {
    background-color: #f59e0b;
    /* Naranja/Amarillo */
}

.btn-primary:hover {
    background-color: #d97706;
}

.btn-edit {
    background-color: #3b82f6;
    /* Azul */
}

.btn-danger {
    background-color: #ef4444;
    /* Rojo */
}

.btn-success {
    background-color: #22c55e;
    /* Verde */
}

.table-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    padding: 1rem;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 12px 15px;
    text-align: left;
}

thead {
    background-color: #74B9E7;
    /* El azul de tu cabecera */
    color: white;
}

tbody tr {
    border-bottom: 1px solid #e5e7eb;
    /* Borde gris muy claro */
}

.badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 600;
}

.badge.success {
    background-color: #d1fae5;
    /* Fondo verde claro */
    color: #065f46;
    /* Color verde oscuro */
}

.badge.danger {
    background-color: #fee2e2;
    /* Fondo rojo claro */
    color: #991b1b;
    /* Color rojo oscuro */
}

.actions-cell {
    display: flex;
    gap: 0.5rem;
}

.text-center {
    text-align: center;
}


.page-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    height: 100%;
}
</style>