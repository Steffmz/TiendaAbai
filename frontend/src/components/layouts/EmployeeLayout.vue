<template>
  <div class="employee-layout">
    <EmployeeTopbar 
      :user-data="userData"
      @toggle-notifications="toggleNotifications"
    />

    <NotificationsPanel :show="showNotifications" @close="showNotifications = false" />

    <main class="main-content">
      <router-view @redemption-successful="fetchUserData" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import NotificationsPanel from '../shared/NotificationsPanel.vue';
import { useNotifications } from '../../composables/useNotifications';
import { useCartStore } from '../../stores/cartStore'; 
// 1. Importamos el nuevo componente de Topbar para el empleado
import EmployeeTopbar from '../menu/EmployeeTopbar.vue';

const router = useRouter();
const userData = ref({
  nombreCompleto: 'Invitado', // Valor por defecto mientras carga
  puntosTotales: 0
});
const showNotifications = ref(false);
const cartStore = useCartStore();

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});
const { unreadCount, fetchUnreadCount, markAllAsRead } = useNotifications();

const fetchUserData = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/perfil', getAuthHeaders());
    userData.value = data;
    // Cargamos datos iniciales del carrito y notificaciones
    await cartStore.fetchCarrito();
    await fetchUnreadCount();
  } catch (error) {
    console.error("Error al cargar datos del usuario en el layout:", error);
    logout();
  }
};

const logout = () => {
  localStorage.removeItem('authToken');
  router.push('/login');
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    markAllAsRead();
  }
};

onMounted(fetchUserData);
</script>

<style scoped>
.employee-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg);
}

.main-content {
  flex-grow: 1; /* Permite que el contenido principal crezca */
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 100px; /* 80px de la topbar + 20px de espacio */
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 90px; /* 70px de la topbar + 20px de espacio */
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>