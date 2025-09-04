<template>
  <div class="cart-container">
    <h1>Mi Carrito de Canjes</h1>
    <div v-if="loading" class="text-center">Cargando carrito...</div>
    <div v-else-if="carrito.length === 0" class="empty-cart">
      <p>Tu carrito está vacío.</p>
      <router-link to="/tienda" class="btn-primary">Explorar productos</router-link>
    </div>
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in carrito" :key="item.id" class="cart-item">
          <img :src="`http://localhost:3000${item.producto.imagenUrl}`" :alt="item.producto.nombre" class="item-image"/>
          <div class="item-details">
            <h3>{{ item.producto.nombre }}</h3>
            <p>{{ item.producto.precioPuntos }} puntos</p>
          </div>
          <div class="item-quantity">
            <span>Cantidad: {{ item.cantidad }}</span>
          </div>
          <div class="item-total">
            <p>{{ item.producto.precioPuntos * item.cantidad }} puntos</p>
          </div>
          <button @click="eliminarDelCarrito(item.producto.id)" class="btn-remove">&times;</button>
        </div>
      </div>
      <div class="cart-summary">
        <h2>Resumen del Canje</h2>
        <div class="summary-row">
          <span>Total de productos:</span>
          <span>{{ totalItems }}</span>
        </div>
        <div class="summary-total">
          <span>Total en puntos:</span>
          <span>{{ totalPuntos }}</span>
        </div>
        <button @click="procesarCanje" class="btn-checkout">Confirmar Canje</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCarrito } from '../../composables/useCarrito';
import { useRouter } from 'vue-router';

const router = useRouter();
const {
  carrito,
  loading,
  totalItems,
  totalPuntos,
  fetchCarrito,
  eliminarDelCarrito,
  procesarCanje,
} = useCarrito();

onMounted(fetchCarrito);
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
}
h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
}
.cart-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
.item-details { flex-grow: 1; }
.btn-remove {
    background: #ef4444;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
}
.cart-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
}
.btn-checkout {
  width: 100%;
  padding: 1rem;
  background-color: #2b7fff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}
</style>