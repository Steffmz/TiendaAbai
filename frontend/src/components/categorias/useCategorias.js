import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { PAGINATION } from "../../config";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/categorias`;

// Helper for authentication headers
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return { headers };
};

export default function useCategorias() {
  const categorias = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const mostrarModal = ref(false);
  const editando = ref(false);
  const filtro = ref("");
  const paginaActual = ref(1);
  const categoriasPorPagina = PAGINATION.CATEGORIES;
  const previewImage = ref(null);

  // --- MODIFICADO ---
  // Se eliminó 'descripcion' del formulario
  const form = ref({
    id: null,
    nombre: "",
    imagen: null,
  });

  const placeholder = "/img/no-image.png";

  // Pagination and filtering logic
  const categoriasFiltradas = computed(() => {
    if (!filtro.value) return categorias.value;
    return categorias.value.filter((cat) =>
      cat.nombre.toLowerCase().includes(filtro.value.toLowerCase())
    );
  });

  const totalCategorias = computed(() => categoriasFiltradas.value.length);
  const totalPaginas = computed(() =>
    Math.ceil(totalCategorias.value / categoriasPorPagina)
  );

  const categoriasPaginadas = computed(() => {
    const inicio = (paginaActual.value - 1) * categoriasPorPagina;
    return categoriasFiltradas.value.slice(
      inicio,
      inicio + categoriasPorPagina
    );
  });

  const paginasVisibles = computed(() => {
    const total = totalPaginas.value;
    const actual = paginaActual.value;
    const rango = 1;

    if (total <= 7) {
      const paginas = [];
      for (let i = 1; i <= total; i++) paginas.push(i);
      return paginas;
    }

    const paginas = [1];
    if (actual > rango + 2) paginas.push('...');
    for (let i = Math.max(2, actual - rango); i <= Math.min(total - 1, actual + rango); i++) {
      paginas.push(i);
    }
    if (actual < total - rango - 1) paginas.push('...');
    paginas.push(total);

    return paginas;
  });

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas.value)
      paginaActual.value = pagina;
  };
  const paginaAnterior = () => {
    if (paginaActual.value > 1) paginaActual.value--;
  };
  const paginaSiguiente = () => {
    if (paginaActual.value < totalPaginas.value) paginaActual.value++;
  };

  // API calls with Axios and authentication
  const obtenerCategorias = async () => {
    loading.value = true;
    try {
      const { data } = await axios.get(API_URL, getAuthHeaders());
      categorias.value = data;
    } catch (err) {
      error.value = err.response?.data?.error || "Error loading categories";
      Swal.fire("Error", error.value, "error");
    } finally {
      loading.value = false;
    }
  };

  const guardarCategoria = async () => {
    if (!form.value.nombre.trim()) {
      return Swal.fire("Attention", "Category name is required.", "warning");
    }

    const formData = new FormData();
    formData.append("nombre", form.value.nombre.trim());
    // --- MODIFICADO ---
    // Se eliminó la línea que añadía 'descripcion'
    if (form.value.imagen) {
      formData.append("imagen", form.value.imagen);
    }

    try {
      if (editando.value) {
        await axios.put(
          `${API_URL}/${form.value.id}`,
          formData,
          getAuthHeaders(true)
        );
      } else {
        await axios.post(API_URL, formData, getAuthHeaders(true));
      }

      await obtenerCategorias();
      cerrarModal();
      Swal.fire(
        "Success",
        `Category ${editando.value ? "updated" : "created"} successfully.`,
        "success"
      );
    } catch (err) {
      error.value = err.response?.data?.error || "Could not save the category.";
      Swal.fire("Error", error.value, "error");
    }
  };

  const confirmarEliminar = async (categoria) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `The category "${categoria.nombre}" will be deleted. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${categoria.id}`, getAuthHeaders());
        Swal.fire("Deleted!", "The category has been deleted.", "success");
        await obtenerCategorias();
      } catch (err) {
        error.value =
          err.response?.data?.error || "Could not delete the category.";
        Swal.fire("Error", error.value, "error");
      }
    }
  };

  const cambioEstado = async (categoria) => {
    try {
      await axios.patch(
        `${API_URL}/${categoria.id}/estado`,
        {},
        getAuthHeaders()
      );
      const index = categorias.value.findIndex((c) => c.id === categoria.id);
      if (index !== -1) {
        categorias.value[index].activo = !categorias.value[index].activo;
      }
    } catch (err) {
      Swal.fire("Error", "Could not change the status.", "error");
      await obtenerCategorias();
    }
  };

  // Modal control
  const limpiarFormulario = () => {
    // --- MODIFICADO ---
    // Se eliminó 'descripcion' del formulario
    form.value = { id: null, nombre: "", imagen: null };
    previewImage.value = null;
  };

  const abrirModalNueva = () => {
    limpiarFormulario();
    editando.value = false;
    mostrarModal.value = true;
  };

  const abrirModalEditar = (categoria) => {
    editando.value = true;
    // --- MODIFICADO ---
    // Se eliminó 'descripcion' del formulario
    form.value = {
      id: categoria.id,
      nombre: categoria.nombre,
      imagen: null,
    };
    previewImage.value = categoria.imagenUrl
      ? `${import.meta.env.VITE_API_BASE_URL}${categoria.imagenUrl}`
      : null;
    mostrarModal.value = true;
  };

  const cerrarModal = () => {
    mostrarModal.value = false;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return Swal.fire("Error", "Please select an image file.", "error");
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      return Swal.fire(
        "Error",
        "The image cannot be larger than 5MB.",
        "error"
      );
    }

    form.value.imagen = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  onMounted(obtenerCategorias);

  return {
    categorias,
    loading,
    error,
    mostrarModal,
    editando,
    filtro,
    form,
    previewImage,
    placeholder,
    categoriasPaginadas,
    totalCategorias,
    totalPaginas,
    paginaActual,
    paginasVisibles,
    guardarCategoria,
    confirmarEliminar,
    cambioEstado,
    abrirModalNueva,
    abrirModalEditar,
    cerrarModal,
    handleImageUpload,
    irAPagina,
    paginaAnterior,
    paginaSiguiente,
  };
}