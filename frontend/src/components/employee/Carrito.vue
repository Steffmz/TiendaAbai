<template>
  <div class="cart-container max-w-7xl w-full mx-auto">
    <div class="page-header">
      <h1 class="page-title">Mi Carrito de Canjes</h1>
      <p class="page-subtitle">Revisa tus productos y confirma el canje de tus puntos.</p>
    </div>

    <div v-if="loading" class="text-center">Cargando carrito...</div>
    <div v-else-if="carrito.length === 0" class="empty-cart">
      <p>Tu carrito está vacío.</p>
      <router-link to="/tienda" class="btn-primary">Explorar productos</router-link>
    </div>
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in carrito" :key="item.id" class="cart-item">
          <img :src="`${API_BASE_URL}${item.producto.imagenUrl}`" :alt="item.producto.nombre" class="item-image" />
          <div class="item-details">
            <h3 class="item-name">{{ item.producto.nombre }}</h3>
            <p class="item-points">{{ item.producto.precioPuntos }} puntos c/u</p>
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
        <button @click="handleProcesarCanje" class="btn-checkout">Confirmar Canje</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// En <script setup> de Carrito.vue
import { onMounted, defineEmits } from 'vue';
import { useCartStore } from '../../stores/cartStore';
import { storeToRefs } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const emit = defineEmits(['redemption-successful']);

// Instanciamos el store
const cartStore = useCartStore();

// Usamos storeToRefs para mantener la reactividad al desestructurar
const { items: carrito, loading, totalItems, totalPuntos } = storeToRefs(cartStore);
const { eliminarDelCarrito, procesarCanje, fetchCarrito } = cartStore;

const handleProcesarCanje = async () => {
  const exito = await procesarCanje();
  if (exito) {
    emit('redemption-successful');
  }
};

onMounted(fetchCarrito);
</script>

<style scoped>
.cart-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
}

.page-subtitle {
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: flex-start; /* Alinea los items al inicio */
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  text-align: left;
}
.item-name { font-weight: 600; }
.item-points { font-size: 0.9rem; color: var(--text-muted); }

.item-quantity,
.item-total {
  font-weight: 500;
  text-align: right;
}

.btn-remove {
  background: transparent;
  color: var(--danger);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.cart-summary {
  background: var(--surface);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  position: sticky; /* Se mantiene visible al hacer scroll */
  top: 100px; /* 80px de la topbar + 20px de margen */
}

.cart-summary h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
.summary-row, .summary-total { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
.summary-total { font-weight: bold; font-size: 1.1rem; border-top: 1px solid var(--border); padding-top: 0.75rem; }

.btn-checkout {
  width: 100%;
  padding: 0.8rem;
  background-color: var(--primary);
  color: var(--primary-contrast);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
}

/* --- Responsive --- */
@media (max-width: 900px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .cart-item {
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
  }
  .item-total {
    grid-column: 2 / span 2;
    text-align: right;
    margin-top: -0.5rem;
  }
  .item-quantity {
    display: none; /* Ocultamos la cantidad para simplificar */
  }
}
</style>