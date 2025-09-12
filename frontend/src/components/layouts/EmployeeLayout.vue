<template>
  <div class="employee-layout">
    <!-- NAVBAR -->
    <header class="navbar">
      <div class="navbar-content">
        <!-- Logo -->
        <div class="logo">
          <img src="../../assets/img/abai-logo.png" alt="ABAI Logo" />
        </div>

        <!-- Links SOLO con iconos -->
        <nav class="nav-links">
          <router-link to="/tienda" class="nav-item" title="Tienda">
            <span class="iconify" data-icon="mdi:storefront"></span>
          </router-link>
          <router-link to="/tienda/mis-pedidos" class="nav-item" title="Pedidos">
            <span class="iconify" data-icon="mdi:clipboard-list"></span>
          </router-link>
          <router-link to="/tienda/mi-perfil" class="nav-item" title="Perfil">
            <span class="iconify" data-icon="mdi:account-circle"></span>
          </router-link>
        </nav>

        <!-- Usuario / Puntos / Iconos -->
        <div class="user-info">
          <span v-if="userData.nombreCompleto" class="user-name">
            {{ userData.nombreCompleto.split(' ')[0] }}
          </span>
          <span class="points-badge">{{ userData.puntosTotales }} pts</span>

          <!-- Carrito -->
          <router-link to="/tienda/carrito" class="icon-button" title="Carrito">
            <span class="iconify" data-icon="mdi:cart-outline"></span>
            <span v-if="cartStore.totalItems > 0" class="cart-badge">
              {{ cartStore.totalItems }}
            </span>
          </router-link>

          <!-- Notificaciones -->
          <button
            @click="toggleNotifications"
            class="icon-button"
            title="Notificaciones"
          >
            <span class="iconify" data-icon="mdi:bell-outline"></span>
            <span v-if="unreadCount > 0" class="cart-badge">
              {{ unreadCount }}
            </span>
          </button>

          <!-- Logout -->
          <button @click="logout" class="icon-button" title="Cerrar Sesión">
            <span class="iconify" data-icon="mdi:logout"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Notificaciones -->
    <NotificationsPanel
      :show="showNotifications"
      @close="showNotifications = false"
    />

    <!-- CONTENIDO -->
    <main class="main-content">
      <router-view @redemption-successful="fetchUserData" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import NotificationsPanel from "../shared/NotificationsPanel.vue";
import { useNotifications } from "../../composables/useNotifications";
import { useCartStore } from "../../stores/cartStore";

const router = useRouter();
const userData = ref({
  nombreCompleto: "",
  puntosTotales: 0,
});
const showNotifications = ref(false);
const cartStore = useCartStore();

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});
const { unreadCount, fetchUnreadCount, markAllAsRead } = useNotifications();

const fetchUserData = async () => {
  try {
    const { data } = await axios.get(
      "http://localhost:3000/api/perfil",
      getAuthHeaders()
    );
    userData.value = data;
    await cartStore.fetchCarrito();
  } catch (error) {
    console.error("Error al cargar datos del usuario:", error);
    logout();
  }
};

const logout = () => {
  localStorage.removeItem("authToken");
  router.push("/login");
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) markAllAsRead();
};

onMounted(() => {
  fetchUserData();
  fetchUnreadCount();
});
</script>

<style scoped>
.employee-layout {
  width: 100%;
  min-height: 100vh;
  background-color: var(--background);
  padding-top: 70px;
}

.main-content {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

/* ==== NAVBAR ==== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  z-index: 50;
  background: linear-gradient(135deg, #74b9e7 0%, #2b7fff 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Logo */
.logo img {
  height: 40px;
  transition: transform 0.3s;
}
.logo img:hover {
  transform: scale(1.05);
}

/* Links SOLO ICONOS */
.nav-links {
  display: flex;
  gap: 1.8rem;
}
.nav-item {
  font-size: 1.6rem;
  color: white;
  text-decoration: none;
  transition: transform 0.3s, color 0.3s;
}
.nav-item:hover {
  transform: translateY(-2px);
  color: #ffdd57;
}
.nav-links a.router-link-exact-active {
  color: #ffdd57;
}

/* Usuario */
.user-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.user-name {
  font-weight: 600;
  font-size: 0.95rem;
}
.points-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.85rem;
}

/* Botones */
.icon-button {
  position: relative;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  transition: color 0.3s, transform 0.2s;
}
.icon-button:hover {
  color: #ffdd57;
  transform: scale(1.1);
}

/* Badges */
.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  padding: 0.1em 0.4em;
  font-size: 0.7rem;
  font-weight: bold;
}

/* ==== RESPONSIVE ==== */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 1rem;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .user-info {
    gap: 0.6rem;
  }

  .user-name {
    display: none; /* Ocultar nombre en móvil */
  }
  .points-badge {
    padding: 0.25rem 0.6rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 0.8rem;
  }

  .nav-item {
    font-size: 1.3rem;
  }

  .points-badge {
    display: none; /* Ocultar puntos en pantallas muy pequeñas */
  }
}
</style>
