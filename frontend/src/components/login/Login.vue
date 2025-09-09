<style src="./Login.css"></style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from 'axios';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();

const cedula = ref("");
const password = ref("");
const showModal = ref(false);
const errorMessage = ref("");

// Estados para mostrar/ocultar contraseñas
const showPassword = ref(false);
const showPasswordReg = ref(false);

// Estado para detectar modo oscuro
const isDarkMode = ref(false);

const registro = ref({
  nombreCompleto: "",
  cargo: "",
  sede: "",
  centroDeCostosNombre: "",
  email: "",
  cedula: "",
  contrasena: "",
  rol: 'Empleado'
});

// --- Función para detectar modo oscuro ---
const checkDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark');
};

// --- Funciones de Validación ---
const onCedulaInput = (event, isRegistro = false) => {
  const value = event.target.value.replace(/\D/g, ''); // Solo números
  const limitedValue = value.slice(0, 15); // Máximo 15 caracteres
  
  if (isRegistro) {
    registro.value.cedula = limitedValue;
  } else {
    cedula.value = limitedValue;
  }
  
  event.target.value = limitedValue;
};

const onPasswordInput = (event, isRegistro = false) => {
  const limitedValue = event.target.value.slice(0, 18); // Máximo 18 caracteres
  
  if (isRegistro) {
    registro.value.contrasena = limitedValue;
  } else {
    password.value = limitedValue;
  }
  
  event.target.value = limitedValue;
};

const togglePasswordVisibility = (isRegistro = false) => {
  if (isRegistro) {
    showPasswordReg.value = !showPasswordReg.value;
  } else {
    showPassword.value = !showPassword.value;
  }
};

// --- Lógica de Login ---
const login = async () => {
  errorMessage.value = '';
  try {
    // URL CORRECTA (de tu rama)
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
      cedula: cedula.value,
      contrasena: password.value,
    });

    const { token } = response.data;
    localStorage.setItem('authToken', token);

    const decodedToken = jwtDecode(token);

    if (decodedToken.rol === 'Administrador') {
      router.push('/dashboard');
    } else {
      router.push('/tienda');
    }

  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Error connecting to the server.';
    }
  }
};

// --- Lógica de Registro ---
const register = async () => {
  errorMessage.value = '';
  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, registro.value);

    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
    closeModal();
    registro.value = { nombreCompleto: "", cargo: "", sede: "", centroDeCostosNombre: "", email: "", cedula: "", contrasena: "", rol: 'Empleado' };

  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Error de conexión con el servidor.';
    }
  }
};

const openModal = () => {
  showModal.value = true;
  errorMessage.value = '';
};

const closeModal = () => {
  showModal.value = false;
  errorMessage.value = '';
  showPasswordReg.value = false;
};

// --- Animación del Canvas (Optimizada) ---
onMounted(() => {
  checkDarkMode();
  
  const observer = new MutationObserver(() => {
    checkDarkMode();
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  const canvas = document.getElementById("magneticCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let animationFrameId;

  const particles = [];
  const particleCount = 70;
  const maxDistanceSquared = 120 * 120;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 2 + 1;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fill();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.update();
      p.draw();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < maxDistanceSquared) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", handleResize);

  onBeforeUnmount(() => {
    observer.disconnect();
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener("resize", handleResize);
  });
});
</script>

<template>
  <div class="electro-background">
    <canvas id="magneticCanvas"></canvas>
  </div>

  <div class="page-container">
    <div class="login-wrapper">
      <div class="login-left">
        <img src="../../assets/img/abai3.jpg" alt="Imagen Tienda Puntos" />
      </div>

      <div class="login-right">
        <div class="login-card">
          <div class="logo-container">
            <img 
              v-if="isDarkMode" 
              src="../../assets/img/Logo-blanco.png" 
              alt="Logo Abai Dark" 
              class="logo-abai" 
            />
            <img 
              v-else 
              src="../../assets/img/abai-logo.png" 
              alt="Logo Abai Light" 
              class="logo-abai" 
            />
          </div>
          <h2 class="title">BIENVENIDOS</h2>
          <p v-if="errorMessage && !showModal" class="error-text">{{ errorMessage }}</p>
          <form @submit.prevent="login">
            <div class="input-group">
              <label for="cedula">Cédula</label>
              <input 
                type="text" 
                id="cedula" 
                v-model="cedula" 
                @input="onCedulaInput"
                placeholder="Ingresa tu cédula" 
                maxlength="15"
                pattern="[0-9]*"
                inputmode="numeric"
                required 
              />
            </div>
            <div class="input-group">
              <label for="password">Contraseña</label>
              <div class="password-container">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="password" 
                  @input="onPasswordInput"
                  placeholder="Ingresa tu contraseña" 
                  maxlength="18"
                  required 
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="togglePasswordVisibility(false)"
                  tabindex="-1"
                >
                  <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
            <router-link to="/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</router-link>
            <button type="submit" class="btn-login">Iniciar Sesión</button>
          </form>
          <div class="register-link">
            ¿No tienes cuenta?
            <a href="#" @click.prevent="openModal">Regístrate aquí</a>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" v-show="showModal" @click.self="closeModal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2 class="tituloCrear">Crear Cuenta</h2>
        <p v-if="errorMessage && showModal" class="error-text">{{ errorMessage }}</p>
        <br />
        <form @submit.prevent="register">
          <div class="input-group">
            <label for="nombre">Nombre Completo</label>
            <input type="text" id="nombre" v-model="registro.nombreCompleto" placeholder="Ingresa tu nombre" required />
          </div>
          <div class="input-group">
            <label for="cargo-reg">Cargo</label>
            <input type="text" id="cargo-reg" v-model="registro.cargo" placeholder="Ingresa tu cargo" required />
          </div>
          <div class="input-group">
            <label for="sede-reg">Sede</label>
            <input type="text" id="sede-reg" v-model="registro.sede" placeholder="Ingresa tu sede" required />
          </div>
          <div class="input-group">
            <label for="centro-costos-reg">Centro de Costos</label>
            <input type="text" id="centro-costos-reg" v-model="registro.centroDeCostosNombre"
              placeholder="Ej: Marketing, Operaciones" required />
          </div>
          <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" v-model="registro.email" placeholder="Ingresa tu correo" required />
          </div>
          <div class="input-group">
            <label for="cedula-reg">Cédula</label>
            <input 
              type="text" 
              id="cedula-reg" 
              v-model="registro.cedula" 
              @input="onCedulaInput($event, true)"
              placeholder="Ingresa tu cédula" 
              maxlength="15"
              pattern="[0-9]*"
              inputmode="numeric"
              required 
            />
          </div>
          <div class="input-group">
            <label for="password-reg">Contraseña</label>
            <div class="password-container">
              <input 
                :type="showPasswordReg ? 'text' : 'password'" 
                id="password-reg" 
                v-model="registro.contrasena" 
                @input="onPasswordInput($event, true)"
                placeholder="Crea una contraseña"
                maxlength="18"
                required 
              />
              <button 
                type="button" 
                class="password-toggle"
                @click="togglePasswordVisibility(true)"
                tabindex="-1"
              >
                <svg v-if="showPasswordReg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn-login">Registrarse</button>
        </form>
      </div>
    </div>
  </div>
</template>