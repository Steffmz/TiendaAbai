<template>
  <div class="product-card">
    <img :src="product.imagenUrl || 'https://via.placeholder.com/300'" :alt="product.nombre" class="product-image" />
    <div class="product-info">
      <span class="category">{{ product.categoria.nombre }}</span>
      <h3 class="product-name">{{ product.nombre }}</h3>
      <p class="product-points">{{ product.precioPuntos }} puntos</p>
      <button class="btn-redeem">Canjear</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: Object,
});
</script>

<style scoped>
.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: transform 0.2s;
  background-color: white;
}
.product-card:hover {
  transform: translateY(-5px);
}
.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.product-info {
  padding: 1rem;
}
.category {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
}
.product-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #333;
}
.product-points {
  color: var(--primary-color);
  font-weight: bold;
  margin-bottom: 1rem;
}
.btn-redeem {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--gold-color);
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
</style>