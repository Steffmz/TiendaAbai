<template>
  <div class="topbar">
    <div class="menu-icon" @click="$emit('toggle')">
      <Icon icon="mdi:menu" />
    </div>

    <div class="logo">
      <img src="../../assets/img/abai-logo.png" alt="ABAI Logo" />
    </div>

    <div class="actions">
      <Icon icon="mdi:weather-night" title="Modo Noche" />
      <Icon icon="mdi:account-circle" title="Perfil" />
      <Icon icon="mdi:bell-outline" title="Notificaciones" />
      <Icon icon="mdi:help-circle-outline" title="Ayuda" />
      <Icon icon="mdi:logout" title="Cerrar Sesión" @click="logout" />
    </div>
  </div>
</template>

  <script setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router'; // 1. Importa el router

const router = useRouter(); // 2. Obtén la instancia del router

function showHelp() {
  console.log('Mostrar ayuda');
}

function showProfile() {
  console.log('Mostrar perfil');
}

function showNotifications() {
  console.log('Mostrar notificaciones');
}

// 3. Reemplaza tu función de logout con esta
const logout = () => {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    localStorage.removeItem('authToken'); // Borra el token de autenticación
    router.push('/login'); // Redirige al usuario a la página de login
  }
};
</script>