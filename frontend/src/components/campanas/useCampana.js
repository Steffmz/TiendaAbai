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
  const paginaActual = ref(1);
  const elementosPorPagina = PAGINATION.CAMPAIGNS;
  const totalPaginas = computed(() => Math.ceil(campanasFiltradas.value.length / elementosPorPagina));

  const paginasVisibles = computed(() => {
    const total = totalPaginas.value;
    const actual = paginaActual.value;
    const rango = 1;
    const paginas = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) paginas.push(i);
      return paginas;
    }

    paginas.push(1);
    if (actual > rango + 2) paginas.push("...");
    for (let i = Math.max(2, actual - rango); i <= Math.min(total - 1, actual + rango); i++) {
      paginas.push(i);
    }
    if (actual < total - rango - 1) paginas.push("...");
    paginas.push(total);

    return paginas;
  });

  const totalCampanas = computed(() => campanas.value.length);
  const paginaAnterior = () => { if (paginaActual.value > 1) paginaActual.value--; };
  const paginaSiguiente = () => { if (paginaActual.value < totalPaginas.value) paginaActual.value++; };
  const irAPagina = (pagina) => { paginaActual.value = pagina; };

  const campanasFiltradas = computed(() => campanas.value.filter((c) => c.titulo.toLowerCase().includes(filtro.value.toLowerCase())));
  const campanasPaginadas = computed(() => {
    const inicio = (paginaActual.value - 1) * elementosPorPagina;
    return campanasFiltradas.value.slice(inicio, inicio + elementosPorPagina);
  });

  const formulario = ref({
    id: null,
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    aprobada: false,
    imagen: null,
  });

  const cargarCampanas = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      campanas.value = response.data;
    } catch (err) {
      console.error("Error cargando campañas:", err);
    }
  };

  const cargarProductos = async () => {
    try {
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

  const guardarCampana = async () => {
    if (!formulario.value.titulo || !formulario.value.fechaInicio || !formulario.value.fechaFin) {
      Swal.fire("Datos Incompletos", "El título y las fechas son obligatorios.", "warning");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("titulo", formulario.value.titulo);
      formData.append("descripcion", formulario.value.descripcion);
      formData.append("fechaInicio", formulario.value.fechaInicio);
      formData.append("fechaFin", formulario.value.fechaFin);
      formData.append("aprobada", formulario.value.aprobada);
      if (formulario.value.imagen) formData.append("imagen", formulario.value.imagen);
      if (productosSeleccionados.value.length > 0) {
        const ids = productosSeleccionados.value.map((p) => p.id);
        formData.append("productosIds", JSON.stringify(ids));
      }

      const config = { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("authToken")}` } };

      if (editando.value) {
        await axios.put(`${API_URL}/${formulario.value.id}`, formData, config);
      } else {
        await axios.post(API_URL, formData, config);
      }

      await cargarCampanas();
      cerrarModal();
      Swal.fire("¡Éxito!", `La campaña ha sido ${editando.value ? "actualizada" : "creada"}.`, "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar la campaña.", "error");
    }
  };

  const toggleEstado = async (campana) => {
    const accion = campana.aprobada ? 'desactivar' : 'activar';
    const result = await Swal.fire({
      title: `¿Confirmas que quieres ${accion} la campaña?`,
      text: `La campaña "${campana.titulo}" cambiará su estado.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`${API_URL}/${campana.id}/toggle-estado`, {}, getAuthHeaders());
        await cargarCampanas();
        Swal.fire('¡Éxito!', `La campaña ha sido ${accion === 'activar' ? 'activada' : 'desactivada'}.`, 'success');
      } catch (err) {
        Swal.fire('Error', `No se pudo ${accion} la campaña.`, 'error');
      }
    }
  };

  const manejarSubidaImagen = (event) => {
    const file = event.target.files[0];
    if (file) {
      formulario.value.imagen = file;
      previewImage.value = URL.createObjectURL(file);
    }
  };

  const abrirModalNueva = () => {
    editando.value = false;
    formulario.value = { id: null, titulo: "", descripcion: "", fechaInicio: "", fechaFin: "", aprobada: false, imagen: null };
    productosSeleccionados.value = [];
    previewImage.value = null;
    modalAbierto.value = true;
  };

  const abrirModalEditar = (campana) => {
    editando.value = true;
    formulario.value = {
      ...campana,
      imagen: null,
      fechaInicio: new Date(campana.fechaInicio).toISOString().split("T")[0],
      fechaFin: new Date(campana.fechaFin).toISOString().split("T")[0],
    };
    previewImage.value = campana.imagenUrl ? `http://localhost:3000${campana.imagenUrl}` : null;
    productosSeleccionados.value = campana.productos || [];
    modalAbierto.value = true;
  };
  
  const abrirModalVerProductos = (campana) => { campanaActual.value = campana; modalVerProductos.value = true; };
  const cerrarModal = () => { modalAbierto.value = false; };
  const isProductoSeleccionado = (producto) => productosSeleccionados.value.some((p) => p.id === producto.id);
  const toggleProductoSeleccionado = (producto) => {
    const index = productosSeleccionados.value.findIndex((p) => p.id === producto.id);
    if (index === -1) {
      productosSeleccionados.value.push(producto);
    } else {
      productosSeleccionados.value.splice(index, 1);
    }
  };

  return {
    filtro, placeholder, modalAbierto, modalSeleccionProductos, modalVerProductos, editando,
    previewImage, mostrarDescripcion, campanaActual, campanas, campanasPaginadas, formulario,
    productos, productosSeleccionados, abrirModalNueva, abrirModalEditar, abrirModalVerProductos,
    cerrarModal, guardarCampana, manejarSubidaImagen, cargarCampanas, paginaActual, totalPaginas,
    paginasVisibles, paginaAnterior, paginaSiguiente, irAPagina, totalCampanas,
    isProductoSeleccionado, toggleProductoSeleccionado,
    toggleEstado,
  };
}