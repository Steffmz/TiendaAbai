<template>
    <div class="form-container">
        <h1>{{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h1>
        <form v-if="usuario" @submit.prevent="guardarUsuario" class="user-form">
            <div class="form-group">
                <label for="nombreCompleto">Nombre Completo</label>
                <input type="text" id="nombreCompleto" v-model="usuario.nombreCompleto" required />
            </div>

            <div class="form-group">
                <label for="cedula">Cédula</label>
                <input type="text" id="cedula" v-model="usuario.cedula" required />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="usuario.email" required />
            </div>
            
            <div class="form-group">
                <label for="sede">Sede</label>
                <input type="text" id="sede" v-model="usuario.sede" required />
            </div>
            <div class="form-group">
                <label for="cargoNombre">Cargo</label>
                <input type="text" id="cargoNombre" v-model="usuario.cargoNombre" required />
            </div>
            <div class="form-group">
                <label for="centroDeCostosNombre">Centro de Costos</label>
                <input type="text" id="centroDeCostosNombre" v-model="usuario.centroDeCostosNombre" required />
            </div>
            
            <div class="form-group">
                <label for="rol">Rol</label>
                <select id="rol" v-model="usuario.rol" required>
                    <option value="Empleado">Empleado</option>
                    <option value="Administrador">Administrador</option>
                </select>
            </div>

            <div class="form-group">
                <label for="activo">Estado</label>
                <select id="activo" v-model="usuario.activo">
                    <option :value="true">Activo</option>
                    <option :value="false">Inactivo</option>
                </select>
            </div>

             <div v-if="!isEditing" class="form-group">
                <label for="contrasena">Contraseña</label>
                <input type="password" id="contrasena" v-model="usuario.contrasena" :required="!isEditing" />
            </div>

            <button type="submit" class="btn-submit">{{ isEditing ? 'Actualizar Usuario' : 'Guardar Usuario' }}</button>
        </form>
        <p v-else>Cargando información del usuario...</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const usuario = ref({
    nombreCompleto: '',
    cedula: '',
    email: '',
    sede: '',
    cargoNombre: '',
    centroDeCostosNombre: '',
    rol: 'Empleado',
    activo: true,
    contrasena: ''
});

const isEditing = computed(() => !!route.params.id);

onMounted(async () => {
    if (isEditing.value) {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get(`http://localhost:3000/api/admin/usuarios/${route.params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Asignamos los datos
            const userData = response.data;
            usuario.value = {
                ...userData,
                cargoNombre: userData.cargo?.nombre || '',
                centroDeCostosNombre: userData.centroDeCostos?.nombre || ''
            };
        } catch (error) {
            console.error("Error al cargar el usuario:", error);
            alert("No se pudo cargar la información del usuario.");
        }
    }
});

const guardarUsuario = async () => {
    const token = localStorage.getItem('authToken');
    const datosParaEnviar = { ...usuario.value };

    try {
        if (isEditing.value) {
            // Lógica de Actualización
            await axios.put(
                `http://localhost:3000/api/admin/usuarios/${route.params.id}`,
                datosParaEnviar,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert('¡Usuario actualizado con éxito!');
        } else {
            // Lógica para CREAR un nuevo usuario
            if (!datosParaEnviar.contrasena) {
                alert('Para crear un usuario, se necesita una contraseña.');
                return;
            }
            await axios.post(
                'http://localhost:3000/usuarios',
                datosParaEnviar
            );
            alert('¡Usuario creado con éxito!');
        }
        router.push('/dashboard/usuarios');
    } catch (error) {
        console.error("Error al guardar el usuario:", error);
        alert(error.response?.data?.message || 'Hubo un error al guardar los cambios.');
    }
};
</script>

<style scoped>
.form-container {
    padding: 2rem;
    max-width: 800px;
    margin: auto;
}
.user-form {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.form-group {
    margin-bottom: 1.5rem;
}
label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #334155;
}
input,
select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 1rem;
}
.btn-submit {
    background-color: #16a34a;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
}
</style>