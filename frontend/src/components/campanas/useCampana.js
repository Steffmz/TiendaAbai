import { ref, computed, onMounted } from 'vue'
import api from '../../api/client'
import Swal from 'sweetalert2'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_URL = `/api/campanas`
const API_PRODUCTOS = `/api/productos`

export default function useCampana() {
  const filtro = ref('')
  const placeholder = '/img/no-image.png'
  const modalAbierto = ref(false)


  const modalSeleccionProductos = ref(false) 
  const modalVerProductos = ref(false) 

  const editando = ref(false)
  const mostrarDescripcion = ref(null)
  const previewImage = ref(null)

  const campanas = ref([])
  const productos = ref([])
  const productosSeleccionados = ref([])

  const campanaActual = ref(null) 

  // Paginación
  const paginaActual = ref(1)
  const elementosPorPagina = 6
  const totalPaginas = computed(() =>
    Math.ceil(campanasFiltradas.value.length / elementosPorPagina)
  )

  const paginasVisibles = computed(() => {
  if (totalPaginas.value === 0) return [1]

  const tamañoBloque = 5
  const bloqueActual = Math.floor((paginaActual.value - 1) / tamañoBloque)

  const inicio = bloqueActual * tamañoBloque + 1
  const fin = Math.min(inicio + tamañoBloque - 1, totalPaginas.value)

  return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i)
})


  const totalCampanas = computed(() => campanas.value.length)

  const paginaAnterior = () => {
    if (paginaActual.value > 1) paginaActual.value--
  }
  const paginaSiguiente = () => {
    if (paginaActual.value < totalPaginas.value) paginaActual.value++
  }
  const irAPagina = (pagina) => {
    paginaActual.value = pagina
  }

  const campanasFiltradas = computed(() =>
    campanas.value.filter(c =>
      c.titulo.toLowerCase().includes(filtro.value.toLowerCase())
    )
  )

  // Paginadas
  const campanasPaginadas = computed(() => {
    const inicio = (paginaActual.value - 1) * elementosPorPagina
    return campanasFiltradas.value.slice(inicio, inicio + elementosPorPagina)
  })

  // Formulario
  const formulario = ref({
    id: null,
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    aprobada: false,
    puntos: null,
    descuento: null,
    imagen: null
  })

  // Cargar campañas
  const cargarCampanas = async () => {
    try {
      const { data } = await api.get(API_URL)
      campanas.value = data
    } catch (err) {
      console.error('Error cargando campañas:', err)
    }
  }

  // Cargar productos
  const cargarProductos = async () => {
    try {
      const { data } = await api.get(API_PRODUCTOS)
      productos.value = data
    } catch (err) {
      console.error('Error cargando productos:', err)
    }
  }

  onMounted(() => {
    cargarCampanas()
    cargarProductos()
  })

  // Guardar campaña
  const guardarCampana = async () => {
    if (
      !formulario.value.titulo ||
      !formulario.value.fechaInicio ||
      !formulario.value.fechaFin
    ) {
      Swal.fire('Error', 'Título, fecha de inicio y fecha de fin son obligatorios', 'error')
      return
    }
    
    const fechaInicioValida = /^\d{4}-\d{2}-\d{2}$/.test(formulario.value.fechaInicio)
    const fechaFinValida = /^\d{4}-\d{2}-\d{2}$/.test(formulario.value.fechaFin)
    if (!fechaInicioValida || !fechaFinValida) {
      Swal.fire('Error', 'Las fechas deben tener formato YYYY-MM-DD', 'error')
      return
    }
    try {
      const formData = new FormData()
      formData.append('titulo', formulario.value.titulo)
      formData.append('descripcion', formulario.value.descripcion)
      formData.append('fechaInicio', formulario.value.fechaInicio)
      formData.append('fechaFin', formulario.value.fechaFin)
      formData.append('aprobada', formulario.value.aprobada)
      formData.append('puntos', formulario.value.puntos)
      formData.append('descuento', formulario.value.descuento)
      if (formulario.value.imagen) {
        formData.append('imagen', formulario.value.imagen)
      }
      
      if (productosSeleccionados.value.length > 0) {
        const ids = productosSeleccionados.value.map(p => p.id)
        formData.append('productosIds', JSON.stringify(ids))
      }

      if (editando.value) {
        await api.put(`${API_URL}/${formulario.value.id}`, formData)
      } else {
        await api.post(API_URL, formData)
      }

      await cargarCampanas()
      cerrarModal()
      Swal.fire(
        'Éxito',
        editando.value ? 'Campaña actualizada exitosamente' : 'Campaña creada exitosamente',
        'success'
      )
    } catch (err) {
      console.error('Error guardando campaña:', err)
      Swal.fire('Error', 'No se pudo guardar la campaña', 'error')
    }
  }

   // Eliminar Campaña
  const eliminarCampana = async (campana) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la campaña "${campana.titulo}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`${API_URL}/${campana.id}`)
      await cargarCampanas()
      Swal.fire('Eliminado', 'La campaña fue eliminada correctamente', 'success')
    } catch (err) {
      console.error('Error eliminando campaña:', err)
      Swal.fire('Error', 'No se pudo eliminar la campaña', 'error')
    }
  }

  const confirmarEliminar = (campana) => {
    eliminarCampana(campana)
  }

  // Subida de imagen
  const manejarSubidaImagen = (event) => {
    const file = event.target.files[0]
    if (file) {
      formulario.value.imagen = file
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImage.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // Abrir modal nueva
  const abrirModalNueva = () => {
    editando.value = false
    formulario.value = {
      id: null,
      titulo: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      aprobada: false,
      puntos: null,
      descuento: null,
      imagen: null
    }
    productosSeleccionados.value = []
    previewImage.value = null
    modalAbierto.value = true
  }

  // Abrir modal editar
  const abrirModalEditar = (campana) => {
    editando.value = true
    formulario.value = { ...campana, imagen: null }
    previewImage.value = campana.imagenUrl
      ? `${BASE}${campana.imagenUrl}`
      : null
    productosSeleccionados.value = campana.productos || []
    modalAbierto.value = true
  }

  // Abrir modal ver productos desde la tabla
  const abrirModalVerProductos = (campana) => {
    campanaActual.value = campana
    modalVerProductos.value = true
  }

  // Cerrar modal
  const cerrarModal = () => {
    modalAbierto.value = false
  }

  return {
    BASE,
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
    // Paginación
    paginaActual,
    totalPaginas,
    paginasVisibles,
    paginaAnterior,
    paginaSiguiente,
    irAPagina,
    totalCampanas
  }
}
