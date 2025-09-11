<template>
  <div class="electro-background">
    <canvas id="magneticCanvas"></canvas>
  </div>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-right">
        <div class="login-card">
          <div class="logo-container">
            <img src="../../assets/img/abai-logo.png" alt="Logo Abai" class="logo-abai" />
          </div>
          <h2 class="title">Reestablecer Contraseña</h2>

          <div v-if="message" class="success-message">
            <p>{{ message }}</p>
            <router-link to="/login" class="back-link">Ir a inicio de sesión</router-link>
          </div>
          
          <form v-else @submit.prevent="resetPassword">
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
            
            <div class="input-group">
              <label for="password">Nueva Contraseña</label>
              <input type="password" id="password" v-model="password" required />
            </div>
            
            <div class="input-group">
              <label for="confirmPassword">Confirmar Nueva Contraseña</label>
              <input type="password" id="confirmPassword" v-model="confirmPassword" required />
            </div>
            
            <button type="submit" class="btn-login" :disabled="loading">
              {{ loading ? 'Actualizando...' : 'Actualizar Contraseña' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const message = ref('');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  
  try {
    const token = route.params.token;
    const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
      contrasena: password.value,
    });
    
    message.value = response.data.message;
    Swal.fire('¡Éxito!', 'Tu contraseña ha sido actualizada.', 'success').then(() => {
        router.push('/login');
    });

  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Ocurrió un error.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import './Login.css';

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