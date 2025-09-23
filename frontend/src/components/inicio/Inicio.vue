<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header
      class="shadow-md sticky top-0 z-50"
      style="background: linear-gradient(135deg, #74B9E7 0%, #2B7FFF 100%);"
    >
      <div class="max-w-7xl mx-auto px-12 py-4 flex justify-between items-center">
        <div class="logo-container">
          <img
            src="../../assets/img/abai-logo.png"
            alt="Logo Abai"
            class="h-14 object-contain"
          />
        </div>

        <div v-if="isLoggedIn && usuario" class="flex items-center gap-6 text-white">
           <span class="font-semibold">Hola, {{ usuario.nombreCompleto.split(' ')[0] }}</span>
           <span class="points-badge">{{ usuario.puntosTotales }} Puntos</span>
           <Icon icon="mdi:cart-heart" class="text-3xl cursor-pointer" title="Carrito" />
           <Icon icon="mdi:bell-outline" class="text-3xl cursor-pointer" title="Notificaciones" />
           <Icon icon="mdi:account-circle" class="text-3xl cursor-pointer" title="Perfil" />
           <Icon
            icon="mdi:logout"
            class="text-3xl cursor-pointer"
            title="Cerrar Sesión"
            @click="logout"
          />
        </div>

        <div v-else>
          <button
            @click="goToLogin"
            class="bg-white text-black px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </header>

    <div class="w-full h-2 bg-[#ffcc00]"></div>

    <section
      class="relative text-white py-20 px-8 text-center overflow-hidden rounded-b-3xl"
      style="background: linear-gradient(135deg, #74B9E7 0%, #2B7FFF 100%);"
    >
      <div class="relative z-10 max-w-3xl mx-auto text-center">
      <h2
        class="text-4xl md:text-5xl font-extrabold mb-6"
      >
        <span v-if="isLoggedIn && usuario">Bienvenido, {{ usuario.nombreCompleto }}</span>
        <span v-else>Bienvenido a tu tienda de puntos</span>
      </h2>
      <p class="text-lg md:text-xl opacity-90">
        <span v-if="isLoggedIn">
          ¡Nos alegra verte de nuevo! Explora y canjea tus puntos por increíbles premios.
        </span>
        <span v-else>
          Explora, selecciona tus categorías favoritas y canjea tus puntos por premios.
        </span> 
      </p>
    </div>
    </section>

    <main class="max-w-7xl mx-auto px-12 py-10 space-y-12">
      <InicioNoL v-if="!isLoggedIn" />
      <InicioLogueado v-else />
    </main>

     <footer
        class="text-white py-6 mt-auto"
        style="background: linear-gradient(135deg, #74B9E7 0%, #2B7FFF 100%);"
        >
        <div class="flex justify-center space-x-6">
          <!-- Facebook -->
          <a
            href="https://facebook.com/tu_pagina"
            target="_blank"
            class="hover:scale-110 transition-transform"
          >
            <span class="iconify text-3xl" data-icon="mdi:facebook" style="color: #ffffff;"></span>
          </a>

          <!-- Instagram -->
          <a
            href="https://instagram.com/tu_pagina"
            target="_blank"
            class="hover:scale-110 transition-transform"
          >
            <span class="iconify text-3xl" data-icon="mdi:instagram" style="color: #ffffff;"></span>
          </a>

          <!-- TikTok -->
          <a
            href="https://www.tiktok.com/@tu_pagina"
            target="_blank"
            class="hover:scale-110 transition-transform"
          >
            <span class="iconify text-3xl" data-icon="ic:baseline-tiktok" style="color: #ffffff;"></span>
          </a>
        </div>
      </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import InicioNoL from "./InicioNoL.vue";
import InicioLogueado from "./InicioLogueado.vue";

const router = useRouter();
const isLoggedIn = ref(false);
const usuario = ref(null);

const checkLoginStatus = async () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      jwtDecode(token); // Solo para validar que no esté corrupto
      const response = await axios.get('http://localhost:3000/api/perfil', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      usuario.value = response.data;
      isLoggedIn.value = true;
    } catch (error) {
      console.error("Token inválido o sesión expirada:", error);
      localStorage.removeItem("authToken");
      isLoggedIn.value = false;
      usuario.value = null;
    }
  } else {
    isLoggedIn.value = false;
  }
};

const goToLogin = () => router.push('/login');

const logout = () => {
  localStorage.removeItem("authToken");
  isLoggedIn.value = false;
  usuario.value = null;
  // Refrescamos la página para asegurar que la vista pública se cargue correctamente
  window.location.reload();
};

onMounted(checkLoginStatus);
</script>

<style scoped>
.points-badge { background-color: rgba(255, 255, 255, 0.2); padding: 0.4rem 0.8rem; border-radius: 9999px; font-weight: 600; font-size: 0.9rem; }
</style>