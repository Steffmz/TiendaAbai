<template>
  <div class="topbar">
    <!-- Menú hamburguesa para móvil (a futuro) -->
    <div class="menu-icon md:hidden">
      <!-- Puedes añadir lógica para un menú desplegable aquí -->
    </div>

    <!-- Logo -->
    <div class="logo">
      <img 
        :src="isDark ? logoBlanco : logoNormal" 
        alt="ABAI Logo" 
      />
    </div>
  
    <!-- Navegación Principal (visible en desktop) -->
    <nav class="nav-links">
      <router-link to="/tienda">Tienda</router-link>
      <router-link to="/tienda/mis-pedidos">Mis Pedidos</router-link>
    </nav>

    <!-- Acciones del Usuario -->
    <div class="actions">
      <span class="points-badge">{{ userData.puntosTotales }} Puntos</span>
      
      <Icon 
        :icon="isDark ? 'mdi:white-balance-sunny' : 'mdi:weather-night'" 
        :title="isDark ? 'Modo Claro' : 'Modo Noche'" 
        @click="toggleDarkMode" 
      />

      <router-link to="/tienda/carrito" class="notification-icon-wrapper" title="Carrito" id="cart-icon">
        <Icon icon="mdi:cart-outline" />
        <span v-if="cartStore.totalItems > 0" class="topbar-badge">{{ cartStore.totalItems }}</span>
      </router-link>

      <div class="notification-icon-wrapper">
        <Icon icon="mdi:bell-outline" title="Notificaciones" @click="$emit('toggle-notifications')" />
        <span v-if="unreadCount > 0" class="topbar-badge">{{ unreadCount }}</span>
      </div>

      <router-link to="/tienda/mi-perfil" class="notification-icon-wrapper" title="Mi Perfil">
        <Icon icon="mdi:account-circle-outline" />
      </router-link>

      <Icon icon="mdi:logout" title="Cerrar Sesión" @click="logout" />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { useTheme } from '../../theme.js';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import logoNormal from "../../assets/img/abai-logo.png";
import logoBlanco from "../../assets/img/Logo-blanco.png";
import { useNotifications } from '../../composables/useNotifications.js';
import { useCartStore } from '../../stores/cartStore.js';

defineProps({
  userData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toggle-notifications']);

const router = useRouter();
const cartStore = useCartStore();
const { isDark, toggle: toggleDarkMode } = useTheme();
const { unreadCount, markAllAsRead } = useNotifications();

const logout = () => { 
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Quieres cerrar la sesión?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, ¡cerrar sesión!',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('authToken');
      router.push('/login');
    }
  });
}
</script>

<style scoped src="./EmployeeTopbar.css"></style>
