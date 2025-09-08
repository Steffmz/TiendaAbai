import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { PAGINATION } from "../../config";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/campanas`;
const API_PRODUCTOS = `${import.meta.env.VITE_API_BASE_URL}/api/productos`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

export default function useCampana() {
  const filtro = ref("");
  const placeholder = "/img/no-image.png";
  const modalAbierto = ref(false);

  const modalSeleccionProductos = ref(false);
  const modalVerProductos = ref(false);

  const editando = ref(false);
  const mostrarDescripcion = ref(null);
  const previewImage = ref(null);

  const campanas = ref([]);
  const productos = ref([]);
  const productosSeleccionados = ref([]);

  const campanaActual = ref(null);

  // Paginación
  const paginaActual = ref(1);
  const elementosPorPagina = PAGINATION.CAMPAIGNS;;
  const totalPaginas = computed(() =>
    Math.ceil(campanasFiltradas.value.length / elementosPorPagina)
  );

const paginasVisibles = computed(() => {
    const total = totalPaginas.value;
    const actual = paginaActual.value;
    const rango = 1; // Cuántas páginas mostrar a cada lado de la actual
    const paginas = [];

    if (total <= 7) { // Si hay 7 o menos páginas, muéstralas todas
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
      return paginas;
    }

    // Lógica para muchas páginas
    paginas.push(1);
    if (actual > rango + 2) {
      paginas.push('...');
    }
    for (let i = Math.max(2, actual - rango); i <= Math.min(total - 1, actual + rango); i++) {
      paginas.push(i);
    }
    if (actual < total - rango - 1) {
      paginas.push('...');
    }
    paginas.push(total);

    return paginas;
  });

  const totalCampanas = computed(() => campanas.value.length);

  const paginaAnterior = () => {
    if (paginaActual.value > 1) paginaActual.value--;
  };
  const paginaSiguiente = () => {
    if (paginaActual.value < totalPaginas.value) paginaActual.value++;
  };
  const irAPagina = (pagina) => {
    paginaActual.value = pagina;
  };

  const campanasFiltradas = computed(() =>
    campanas.value.filter((c) =>
      c.titulo.toLowerCase().includes(filtro.value.toLowerCase())
    )
  );

  // Paginadas
  const campanasPaginadas = computed(() => {
    const inicio = (paginaActual.value - 1) * elementosPorPagina;
    return campanasFiltradas.value.slice(inicio, inicio + elementosPorPagina);
  });

  // Formulario
  const formulario = ref({
    id: null,
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    aprobada: false,
    puntos: null,
    descuento: null,
    imagen: null,
  });

  // Cargar campañas
  const cargarCampanas = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = token
      ? await axios.get(API_URL, getAuthHeaders())
      : await axios.get(API_URL);
    campanas.value = response.data;
  } catch (err) {
    console.error("Error cargando campañas:", err);
  }
};

  // Cargar productos
  const cargarProductos = async () => {
    try {
      // 3. AÑADE getAuthHeaders() A LA PETICIÓN
      const { data } = await axios.get(API_PRODUCTOS, getAuthHeaders());
      productos.value = data;
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  onMounted(() => {
    cargarCampanas();
    cargarProductos();
  });

  // Guardar campaña
  const guardarCampana = async () => {
    if (
      !formulario.value.titulo ||
      !formulario.value.fechaInicio ||
      !formulario.value.fechaFin
    ) {
      Swal.fire(
        "Error",
        "Título, fecha de inicio y fecha de fin son obligatorios",
        "error"
      );
      return;
    }

    const fechaInicioValida = /^\d{4}-\d{2}-\d{2}$/.test(
      formulario.value.fechaInicio
    );
    const fechaFinValida = /^\d{4}-\d{2}-\d{2}$/.test(
      formulario.value.fechaFin
    );
    if (!fechaInicioValida || !fechaFinValida) {
      Swal.fire("Error", "Las fechas deben tener formato YYYY-MM-DD", "error");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("titulo", formulario.value.titulo);
      formData.append("descripcion", formulario.value.descripcion);
      formData.append("fechaInicio", formulario.value.fechaInicio);
      formData.append("fechaFin", formulario.value.fechaFin);
      formData.append("aprobada", formulario.value.aprobada);
      formData.append("puntos", formulario.value.puntos);
      formData.append("descuento", formulario.value.descuento);
      if (formulario.value.imagen) {
        formData.append("imagen", formulario.value.imagen);
      }

      if (productosSeleccionados.value.length > 0) {
        const ids = productosSeleccionados.value.map((p) => p.id);
        formData.append("productosIds", JSON.stringify(ids));
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      };

      if (editando.value) {
        await axios.put(`${API_URL}/${formulario.value.id}`, formData, config);
      } else {
        await axios.post(API_URL, formData, config);
      }

      await cargarCampanas();
      cerrarModal();
      Swal.fire(
        "Éxito",
        editando.value
          ? "Campaña actualizada exitosamente"
          : "Campaña creada exitosamente",
        "success"
      );
    } catch (err) {
      console.error("Error guardando campaña:", err);
      Swal.fire("Error", "No se pudo guardar la campaña", "error");
    }
  };

  // Eliminar Campaña
  const eliminarCampana = async (campana) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará la campaña "${campana.titulo}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/${campana.id}`, getAuthHeaders());
      await cargarCampanas();
      Swal.fire(
        "Eliminado",
        "La campaña fue eliminada correctamente",
        "success"
      );
    } catch (err) {
      console.error("Error eliminando campaña:", err);
      Swal.fire("Error", "No se pudo eliminar la campaña", "error");
    }
  };

  const confirmarEliminar = (campana) => {
    eliminarCampana(campana);
  };

  // Subida de imagen
  const manejarSubidaImagen = (event) => {
    const file = event.target.files[0];
    if (file) {
      formulario.value.imagen = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Abrir modal nueva
  const abrirModalNueva = () => {
    editando.value = false;
    formulario.value = {
      id: null,
      titulo: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      aprobada: false,
      puntos: null,
      descuento: null,
      imagen: null,
    };
    productosSeleccionados.value = [];
    previewImage.value = null;
    modalAbierto.value = true;
  };

  const abrirModalEditar = (campana) => {
    editando.value = true;
    const fechaInicioFormateada = new Date(campana.fechaInicio)
      .toISOString()
      .split("T")[0];
    const fechaFinFormateada = new Date(campana.fechaFin)
      .toISOString()
      .split("T")[0];

    formulario.value = {
      ...campana,
      imagen: null,
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada,
    };
    previewImage.value = campana.imagenUrl
      ? `http://localhost:3000${campana.imagenUrl}`
      : null;
    productosSeleccionados.value = campana.productos || [];
    modalAbierto.value = true;
  };

  const abrirModalVerProductos = (campana) => {
    campanaActual.value = campana;
    modalVerProductos.value = true;
  };

  const cerrarModal = () => {
    modalAbierto.value = false;
  };

  const isProductoSeleccionado = (producto) => {
    return productosSeleccionados.value.some((p) => p.id === producto.id);
  };

  // Function to handle product selection
  const toggleProductoSeleccionado = (producto) => {
    const index = productosSeleccionados.value.findIndex(
      (p) => p.id === producto.id
    );
    if (index === -1) {
      productosSeleccionados.value.push(producto); // Add product
    } else {
      productosSeleccionados.value.splice(index, 1); // Remove product
    }
  };

  return {
    filtro,
    placeholder,
    modalAbierto,
    modalSeleccionProductos,
    modalVerProductos,
    editando,
    previewImage,
    mostrarDescripcion,
    campanaActual,
    campanas,
    campanasPaginadas,
    formulario,
    productos,
    productosSeleccionados,
    abrirModalNueva,
    abrirModalEditar,
    abrirModalVerProductos,
    cerrarModal,
    guardarCampana,
    confirmarEliminar,
    manejarSubidaImagen,
    cargarCampanas,
    paginaActual,
    totalPaginas,
    paginasVisibles,
    paginaAnterior,
    paginaSiguiente,
    irAPagina,
    totalCampanas,
    isProductoSeleccionado,
    toggleProductoSeleccionado,
  };
}
