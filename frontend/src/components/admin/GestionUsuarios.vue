<template>
  <div class="h-full flex flex-col">
    <div class="max-w-7xl w-full mx-auto px-4">
      <!-- Título -->
      <div class="pt-4 pb-2 px-6 mb-1 shadow-sm text-center">
        <h1 class="text-4xl font-bold text-gray-800 mb-1">Gestión de Usuarios</h1>
        <p class="text-gray-500 text-lg">Administra los usuarios del sistema</p>
      </div>

      <!-- Barra búsqueda y botón -->
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

      <!-- TABLA -->
      <div class="rounded-xl border border-gray-200 shadow-sm mb-2 w-full max-w-7xl mx-auto overflow-hidden">
        <div>
          <table class="w-full border-collapse">
            <thead class="bg-[#74B9E7] text-black">
              <tr>
                <th class="px-3 py-3 text-center font-semibold w-48">Nombre Completo</th>
                <th class="px-3 py-3 text-center font-semibold w-32">Cédula</th>
                <th class="px-3 py-3 text-center font-semibold w-55">Email</th>
                <th class="px-3 py-3 text-center font-semibold w-28">Rol</th>
                <th class="px-3 py-3 text-center font-semibold w-24">Estado</th>
                <th class="px-3 py-3 text-center font-semibold w-48">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="px-3 py-8 text-center text-gray-500">Cargando...</td>   
              </tr>
              <tr v-for="(usuario, index) in filteredUsuarios" :key="usuario.id"
                  :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
                  class="border-b border-gray-100 hover:bg-[#fac8012f] transition-colors duration-150">
                
                <!-- Nombre Completo -->
                <td class="px-3 py-3 text-gray-800 font-medium text-center capitalize">
                  {{ usuario.nombreCompleto }}
                </td>

                <!-- Cédula -->
                <td class="px-3 py-3 text-gray-700 text-center">
                  {{ usuario.cedula }}
                </td>

                <!-- Email -->
                <td class="px-3 py-3 text-gray-700 text-center">
                  {{ usuario.email }}
                </td>

                <!-- Rol -->
                <td class="px-3 py-3 text-blue-700 font-semibold text-center">
                  {{ usuario.rol }}
                </td>

                <!-- Estado -->
                <td class="px-3 py-3 text-center">
                  <span :class="usuario.activo
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                    class="px-2 py-1 rounded-full text-xs font-medium">
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
                            :class="usuario.activo 
                              ? 'bg-red-100 text-black hover:bg-red-200' 
                              : 'bg-green-100 text-black hover:bg-green-200'"
                            class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150">
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
                <td colspan="6" class="px-3 py-8 text-center text-gray-500">No se encontraron usuarios.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="modal-content bg-white rounded-2xl shadow-2xl relative">
        <button @click="closeModal"
                class="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>

        <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">
          {{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h2>

        <form @submit.prevent="saveUsuario">
          <div class="form-grid">
            <!-- Nombre Completo -->
            <div class="form-group grid-col-span-2">
              <label>Nombre Completo *</label>
              <input v-model="form.nombreCompleto" type="text" required placeholder="Nombre completo del usuario"
                     class="capitalize" />
            </div>

            <!-- Cédula -->
            <div class="form-group">
              <label>Cédula *</label>
              <input v-model="form.cedula" type="text" :disabled="isEditMode" required placeholder="12345678"
                     @input="soloNumeros" />
            </div>

            <!-- Email -->
            <div class="form-group">
              <label>Email *</label>
              <input v-model="form.email" type="email" required placeholder="usuario@ejemplo.com" />
            </div>

            <!-- Sede -->
            <div class="form-group">
              <label>Sede *</label>
              <input v-model="form.sede" type="text" required placeholder="Nombre de la sede"
                     @input="capitalizarSede" class="capitalize-first" />
            </div>

            <!-- Contraseña -->
            <div class="form-group password-field" v-if="!isEditMode">
              <label>Contraseña *</label>
              <div class="password-input-container">
                <input v-model="form.contrasena" :type="showPassword ? 'text' : 'password'" 
                       required placeholder="Contraseña segura" maxlength="18" @input="validarContrasena" />
                <button type="button" @click="togglePassword" class="password-toggle">
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L18.536 18.536M9.878 9.878L8.464 8.464"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
              <p v-if="errorContrasena" class="text-red-600 text-xs mt-1">{{ errorContrasena }}</p>
            </div>

            <!-- Rol -->
            <div class="form-group">
              <label>Rol *</label>
              <select v-model="form.rol" required>
                <option value="Empleado">Empleado</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <!-- Cargo ID -->
            <div class="form-group">
              <label>Cargo ID *</label>
              <input v-model.number="form.cargoId" type="number" required min="1" placeholder="1" />
            </div>

            <!-- Centro de Costos -->
            <div class="form-group grid-col-span-2">
              <label>Centro de Costos ID *</label>
              <input v-model.number="form.centroDeCostosId" type="number" required min="1" placeholder="1" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-submit">
              {{ isEditMode ? 'Actualizar Usuario' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Paginación -->
    <div class="flex flex-col items-center justify-center mt-4">
      <p class="text-gray-700">
        Existen <span class="text-blue-500 font-semibold">{{ filteredUsuarios.length }}</span> usuarios
      </p>

      <div class="flex items-center mt-2 space-x-1" v-if="totalPaginas > 1">
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const usuarios = ref([]);
const loading = ref(true);
const showModal = ref(false);
const isEditMode = ref(false);
const form = ref({});
const searchQuery = ref('');
const paginaActual = ref(1);
const usuariosPorPagina = 10;
const errorContrasena = ref('');
const showPassword = ref(false);

const API_URL = 'http://localhost:3000/api/usuarios';

const filteredUsuarios = computed(() => {
  let filtered = usuarios.value;
  
  if (searchQuery.value) {
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    filtered = usuarios.value.filter(usuario =>
      usuario.nombreCompleto.toLowerCase().includes(lowerCaseQuery) ||
      usuario.cedula.includes(lowerCaseQuery)
    );
  }

  const inicio = (paginaActual.value - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  return filtered.slice(inicio, fin);
});

const totalPaginas = computed(() => {
  const filtered = searchQuery.value 
    ? usuarios.value.filter(usuario =>
        usuario.nombreCompleto.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        usuario.cedula.includes(searchQuery.value.toLowerCase())
      )
    : usuarios.value;
  return Math.ceil(filtered.length / usuariosPorPagina);
});

const paginasVisibles = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  const paginas = [];
  const inicio = Math.max(1, actual - 2);
  const fin = Math.min(total, actual + 2);
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i);
  }
  return paginas;
});

const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });

const fetchUsuarios = async () => {
  loading.value = true;
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    usuarios.value = response.data;
  } catch (error) { 
    console.error("Error al cargar usuarios:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los usuarios'
    });
  }
  finally { 
    loading.value = false; 
  }
};

const saveUsuario = async () => {
  if (form.value.cedula.length < 2) {
    Swal.fire({
      icon: 'warning',
      title: 'Cédula inválida',
      text: 'La cédula debe tener al menos 2 dígitos.'
    });
    return;
  }
  if (!isEditMode.value && errorContrasena.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña inválida',
      text: 'Corrige la contraseña antes de continuar.'
    });
    return;
  }
  try {
    if (isEditMode.value) {
      await axios.put(`${API_URL}/${form.value.id}`, form.value, getAuthHeaders());
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Usuario actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      await axios.post(API_URL, form.value, getAuthHeaders());
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Usuario creado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    }
    closeModal();
    fetchUsuarios();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'No se pudo guardar el usuario'
    });
  }
};

const soloNumeros = () => {
  form.value.cedula = form.value.cedula.replace(/\D/g, "");
};

const capitalizarSede = () => {
  if (form.value.sede) {
    form.value.sede = form.value.sede.charAt(0).toUpperCase() + form.value.sede.slice(1);
  }
};

const validarContrasena = () => {
  const regex = /[!@#$%^&*(),.?":{}|<>]/;
  if (form.value.contrasena.length > 0 && !regex.test(form.value.contrasena)) {
    errorContrasena.value = "La contraseña debe incluir al menos un carácter especial.";
  } else {
    errorContrasena.value = "";
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleStatus = async (usuario) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Quieres ${usuario.activo ? 'desactivar' : 'activar'} a ${usuario.nombreCompleto}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: `Sí, ${usuario.activo ? 'desactivar' : 'activar'}`,
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await axios.patch(`${API_URL}/${usuario.id}/toggle-status`, {}, getAuthHeaders());
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'Estado del usuario actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      fetchUsuarios();
    } catch (error) { 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del usuario'
      });
    }
  }
};

const deleteUsuario = async (usuario) => {
  const result = await Swal.fire({
    title: '¿ELIMINAR PERMANENTEMENTE?',
    text: `Esta acción eliminará permanentemente a ${usuario.nombreCompleto}. ¡No se puede deshacer!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_URL}/${usuario.id}`, getAuthHeaders());
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'Usuario eliminado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      fetchUsuarios();
    } catch (error) { 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el usuario'
      });
    }
  }
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
  showPassword.value = false;
};

const closeModal = () => { 
  showModal.value = false; 
};

const irAPagina = (pagina) => {
  paginaActual.value = pagina;
};

const paginaAnterior = () => {
  if (paginaActual.value > 1) {
    paginaActual.value--;
  }
};

const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) {
    paginaActual.value++;
  }
};

onMounted(fetchUsuarios);
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
.form-group input:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
.password-field {
  position: relative;
}
.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}
.password-input-container input {
  padding-right: 3rem;
}
.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}
.password-toggle:hover {
  color: #374151;
  background-color: #f3f4f6;
}
.modal-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
.btn-submit {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  background-color: #74B9E7;
  color: black;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-submit:hover {
  background-color: #FFB93B;
}
.capitalize {
  text-transform: capitalize;
}
.capitalize-first::first-letter {
  text-transform: uppercase;
}
</style>