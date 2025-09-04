// frontend/src/composables/useCarrito.js

import { ref, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:3000/api/carrito';

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
});

// Estado reactivo del carrito (compartido en toda la app)
const carrito = ref([]);
const loading = ref(false);

export function useCarrito() {
  const totalItems = computed(() =>
    carrito.value.reduce((total, item) => total + item.cantidad, 0)
  );

  const totalPuntos = computed(() =>
    carrito.value.reduce((total, item) => total + item.producto.precioPuntos * item.cantidad, 0)
  );

  const fetchCarrito = async () => {
    loading.value = true;
    try {
      const { data } = await axios.get(API_URL, getAuthHeaders());
      carrito.value = data;
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
    } finally {
      loading.value = false;
    }
  };

  const agregarAlCarrito = async (productoId, cantidad = 1) => {
    try {
      const response = await axios.post(API_URL, { productoId, cantidad }, getAuthHeaders());
      await fetchCarrito(); // Recargar el carrito para tener los datos actualizados
      Swal.fire({
        icon: 'success',
        title: '¡Agregado!',
        text: response.data.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo agregar el producto.', 'error');
    }
  };

  const eliminarDelCarrito = async (productoId) => {
    try {
      const response = await axios.delete(`${API_URL}/${productoId}`, getAuthHeaders());
      await fetchCarrito();
      Swal.fire({
        icon: 'info',
        title: 'Eliminado',
        text: response.data.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar el producto.', 'error');
    }
  };
  
    const procesarCanje = async () => {
    if (carrito.value.length === 0) {
      Swal.fire('Carrito Vacío', 'Agrega productos a tu carrito antes de canjear.', 'info');
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar Canje?',
      html: `Se canjearán <strong>${totalItems.value} productos</strong> por un total de <strong>${totalPuntos.value} puntos</strong>.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, ¡canjear!',
      cancelButtonText: 'Cancelar',
    });

    if (isConfirmed) {
      loading.value = true;
      try {
        // Aquí puedes iterar y crear un pedido por cada item o ajustar el backend para recibir un array
        // Por simplicidad, vamos a crear un pedido por cada item del carrito.
        for (const item of carrito.value) {
          await axios.post('http://localhost:3000/api/pedidos', {
            productoId: item.productoId,
            cantidad: item.cantidad
          }, getAuthHeaders());
        }
        
        await fetchCarrito(); // El carrito debería estar vacío ahora
        Swal.fire('¡Canje Exitoso!', 'Tu pedido ha sido procesado y está pendiente de aprobación.', 'success');
        
      } catch (error) {
        Swal.fire('Error en el Canje', error.response?.data?.message || 'No se pudo procesar tu pedido.', 'error');
      } finally {
        loading.value = false;
      }
    }
  };

  return {
    carrito,
    loading,
    totalItems,
    totalPuntos,
    fetchCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    procesarCanje,
  };
}