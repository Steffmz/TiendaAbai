<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const token = localStorage.getItem('authToken');
let userId = null;
if (token) {
  try {
    const dec = jwtDecode(token);
    userId = dec.id;
  } catch (e) {
    console.error('Token inválido');
  }
}

const items = ref([]);
const cantidades = ref({});

const cargar = async () => {
  if (!userId) return;
  const res = await axios.get(`${baseUrl}/api/carrito/${userId}`);
  items.value = res.data;
  cantidades.value = Object.fromEntries(res.data.map(i => [i.id, i.cantidad]));
};

const actualizar = async (item) => {
  await axios.put(`${baseUrl}/api/carrito/${item.id}`, { cantidad: cantidades.value[item.id] });
  await cargar();
};

const eliminar = async (item) => {
  await axios.delete(`${baseUrl}/api/carrito/${item.id}`);
  await cargar();
};

const crearPedido = async () => {
  const detalles = items.value.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }));
  if (detalles.length === 0) return;
  await axios.post(`${baseUrl}/api/pedidos`, { usuarioId: userId, detalles });
  await cargar();
};

onMounted(cargar);
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Carrito</h1>
    <div v-if="items.length === 0">No hay productos en el carrito.</div>
    <div v-for="item in items" :key="item.id" class="flex items-center gap-2 mb-2">
      <span class="flex-1">{{ item.producto?.nombre }}</span>
      <input type="number" min="1" v-model.number="cantidades[item.id]" class="border w-16" />
      <button @click="actualizar(item)" class="bg-blue-500 text-white px-2 py-1">Actualizar</button>
      <button @click="eliminar(item)" class="bg-red-500 text-white px-2 py-1">Eliminar</button>
    </div>
    <button @click="crearPedido" class="mt-4 bg-green-500 text-white px-4 py-2" :disabled="items.length === 0">
      Crear Pedido
    </button>
  </div>
</template>

