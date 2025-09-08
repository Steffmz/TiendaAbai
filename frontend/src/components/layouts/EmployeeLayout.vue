<template>
  <div class="employee-layout">
    <header class="navbar">
      <div class="navbar-content">
        <div class="logo">
          <img src="../../assets/img/Logo-blanco.png" alt="ABAI Logo" />
        </div>
        <nav class="nav-links">
          <router-link to="/tienda">Tienda</router-link>
          <router-link to="/tienda/carrito">Mi Carrito</router-link>
          <router-link to="/tienda/mi-perfil">Mi Perfil</router-link>
        </nav>
        <div class="user-info">
          <span v-if="userData.nombreCompleto">Hola, {{ userData.nombreCompleto.split(' ')[0] }}</span>
          <span class="points-badge">{{ userData.puntosTotales }} Puntos</span>

          <router-link to="/tienda/carrito" class="cart-button" title="Carrito" id="cart-icon">
            <svg></svg>
            <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
          </router-link>

          <button @click="toggleNotifications" class="notification-button" title="Notificaciones">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M21 19v1H3v-1l2-2v-6c0-3.1 2.03-5.83 5-6.71V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v.29c2.97.88 5 3.61 5 6.71v6zm-7 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2" />
            </svg>
            <span v-if="unreadCount > 0" class="cart-badge">{{ unreadCount }}</span>
          </button>

          <button @click="logout" class="logout-button" title="Cerrar Sesión">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

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
import { useCarrito } from '../../composables/useCarrito';
import { useNotifications } from '../../composables/useNotifications';

const router = useRouter();
const userData = ref({
  nombreCompleto: '', // Empezamos con el nombre vacío
  puntosTotales: 0
});
const showNotifications = ref(false);

const { totalItems, fetchCarrito } = useCarrito();

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});
const { unreadCount, fetchUnreadCount, markAllAsRead } = useNotifications();

const fetchUserData = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/perfil', getAuthHeaders());
    userData.value = data;
    await fetchCarrito();
  } catch (error) {
    console.error("Error al cargar datos del usuario en el layout:", error);
    logout(); // Si falla, cerramos sesión para evitar inconsistencias
  }
};

const logout = () => {
  localStorage.removeItem('authToken');
  router.push('/login');
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  // Si abrimos el panel, marcamos como leídas
  if (showNotifications.value) {
    markAllAsRead();
  }
};

onMounted(() => {
  fetchUserData();
  // --- CORRECCIÓN 2: Asegúrate de que esta línea esté presente ---
  fetchUnreadCount();
});

</script>

<style scoped>
/* Tus estilos existentes se mantienen igual */
.employee-layout {
  background-color: #f4f7fa;
  min-height: 100vh;
}

.navbar {
  background: linear-gradient(135deg, #74B9E7 0%, #2B7FFF 100%);
  color: white;
  padding: 0 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  max-width: 1280px;
  margin: auto;
}

.logo img {
  height: 40px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  margin: 0 1rem;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s;
}

.nav-links a.router-link-exact-active {
  border-bottom-color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.points-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.9rem;
}

.logout-button,
.notification-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s;
}
.notification-button {
  position: relative;
  }

.logout-button:hover,
.notification-button:hover {
  opacity: 1;
}

.main-content {
  padding: 2rem;
  max-width: 1280px;
  margin: auto;
}

/* Tus estilos existentes... */
.cart-button {
  position: relative;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -10px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  padding: 0.1em 0.4em;
  font-size: 0.75rem;
  font-weight: bold;
}

.employee-layout {
  background-color: #f4f7fa;
  min-height: 100vh;
}

.navbar {
  background: linear-gradient(135deg, #74B9E7 0%, #2B7FFF 100%);
  color: white;
  padding: 0 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  max-width: 1280px;
  margin: auto;
}

.logo img {
  height: 40px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  margin: 0 1rem;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s;
}

.nav-links a.router-link-exact-active {
  border-bottom-color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.points-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.9rem;
}

.logout-button,
.notification-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.logout-button:hover,
.notification-button:hover {
  opacity: 1;
}

.main-content {
  padding: 2rem;
  max-width: 1280px;
  margin: auto;
}
</style>