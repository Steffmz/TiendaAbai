<template>
  <div class="product-form-container">
    <h1>{{ isEditing ? 'Editar Producto' : 'Crear Nuevo Producto' }}</h1>
    <form @submit.prevent="guardarProducto" class="product-form">
      <div class="form-group">
        <label for="nombre">Nombre del Producto</label>
        <input type="text" id="nombre" v-model="producto.nombre" required />
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" v-model="producto.descripcion"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="precioPuntos">Precio en Puntos</label>
          <input type="number" id="precioPuntos" v-model.number="producto.precioPuntos" required min="0" />
        </div>
        <div class="form-group">
          <label for="stock">Stock Inicial</label>
          <input type="number" id="stock" v-model.number="producto.stock" required min="0" />
        </div>
      </div>

      <div class="form-group">
        <label for="categoria">Categoría</label>
        <select id="categoria" v-model.number="producto.categoriaId" required>
          <option disabled value="">Selecciona una categoría</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
            {{ cat.nombre }}
          </option>
        </select>
      </div>

      <button type="submit" class="btn-submit">{{ isEditing ? 'Actualizar Producto' : 'Guardar Producto' }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute(); // Para acceder a los parámetros de la ruta, como el ID

const categorias = ref([]);
const producto = ref({
  nombre: '',
  descripcion: '',
  precioPuntos: 0,
  stock: 0,
  categoriaId: ''
});

// Variable para saber si estamos en modo "Edición"
const isEditing = computed(() => !!route.params.id);

// Cargar las categorías para el dropdown (sin cambios)
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/categorias');
    categorias.value = response.data;
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }

  // Si estamos en modo edición, cargar los datos del producto
  if (isEditing.value) {
    try {
      const response = await axios.get(`http://localhost:3000/api/productos/${route.params.id}`);
      producto.value = response.data;
    } catch (error) {
      console.error("Error al cargar el producto para editar:", error);
      alert("No se pudo cargar el producto.");
    }
  }
});

const guardarProducto = async () => {
  const token = localStorage.getItem('authToken');
  try {
    if (isEditing.value) {
      // Si estamos editando, usamos el método PUT
      await axios.put(`http://localhost:3000/api/admin/productos/${route.params.id}`, producto.value, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('¡Producto actualizado con éxito!');
    } else {
      // Si no, usamos el método POST para crear
      await axios.post('http://localhost:3000/api/admin/productos', producto.value, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('¡Producto creado con éxito!');
    }
    router.push('/dashboard/productos'); // Redirige a la lista de productos
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    alert('Hubo un error al guardar el producto.');
  }
};
</script>

<style scoped>
.product-form-container {
  padding: 2rem;
  max-width: 800px;
  margin: auto;
}

.product-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #334155;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
}

textarea {
  min-height: 100px;
}

.btn-submit {
  background-color: #16a34a;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
</style>