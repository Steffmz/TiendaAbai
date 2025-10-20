<template>
  <div class="dashboard-layout">
    <Sidebar 
      :isCollapsed="isCollapsed" 
      :isOpen="sidebarOpen" 
      @toggle="handleSidebarToggle" 
      @close="sidebarOpen = false" 
    />

    <div 
      v-if="sidebarOpen" 
      class="overlay" 
      @click="sidebarOpen = false">
    </div>

    <div class="main-content" :class="{ collapsed: isCollapsed, 'sidebar-open': sidebarOpen }">
      <Topbar 
        @toggleSidebar="handleMobileSidebarToggle" 
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

    <NotificationsPanel 
      :show="showNotifications" 
      @close="showNotifications = false" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Sidebar from '../menu/Sidebar.vue'
import Topbar from '../menu/Topbar.vue'
import ProfileModal from '../admin/ProfileModal.vue'
import NotificationsPanel from '../shared/NotificationsPanel.vue'
import Footer from '../shared/Footer.vue'

const isCollapsed = ref(false)     
const sidebarOpen = ref(false)     
const showProfileModal = ref(false)
const showNotifications = ref(false)
const adminData = ref({})
const router = useRouter()

const isMobile = () => window.innerWidth <= 768

const resetStatesOnResize = () => {
  if (isMobile()) {
    sidebarOpen.value = false
    isCollapsed.value = false
  } else {
    sidebarOpen.value = false
  }
}

const handleSidebarToggle = () => {
  if (!isMobile()) {
    isCollapsed.value = !isCollapsed.value
  }
}

const handleMobileSidebarToggle = () => {
  if (isMobile()) {
    sidebarOpen.value = !sidebarOpen.value
  }
}

const handleResize = () => {
  resetStatesOnResize()
}

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
})

const fetchAdminData = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/perfil', getAuthHeaders())
    adminData.value = data
  } catch (error) {
    console.error("Error al cargar datos del admin:", error)
    logout()
  }
}

const logout = () => {
  localStorage.removeItem('authToken')
  router.push('/login')
}

onMounted(() => {
  fetchAdminData()
  window.addEventListener('resize', handleResize)
  resetStatesOnResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style src="./Dashboard.css"></style>