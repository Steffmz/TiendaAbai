<template>
  <div class="dashboard-layout">
    <Sidebar :isCollapsed="isCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ collapsed: isCollapsed }">
      <!-- Pasamos el evento 'open-profile' desde Topbar -->
      <Topbar @open-profile="showProfileModal = true" />
      <div class="page-content">
        <router-view />
      </div>
    </div>
    <!-- Añadimos el modal aquí -->
    <ProfileModal :show="showProfileModal" @close="showProfileModal = false" @profileUpdated="fetchAdminData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Sidebar from '../menu/Sidebar.vue';
import Topbar from '../menu/Topbar.vue';
import ProfileModal from '../admin/ProfileModal.vue';

const isCollapsed = ref(false);
const showProfileModal = ref(false);
const adminData = ref({}); // Para guardar los datos del admin
const router = useRouter(); // Para la función de logout

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

// Función para obtener los datos del perfil del admin
const fetchAdminData = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/perfil', getAuthHeaders());
    adminData.value = data;
  } catch (error) {
    console.error("Error al cargar datos del admin:", error);
    logout(); // Si hay un error (ej. token inválido), cerramos sesión
  }
};

const logout = () => {
  localStorage.removeItem('authToken');
  router.push('/login');
};

// Al cargar el dashboard, obtenemos los datos del admin
onMounted(fetchAdminData);
</script>

<style src="./Dashboard.css"></style>