<template>
  <div class="home-container" v-if="usuario">
    <header>
      <h1>Bienvenido de nuevo, {{ usuario.nombreCompleto }}</h1>
      <nav>
        <router-link to="/catalogo" class="nav-link">Ver Catálogo</router-link>
      </nav>
      <button @click="logout" class="btn-logout">Cerrar Sesión</button>
    </header>
    <main>
      <div class="card puntos-card">
        <h2>Tus Puntos</h2>
        <p class="puntos">{{ usuario.puntosTotales }}</p>
      </div>
      <div class="card info-card">
        <h2>Tu Información</h2>
        <p><strong>Cargo:</strong> {{ usuario.cargo }}</p>
        <p><strong>Sede:</strong> {{ usuario.sede }}</p>
        <p><strong>Email:</strong> {{ usuario.email }}</p>
      </div>
    </main>
  </div>
  <div class="loading-container" v-else>
    <p>Cargando perfil...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const usuario = ref(null);

// Esta función se ejecuta automáticamente cuando el componente se carga
onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    router.push('/login'); // Si no hay token, fuera
    return;
  }

  try {
    // Hacemos la petición a la ruta protegida, enviando el token en los encabezados
    const response = await axios.get('http://localhost:3000/api/perfil', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    usuario.value = response.data; // Guardamos los datos del usuario
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    // Si el token es inválido o expiró, el backend dará un error 401 o 403
    // y forzamos el cierre de sesión
    logout();
  }
});

const logout = () => {
  localStorage.removeItem('authToken'); // Borramos el token
  router.push('/login'); // Redirigimos al login
};
</script>

<style scoped>
  .home-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: "Quicksand", sans-serif;
    color: #333;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1rem;
  }
  .nav-link {
    margin: 0 1rem;
    text-decoration: none;
    font-weight: 600;
    color: var(--primary-color);
  }
  .btn-logout {
    padding: 0.5rem 1rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
  main {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  .card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  .puntos-card {
    text-align: center;
  }
  .puntos {
    font-size: 3rem;
    font-weight: bold;
    color: var(--primary-color);
    margin-top: 1rem;
  }
  .info-card p {
    margin-bottom: 0.5rem;
  }
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.5rem;
  }
</style>