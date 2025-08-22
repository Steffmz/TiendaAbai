<!-- frontend/src/components/layouts/Dashboard.vue -->
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
    <ProfileModal :show="showProfileModal" @close="showProfileModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '../menu/Sidebar.vue';
import Topbar from '../menu/Topbar.vue';
import ProfileModal from '../admin/ProfileModal.vue'; // <-- Importa el modal

const isCollapsed = ref(false);
const showProfileModal = ref(false); // <-- Lógica para el modal

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style src="./Dashboard.css"></style>