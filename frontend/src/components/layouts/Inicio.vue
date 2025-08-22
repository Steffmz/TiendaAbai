<template>
  <div>
    <h1>¡Bienvenido, Empleado!</h1>
    <p>Esta es tu página de inicio.</p>
    <button @click="logout">Cerrar Sesión</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  localStorage.removeItem('authToken');
  router.push('/login');
};
</script>

<style scoped>
  div {
    padding: 2rem;
    text-align: center;
  }
</style>