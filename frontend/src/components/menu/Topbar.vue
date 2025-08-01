<template>
  <div class="topbar">
    <div class="logo">
      <img src="../../assets/img/abai-logo.png" alt="ABAI Logo" />
    </div>
    
    <div class="actions">
      <button class="action-btn" title="Modo Noche">
        <Icon icon="mdi:weather-night" />
      </button>
      <button class="action-btn" title="Perfil">
        <Icon icon="mdi:account-circle" />
      </button>
      <button class="action-btn" title="Notificaciones">
        <Icon icon="mdi:bell-outline" />
      </button>
      <button class="action-btn" title="Ayuda">
        <Icon icon="mdi:help-circle-outline" />
      </button>
      <button @click="logout" class="action-btn" title="Cerrar Sesión">
        <Icon icon="mdi:logout" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    localStorage.removeItem('authToken');
    router.push('/login');
  }
};
</script>

<style src="./Topbar.css"></style>