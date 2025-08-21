<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const token = localStorage.getItem('authToken');
let adminId = null;
if (token) {
  try {
    const dec = jwtDecode(token);
    adminId = dec.id;
  } catch (e) {
    console.error('Token inválido');
  }
}

const pedidos = ref([]);

const cargar = async () => {
  const res = await axios.get(`${baseUrl}/api/pedidos`);
  pedidos.value = res.data;
};

const aprobar = async (pedido) => {
  await axios.put(`${baseUrl}/api/pedidos/${pedido.id}/aprobar`, { adminId });
  await cargar();
};

onMounted(cargar);
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Pedidos</h1>
    <div v-for="p in pedidos" :key="p.id" class="border p-2 mb-2">
      <div>ID: {{ p.id }} - Estado: {{ p.estado }}</div>
      <ul class="ml-4 list-disc">
        <li v-for="d in p.detalles" :key="d.id">{{ d.producto?.nombre }} x {{ d.cantidad }}</li>
      </ul>
      <button v-if="p.estado !== 'Aprobado'" @click="aprobar(p)" class="mt-2 bg-green-500 text-white px-2 py-1">Aprobar</button>
    </div>
  </div>
</template>

