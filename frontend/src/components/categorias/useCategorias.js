import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2'

export default function useCategorias() {

  const categorias = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const mostrarModal = ref(false);
  const editando = ref(false);
  const filtro = ref('');
  const paginaActual = ref(1);
  const categoriasPorPagina = 5;
  const previewImage = ref(null);
  
  // Formulario
  const form = ref({
    id: null,
    nombre: '',
    descripcion: '',
    imagen: null
  });

  // Placeholder para imágenes
  const placeholder = '/uploads/Categorias/categoria-default.png';

  const categoriasFiltradas = computed(() => {
    if (!filtro.value) return categorias.value;
    
    return categorias.value.filter(categoria =>
      categoria.nombre.toLowerCase().includes(filtro.value.toLowerCase()) ||
      (categoria.descripcion && categoria.descripcion.toLowerCase().includes(filtro.value.toLowerCase()))
    );
  });

  const totalCategorias = computed(() => categoriasFiltradas.value.length);
  const totalPaginas = computed(() => Math.ceil(totalCategorias.value / categoriasPorPagina));

  const categoriasPaginadas = computed(() => {
    const inicio = (paginaActual.value - 1) * categoriasPorPagina;
    const fin = inicio + categoriasPorPagina;
    return categoriasFiltradas.value.slice(inicio, fin);
  });

  const filasVacias = computed(() => {
    const filasUsadas = categoriasPaginadas.value.length;
    return Math.max(0, categoriasPorPagina - filasUsadas);
  });

  const paginasVisibles = computed(() => {
    const total = totalPaginas.value;
    const actual = paginaActual.value;
    const visible = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) visible.push(i);
    } else {
      if (actual <= 3) {
        for (let i = 1; i <= 5; i++) visible.push(i);
      } else if (actual >= total - 2) {
        for (let i = total - 4; i <= total; i++) visible.push(i);
      } else {
        for (let i = actual - 2; i <= actual + 2; i++) visible.push(i);
      }
    }

    return visible;
  });

  const handleResponse = async (response) => {
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType?.includes('application/json')) {
      const textResponse = await response.text();
      console.log('Non-JSON response:', textResponse);
      
      if (response.ok) {
        return { success: true, message: textResponse || 'Operación exitosa' };
      } else {
        throw new Error(textResponse || `Error ${response.status}: ${response.statusText}`);
      }
    }
    
    try {
      const jsonResponse = await response.json();
      console.log('JSON response:', jsonResponse);
      
      if (!response.ok) {
        throw new Error(jsonResponse.error || jsonResponse.message || `Error ${response.status}`);
      }
      
      return jsonResponse;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      
      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
    }
  };

  const obtenerCategorias = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🔍 Obteniendo categorías...');
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const url = `${baseUrl}/api/categorias`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta recibida:', response.status, response.statusText);
      
      const data = await handleResponse(response);
      
      console.log('📊 Datos recibidos:', data);
      
      categorias.value = Array.isArray(data) ? data.map(categoria => ({
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
         imagen: categoria.imagenUrl
        ? `${baseUrl}${categoria.imagenUrl}` 
        : `${baseUrl}/uploads/categoria-default.png`,
        activo: categoria.activo,
        fecha_creacion: categoria.fechaCreacion,
        productos_count: categoria._count?.productos || 0
      })) : [];
      
      console.log('✅ Categorías cargadas:', categorias.value.length);
      
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error al obtener categorías:', err);
      alert(`Error al cargar categorías: ${err.message}`);
    } finally {
      loading.value = false;
    }
  };

    const guardarCategoria = async () => {
    if (!form.value.nombre.trim()) {
      Swal.fire('Error', 'El nombre de la categoría es obligatorio', 'warning');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('nombre', form.value.nombre.trim());
      formData.append('descripcion', form.value.descripcion.trim() || '');
      
      if (form.value.imagen) {
        formData.append('imagen', form.value.imagen);
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const url = editando.value 
        ? `${baseUrl}/api/categorias/${form.value.id}` 
        : `${baseUrl}/api/categorias`;
      
      const method = editando.value ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      await handleResponse(response);

      await obtenerCategorias();
      cerrarModal();
      
      Swal.fire('Éxito', editando.value ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente', 'success');
      
    } catch (err) {
      error.value = err.message;
      Swal.fire('Error', err.message, 'error');
    } finally {
      loading.value = false;
    }
  };

  //Eliminar Categorias
      const eliminarCategoria = async (categoria) => {
          const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará la categoría "${categoria.nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
          });

          if (!result.isConfirmed) return;

          loading.value = true;
          error.value = null;

          try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/api/categorias/${categoria.id}`, {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });

            await handleResponse(response);

            Swal.fire('Eliminado', 'La categoría fue eliminada correctamente', 'success');
            await obtenerCategorias();
            
          } catch (err) {
            error.value = err.message;
            Swal.fire('Error', err.message, 'error');
          } finally {
            loading.value = false;
          }
        };

  const cambiarEstado = async (categoria) => {
  loading.value = true;
  error.value = null;

  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/categorias/${categoria.id}/estado`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const data = await handleResponse(response);

    // Actualizar localmente 
    const index = categorias.value.findIndex(c => c.id === categoria.id);
    if (index !== -1) {
      categorias.value[index].activo = data.categoria.activo;
    }

  } catch (err) {
    error.value = err.message;
    console.error('❌ Error al cambiar estado:', err);
  } finally {
    loading.value = false;
  }
};

  // Métodos de modal
  const abrirModalNueva = () => {
    console.log('📝 Abriendo modal nueva categoría');
    limpiarFormulario();
    editando.value = false;
    mostrarModal.value = true;
  };

  const abrirModalEditar = (categoria) => {
    console.log('✏️ Abriendo modal editar categoría:', categoria);
    form.value = {
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      imagen: null
    };
    
    
    if (categoria.imagen) {
      previewImage.value = categoria.imagen;
    }
    
    editando.value = true;
    mostrarModal.value = true;
  };

  const cerrarModal = () => {
    console.log('❌ Cerrando modal');
    mostrarModal.value = false;
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    form.value = {
      id: null,
      nombre: '',
      descripcion: '',
      imagen: null
    };
    previewImage.value = null;
    error.value = null;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('📷 No se seleccionó archivo');
      form.value.imagen = null;
      previewImage.value = null;
      return;
    }

    console.log('📷 Archivo seleccionado:', file.name, file.type, `${(file.size/1024/1024).toFixed(2)}MB`);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');
      event.target.value = '';
      form.value.imagen = null;
      previewImage.value = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 5MB');
      event.target.value = '';
      form.value.imagen = null;
      previewImage.value = null;
      return;
    }

    form.value.imagen = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
      console.log('✅ Preview de imagen generado');
    };
    reader.onerror = (e) => {
      console.error('❌ Error al crear preview:', e);
      previewImage.value = null;
    };
    reader.readAsDataURL(file);
  };

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas.value) {
      paginaActual.value = pagina;
    }
  };

  const paginaAnterior = () => {
    if (paginaActual.value > 1) {
      paginaActual.value--;
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual.value < totalPaginas.value) {
      paginaActual.value++;
    }
  };

  const confirmarEliminar = (categoria) => {
    eliminarCategoria(categoria);
  };

  const cambioEstado = (categoria) => {
    cambiarEstado(categoria);
  };

  onMounted(() => {
    console.log('🚀 Componente montado, cargando categorías...');
    obtenerCategorias();
  });

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
    categoriasFiltradas,
    totalCategorias,
    totalPaginas,
    categoriasPaginadas,
    filasVacias,
    paginaActual,
    paginasVisibles,
    obtenerCategorias,
    guardarCategoria,
    eliminarCategoria,
    cambiarEstado,
    abrirModalNueva,
    abrirModalEditar,
    cerrarModal,
    handleImageUpload,
    irAPagina,
    paginaAnterior,
    paginaSiguiente,
    confirmarEliminar,
    cambioEstado
  };
}