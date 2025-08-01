<template>
  <div class="catalog-container">
    <h1>Nuestro Catálogo</h1>
    <div v-if="products.length > 0" class="product-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
    <div v-else>
        <p>Cargando productos...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ProductCard from '../components/ProductCard.vue';

const products = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/productos');
    products.value = response.data;
  } catch (error) {
    console.error("Error al cargar el catálogo:", error);
  }
});
</script>

<style scoped>
.catalog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Quicksand", sans-serif;
}
h1 {
    color: #333;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
</style>