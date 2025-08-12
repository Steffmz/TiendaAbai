  <template>
    <div class="topbar">
      <!-- Botón del menú -->
      <div class="menu-icon" @click="$emit('toggle')">
        <Icon icon="mdi:menu" />
      </div>

      <!-- Logo -->
      <div class="logo">
        <img src="../../assets/img/abai-logo.png" alt="ABAI Logo" />
      </div>
      
      <div class="centro1">
        
      </div>

      <!-- Acciones -->
      <div class="actions">
        <Icon icon="mdi:weather-night" title="Modo Noche" @click="toggleDarkMode" />
        <Icon icon="mdi:account-circle" title="Perfil" @click="showProfile" />
        <Icon icon="mdi:bell-outline" title="Notificaciones" @click="showNotifications" />
        <Icon icon="mdi:help-circle-outline" title="Ayuda" @click="showHelp" />
        <Icon icon="mdi:logout" title="Cerrar Sesión" @click="logout" />
      </div>
    </div>
  </template>

  <script setup>
  import { Icon } from '@iconify/vue';

  function showHelp() {
    console.log('Mostrar ayuda');
  }

  function showProfile() {
    console.log('Mostrar perfil');
  }

  function showNotifications() {
    console.log('Mostrar notificaciones');
  }

  function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      console.log('Cerrar sesión');
    }
  }
  </script>

  <style src="./Topbar.css"></style>
