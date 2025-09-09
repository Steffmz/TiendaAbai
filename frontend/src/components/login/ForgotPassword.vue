<template>
  <div class="electro-background">
    <canvas id="magneticCanvas"></canvas>
  </div>
  <div class="page-container">
    <div class="login-wrapper">
      <div class="login-right">
        <div class="login-card">
          <div class="logo-container">
            <img src="../../assets/img/abai-logo.png" alt="Logo Abai" class="logo-abai" />
          </div>
          <h2 class="title">Recuperar Contraseña</h2>
          
          <div v-if="message" class="success-message">
            <p>{{ message }}</p>
            <router-link to="/login" class="back-link">Volver a inicio de sesión</router-link>
          </div>

          <form v-else @submit.prevent="requestReset">
            <p class="info-text">Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para reestablecer tu contraseña.</p>
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

            <div class="input-group">
              <label for="email">Correo Electrónico</label>
              <input type="email" id="email" v-model="email" placeholder="tu.correo@ejemplo.com" required />
            </div>
            
            <button type="submit" class="btn-login" :disabled="loading">
              {{ loading ? 'Enviando...' : 'Enviar Enlace' }}
            </button>
            <router-link to="/login" class="forgot-link mt-4">Volver a inicio de sesión</router-link>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
const message = ref('');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const requestReset = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email: email.value });
    message.value = response.data.message;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Ocurrió un error. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Usamos los mismos estilos del login para consistencia */
@import './Login.css';

.info-text {
  margin-bottom: 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.success-message {
  padding: 1rem;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  text-align: center;
}

.back-link {
  display: block;
  margin-top: 1rem;
  color: #1e40af;
  font-weight: 500;
}
</style>