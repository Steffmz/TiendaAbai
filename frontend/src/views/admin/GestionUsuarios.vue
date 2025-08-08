    <template>
  <div class="user-management">
    <h1>Gestión de Usuarios</h1>
    <table v-if="usuarios.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre Completo</th>
          <th>Cédula</th>
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
          <td>{{ usuario.cedula }}</td>
          <td>{{ usuario.cargo.nombre }}</td>
          <td>{{ usuario.email }}</td>
          <td>{{ usuario.rol }}</td>
          <td>{{ usuario.puntosTotales }}</td>
          <td>
            <button class="btn-edit">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Cargando usuarios...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const usuarios = ref([]);

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get('http://localhost:3000/api/admin/usuarios', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    usuarios.value = response.data;
  } catch (error) {
    console.error("No tienes permiso o hubo un error:", error);
    // Opcional: redirigir si no es admin
    // router.push('/');
  }
});
</script>

<style scoped>
.user-management { padding: 2rem; }
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
.btn-edit { background-color: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
</style>