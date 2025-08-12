<template>
  <div class="topbar">
    <div class="logo">
      ABAI S.A.S
    </div>

    <div class="actions">
      <button class="action-btn" title="Perfil">
        <Icon icon="mdi:account-circle" />
      </button>
      <button class="action-btn" title="Notificaciones">
        <Icon icon="mdi:bell-outline" />
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

<style scoped>
/* Puedes añadir o importar los estilos de Topbar.css aquí si lo prefieres */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0 2rem;
  height: 80px;
  border-bottom: 1px solid #e2e8f0;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: #334155;
}

.actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

.action-btn .iconify {
  font-size: 1.6rem;
  color: #334155;
}
</style>