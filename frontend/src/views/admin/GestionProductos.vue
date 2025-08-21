<template>
    <div class="management-container">
        <div class="header">
            <h1>Gestión de Productos</h1>
            <router-link to="/dashboard/productos/nuevo" class="btn-new">
                + Crear Nuevo Producto
            </router-link>
        </div>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio (Puntos)</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="producto in productos" :key="producto.id">
                    <td>{{ producto.id }}</td>
                    <td>{{ producto.nombre }}</td>
                    <td>{{ producto.categoria.nombre }}</td>
                    <td>{{ producto.precioPuntos }}</td>
                    <td>{{ producto.stock }}</td>
                    <td class="actions-cell">
                        <button @click="editarProducto(producto.id)" class="btn-edit">Editar</button>
                        <button @click="eliminarProducto(producto.id)" class="btn-delete">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const productos = ref([]);
const router = useRouter();

async function cargarProductos() {
    try {
        const response = await axios.get('http://localhost:3000/api/productos');
        productos.value = response.data;
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

function editarProducto(id) {
    alert(`Funcionalidad de editar para producto ID: ${id} pendiente.`);
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    const token = localStorage.getItem('authToken');
    try {
        await axios.delete(`http://localhost:3000/api/admin/productos/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Recargar la lista de productos para reflejar el cambio
        await cargarProductos();
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        alert('Hubo un error al eliminar el producto.');
    }
}

onMounted(cargarProductos);
</script>

<style scoped>
.management-container {
    padding: 2rem;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.btn-new {
    background-color: #16a34a;
    color: white;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
}

table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

th,
td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

thead th {
    background-color: #f8fafc;
}

.actions-cell {
    display: flex;
    gap: 0.5rem;
}

.btn-edit {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
}

.btn-delete {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
}
</style>