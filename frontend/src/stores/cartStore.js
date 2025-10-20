import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/carrito`;
const PEDIDOS_URL = `${import.meta.env.VITE_API_BASE_URL}/api/pedidos`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

export const useCartStore = defineStore("cart", () => {
  const items = ref([]);
  const loading = ref(false);

  const totalItems = computed(() =>
    items.value.reduce((total, item) => total + item.cantidad, 0)
  );
  const totalPuntos = computed(() =>
    items.value.reduce(
      (total, item) => total + item.producto.precioPuntos * item.cantidad,
      0
    )
  );

  async function fetchCarrito() {
    loading.value = true;
    try {
      const { data } = await axios.get(API_URL, getAuthHeaders());
      items.value = data;
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
    } finally {
      loading.value = false;
    }
  }

  async function agregarAlCarrito(productoId, event, cantidad = 1) {
    if (event) {
      const button = event.currentTarget;
      const productCard = button.closest(".product-card, .bg-white");
      const productImage = productCard
        ? productCard.querySelector("img")
        : null;
      const cartIcon = document.getElementById("cart-icon");

      if (productImage && cartIcon) {
        const imgClone = productImage.cloneNode(true);
        imgClone.classList.add("fly-to-cart-clone");
        document.body.appendChild(imgClone);
        const startRect = productImage.getBoundingClientRect();
        const endRect = cartIcon.getBoundingClientRect();
        imgClone.style.left = `${startRect.left}px`;
        imgClone.style.top = `${startRect.top}px`;
        imgClone.style.width = `${startRect.width}px`;
        imgClone.style.height = `${startRect.height}px`;
        imgClone.getBoundingClientRect(); 
        imgClone.style.left = `${endRect.left + endRect.width / 2}px`;
        imgClone.style.top = `${endRect.top + endRect.height / 2}px`;
        imgClone.style.width = "0px";
        imgClone.style.height = "0px";
        imgClone.style.opacity = "0";
        setTimeout(() => imgClone.remove(), 1000);
      }
    }

    try {
      const response = await axios.post(
        API_URL,
        { productoId, cantidad },
        getAuthHeaders()
      );
      await fetchCarrito(); 
      Swal.fire({
        icon: "success",
        title: "¡Agregado!",
        text: response.data.message,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "No se pudo agregar el producto. Intenta de nuevo.",
        "error"
      );
    }
  }

  async function eliminarDelCarrito(productoId) {
    try {
      const response = await axios.delete(
        `${API_URL}/${productoId}`,
        getAuthHeaders()
      );
      await fetchCarrito();
      Swal.fire({
        icon: "info",
        title: "Eliminado",
        text: response.data.message,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "No se pudo eliminar el producto del carrito.",
        "error"
      );
    }
  }

  async function procesarCanje() {
    if (items.value.length === 0) {
      Swal.fire("Carrito Vacío", "Agrega productos antes de canjear.", "info");
      return false;
    }
    const { isConfirmed } = await Swal.fire({
      title: "¿Confirmar Canje?",
      html: `Se canjearán <strong>${totalItems.value} productos</strong> por <strong>${totalPuntos.value} puntos</strong>.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, ¡canjear!",
      cancelButtonText: "Cancelar",
    });

    if (isConfirmed) {
      loading.value = true;
      try {
        await axios.post(`${PEDIDOS_URL}/desde-carrito`, {}, getAuthHeaders());
        await fetchCarrito();
        Swal.fire("¡Canje Exitoso!", "Tu pedido ha sido procesado.", "success");
        return true;
      } catch (error) {
        Swal.fire(
          "Error en el Canje",
          error.response?.data?.message || "No se pudo procesar tu pedido.",
          "error"
        );
        return false;
      } finally {
        loading.value = false;
      }
    }
    return false;
  }

  return {
    items,
    loading,
    totalItems,
    totalPuntos,
    fetchCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    procesarCanje,
  };
});
