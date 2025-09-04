<template>
  <div class="dashboard-layout">
    <Sidebar :isCollapsed="isCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ collapsed: isCollapsed }">
      <Topbar 
        @open-profile="showProfileModal = true" 
        @toggle-notifications="showNotifications = !showNotifications"
      />
      <div class="page-content">
        <router-view />
      </div>
    </div>
    <ProfileModal 
      :show="showProfileModal" 
      @close="showProfileModal = false" 
      @profileUpdated="fetchAdminData" 
    />
    <NotificationsPanel :show="showNotifications" @close="showNotifications = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Sidebar from '../menu/Sidebar.vue';
import Topbar from '../menu/Topbar.vue';
import ProfileModal from '../admin/ProfileModal.vue';
import NotificationsPanel from '../shared/NotificationsPanel.vue'; // <-- Importa el panel

const isCollapsed = ref(false);
const showProfileModal = ref(false);
const showNotifications = ref(false); // <-- Añade el estado
const adminData = ref({});
const router = useRouter();

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchAdminData = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/perfil', getAuthHeaders());
    adminData.value = data;
  } catch (error) {
    console.error("Error al cargar datos del admin:", error);
    logout();
  }
};

const logout = () => {
  localStorage.removeItem('authToken');
  router.push('/login');
};

onMounted(fetchAdminData);
</script>

<style src="./Dashboard.css"></style>