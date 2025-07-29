 <style src="./Login.css"></style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";


const cedula = ref("");
const password = ref("");
const showModal = ref(false);

const registro = ref({
  nombre: "",
  email: "",
  cedula: "",
  password: "",
});

const login = () => console.log("Login:", cedula.value, password.value);
const register = () => console.log("Registro:", registro.value);
const closeModal = () => (showModal.value = false);


onMounted(() => {
  const canvas = document.getElementById("magneticCanvas");
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = 150; 
  const maxDistance = 200; 
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

      // Conexiones
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255, ${1 - distance / maxDistance})`; 
          ctx.lineWidth = 1;
          ctx.shadowColor = "#FFFFFF"; 
          ctx.shadowBlur = 6;
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
        <img src="../../assets/img/abai2.jpeg" alt="Imagen Tienda Puntos" />
      </div>

      <div class="login-right">
        <div class="login-card">
          <h2 class="title">BIENVENIDOS</h2>
          <form @submit.prevent="login">
            <div class="input-group">
              <label for="cedula">Cédula</label>
              <input
                type="text"
                id="cedula"
                v-model="cedula"
                placeholder="Ingresa tu cédula"
                required
              />
            </div>
            <div class="input-group">
              <label for="password">Contraseña</label>
              <input
                type="password"
                id="password"
                v-model="password"
                placeholder="Ingresa tu contraseña"
                required
              />
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

    <!-- Modal Registro -->
    <div class="modal" v-show="showModal" @click.self="closeModal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2 class="tituloCrear">Crear Cuenta</h2><br />
        <form @submit.prevent="register">
          <div class="input-group">
            <label for="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              v-model="registro.nombre"
              placeholder="Ingresa tu nombre"
              required
            />
          </div>
          <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              v-model="registro.email"
              placeholder="Ingresa tu correo"
              required
            />
          </div>
          <div class="input-group">
            <label for="cedula-reg">Cédula</label>
            <input
              type="text"
              id="cedula-reg"
              v-model="registro.cedula"
              placeholder="Ingresa tu cédula"
              required
            />
          </div>
          <div class="input-group">
            <label for="password-reg">Contraseña</label>
            <input
              type="password"
              id="password-reg"
              v-model="registro.password"
              placeholder="Crea una contraseña"
              required
            />
          </div>
          <button type="submit" class="btn-login">Registrarse</button>
        </form>
      </div>
    </div>
  </div>
</template>
