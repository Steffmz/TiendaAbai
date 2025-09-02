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

        <div v-if="isLoggedIn" class="flex items-center gap-6 text-white">
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
            @click="login"
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
      <div class="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 max-w-3xl mx-auto text-center">
      <h2
        class="text-4xl md:text-5xl font-extrabold mb-6 inline-block relative after:content-[''] after:block after:h-1 after:w-3/4 after:bg-white after:mx-auto after:mt-3 after:rounded-full"
      >
        <span v-if="usuario">Bienvenido, {{ usuario.nombre }}</span>
        <span v-else>Bienvenido a tu tienda de puntos</span>
      </h2>
      <p class="text-lg md:text-xl opacity-90">
        <span v-if="usuario">
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
      class="text-white py-6"
      style="background: linear-gradient(135deg, #74B9E7 0%, #2B7FFF 100%);"
    >
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <img src="../../assets/img/abai-logo.png" alt="Logo Abai" class="h-12 object-contain" />
          <span class="text-sm">© Todos los derechos reservados</span>
        </div>
        <div class="flex gap-5 text-white">
          <a href="https://facebook.com" target="_blank" aria-label="Facebook" class="hover:scale-110 transition">
            <Icon icon="mdi:facebook" class="text-2xl" />
          </a>
          <a href="https://instagram.com" target="_blank" aria-label="Instagram" class="hover:scale-110 transition">
            <Icon icon="mdi:instagram" class="text-2xl" />
          </a>
          <a href="https://tiktok.com" target="_blank" aria-label="TikTok" class="hover:scale-110 transition">
            <Icon icon="ic:baseline-tiktok" class="text-2xl" />
          </a>
        </div>
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
      const decodedToken = jwtDecode(token);
      const response = await axios.get('http://localhost:3000/api/perfil', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      usuario.value = { ...decodedToken, nombre: response.data.nombreCompleto };
      isLoggedIn.value = true;
    } catch (error) {
      localStorage.removeItem("authToken");
      isLoggedIn.value = false;
    }
  } else {
    isLoggedIn.value = false;
  }
};

const login = () => router.push('/login');
const logout = () => {
  localStorage.removeItem("authToken");
  isLoggedIn.value = false;
  usuario.value = null;
  // Optionally, you can redirect to the home page to reflect the logged-out state
  // router.push('/'); 
};

onMounted(checkLoginStatus);
</script>