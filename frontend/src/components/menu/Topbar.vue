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
      <Icon icon="mdi:bell-outline" title="Notificaciones" @click="showNotifications" />
      <Icon icon="mdi:help-circle-outline" title="Ayuda" @click="showHelp" />
      <Icon icon="mdi:logout" title="Cerrar Sesión" @click="logout" />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { useTheme } from '../../theme.js';
import { useRouter } from 'vue-router';

import logoNormal from "../../assets/img/abai-logo.png";
import logoBlanco from "../../assets/img/Logo-blanco.png";

const emit = defineEmits(['toggle', 'open-profile', 'toggle-notifications']);

const router = useRouter();
const { isDark, toggle } = useTheme();

function toggleDarkMode() {
  toggle();
}

function showHelp() { console.log("Mostrar ayuda"); }
function showProfile() { 
  emit('open-profile');
}

function showNotifications() { 
  emit('toggle-notifications'); 
}

function logout() { 
  if (confirm("¿Estás seguro de que quieres cerrar sesión?")) { 
    localStorage.removeItem('authToken');
    router.push('/login');
  } 
}
</script>

<style src="./Topbar.css"></style>
