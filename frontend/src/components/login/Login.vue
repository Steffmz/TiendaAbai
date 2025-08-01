<style src="./Login.css"></style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from 'axios';
import { useRouter } from 'vue-router'; // Asegúrate de tener esta línea

const router = useRouter(); // Y esta

// --- Variables reactivas ---
const cedula = ref("");
const password = ref("");
const showModal = ref(false);
const errorMessage = ref("");

// Objeto de registro con el campo "centroDeCostosNombre"
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

// --- Lógica de Login ---
const login = async () => {
  errorMessage.value = '';
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      cedula: cedula.value,
      contrasena: password.value,
    });
    
    const { token } = response.data;
    localStorage.setItem('authToken', token);
    
    router.push('/'); // Redirige al usuario

  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Error de conexión con el servidor.';
    }
  }
};

// --- Lógica de Registro ---
const register = async () => {
  errorMessage.value = '';
  try {
    await axios.post('http://localhost:3000/usuarios', registro.value);
    
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

const closeModal = () => {
    showModal.value = false;
    errorMessage.value = '';
};

// --- Animación del Canvas (Optimizada) ---
onMounted(() => {
  const canvas = document.getElementById("magneticCanvas");
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = 75;
  const maxDistance = 140;
  const speed = 1;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = 5;
      this.color = "#1E3A8A";
      this.vx = (Math.random() - 0.5) * speed;
      this.vy = (Math.random() - 0.5) * speed;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;
      ctx.fill();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      this.draw();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      p.update();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255, ${1 - distance / maxDistance})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
  
  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", handleResize);

  onBeforeUnmount(() => {
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
              src="../../assets/img/abai-logo.png"
              alt="Logo Abai"
              class="logo-abai"
            />
          </div>
          <h2 class="title">BIENVENIDOS</h2>
          <p v-if="errorMessage && !showModal" class="error-text">{{ errorMessage }}</p>
          <form @submit.prevent="login">
            <div class="input-group">
              <label for="cedula">Cédula</label>
              <input type="text" id="cedula" v-model="cedula" placeholder="Ingresa tu cédula" required />
            </div>
            <div class="input-group">
              <label for="password">Contraseña</label>
              <input type="password" id="password" v-model="password" placeholder="Ingresa tu contraseña" required />
            </div>
            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
            <button type="submit" class="btn-login">Iniciar Sesión</button>
          </form>
          <div class="register-link">
            ¿No tienes cuenta?
            <a href="#" @click.prevent="showModal = true">Regístrate aquí</a>
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
            <input type="text" id="centro-costos-reg" v-model="registro.centroDeCostosNombre" placeholder="Ej: Marketing, Operaciones" required />
          </div>

          <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" v-model="registro.email" placeholder="Ingresa tu correo" required />
          </div>
          <div class="input-group">
            <label for="cedula-reg">Cédula</label>
            <input type="text" id="cedula-reg" v-model="registro.cedula" placeholder="Ingresa tu cédula" required />
          </div>
          <div class="input-group">
            <label for="password-reg">Contraseña</label>
            <input type="password" id="password-reg" v-model="registro.contrasena" placeholder="Crea una contraseña" required />
          </div>
          <button type="submit" class="btn-login">Registrarse</button>
        </form>
      </div>
    </div>
  </div>
</template>