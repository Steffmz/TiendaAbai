<template>
  <div class="topbar">
    <div class="menu-icon" @click="$emit('toggleSidebar')">
  <span class="iconify" data-icon="mdi:menu"></span>
</div>

    <div class="logo">
      <img 
        :src="isDark ? logoBlanco : logoNormal" 
        alt="ABAI Logo" 
      />
    </div>

    <div class="centro1"></div>

    <div class="actions">
      <Icon 
        :icon="isDark ? 'mdi:white-balance-sunny' : 'mdi:weather-night'" 
        :title="isDark ? 'Modo Claro' : 'Modo Noche'" 
        @click="toggleDarkMode" 
      />

      <Icon icon="mdi:account-circle" title="Perfil" @click="showProfile" />
      
      <div class="notification-icon-wrapper">
        <Icon icon="mdi:bell-outline" title="Notificaciones" @click="showNotifications" />
        <span v-if="unreadCount > 0" class="topbar-badge">{{ unreadCount }}</span>
      </div>

      <Icon icon="mdi:help-circle-outline" title="Ayuda" @click="showHelp" />

      <Icon icon="mdi:logout" title="Cerrar Sesión" @click="logout" />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { useTheme } from '../../theme.js';
import { useRouter } from 'vue-router';
import { onMounted } from "vue";
import Swal from 'sweetalert2';
import logoNormal from "../../assets/img/abai-logo.png";
import logoBlanco from "../../assets/img/Logo-blanco.png";
import { useNotifications } from '../../composables/useNotifications';

const emit = defineEmits(['toggle', 'open-profile', 'toggle-notifications']);

const router = useRouter();
const { isDark, toggle } = useTheme();
const { unreadCount, fetchUnreadCount, markAllAsRead } = useNotifications();

function toggleDarkMode() {
  toggle();
}

function showHelp() { 
  Swal.fire('Ayuda', 'Esta sección está en desarrollo.', 'info');
}

function showProfile() { 
  emit('open-profile');
}

function showNotifications() { 
  emit('toggle-notifications');
  markAllAsRead();
}

function logout() { 
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
  })
}

onMounted(fetchUnreadCount);
</script>

<style src="./Topbar.css"></style>
<style>
.notification-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.topbar-badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  padding: 0.1em 0.4em;
  font-size: 0.7rem;
  font-weight: bold;
}
</style>