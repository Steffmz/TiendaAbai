<template>
  <div class="calendar-page">
    <div class="calendar-wrapper">
      <div class="page-header">
        <h1 class="page-title">Calendario de Campañas</h1>
        <p class="page-subtitle">Visualiza todas tus campañas activas y programadas.</p>
      </div>

      <div class="calendar-container">
        <FullCalendar :options="calendarOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// --- LÓGICA RESPONSIVE MEJORADA ---

const isMobile = ref(window.innerWidth <= 768);

// Función para definir la barra de herramientas según el tamaño de la pantalla
const getHeaderToolbar = () => {
  return isMobile.value
    ? { left: 'prev,next', center: 'title', right: '' }
    : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' };
};

// Función que se ejecuta cuando el usuario cambia el tamaño de la ventana
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  // Actualizamos las opciones del calendario dinámicamente
  calendarOptions.value.headerToolbar = getHeaderToolbar();
  calendarOptions.value.height = isMobile.value ? 'auto' : 650;
};

// --- FIN DE LA LÓGICA RESPONSIVE ---

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: getHeaderToolbar(), // Usa la función para la configuración inicial
  events: [],
  weekends: true,
  locale: 'es',
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
  },
  eventClick: handleEventClick,
  eventDisplay: 'list-item',
  height: isMobile.value ? "auto" : 650,
  aspectRatio: isMobile.value ? 0.7 : 1.35,
});

// Función para ajustar la fecha final para que sea inclusiva en la vista
const adjustEndDateForCalendar = (endDateString) => {
    const date = new Date(endDateString);
    date.setUTCDate(date.getUTCDate() + 1); // Añade un día para que el evento cubra hasta el final del día
    return date.toISOString().split('T')[0];
};

async function fetchCampaigns() {
  try {
    const token = localStorage.getItem('authToken');
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/campanas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    calendarOptions.value.events = data.map(campana => ({
      id: campana.id,
      title: campana.titulo,
      start: campana.fechaInicio.split('T')[0],
      end: adjustEndDateForCalendar(campana.fechaFin), // Usamos el ajuste aquí
      allDay: true,
      backgroundColor: campana.aprobada ? '#3b82f6' : '#f59e0b',
      borderColor: campana.aprobada ? '#3b82f6' : '#f59e0b'
    }));
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar las campañas en el calendario.', 'error');
  }
}

function handleEventClick(clickInfo) {
  // Para mostrar la fecha de finalización correcta, revertimos el ajuste
  const endDate = new Date(clickInfo.event.end);
  endDate.setUTCDate(endDate.getUTCDate() - 1);

  Swal.fire({
    title: `<strong>Campaña: ${clickInfo.event.title}</strong>`,
    icon: 'info',
    html: `
      <p><b>Inicia:</b> ${new Date(clickInfo.event.start).toLocaleDateString('es-CO', { timeZone: 'UTC' })}</p>
      <p><b>Finaliza:</b> ${endDate.toLocaleDateString('es-CO', { timeZone: 'UTC' })}</p>
    `,
    showCloseButton: true,
    confirmButtonText: '¡Entendido!'
  });
}

// Añadimos y eliminamos el "escucha" de cambio de tamaño
onMounted(() => {
  fetchCampaigns();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Tus estilos se mantienen intactos */
.calendar-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}
.page-header {
  text-align: center;
  margin-bottom: 1rem;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.page-subtitle {
  font-size: 1rem;
  color: #0749ce;
}

.dark .calendar-container {
  background: #1e293b;
  border: 1px solid #334155;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  color: #e2e8f0;
}
.dark .fc-toolbar-title { color: #f8fafc; }
.dark .fc-button { background: #334155 !important; border: none !important; color: #f8fafc !important; }
.dark .fc-button:hover { background: #475569 !important; }
.dark .fc-daygrid-day-number { color: #e2e8f0; }

@media (max-width: 768px) {
  .calendar-container { padding: 0.8rem; }
  .page-title { font-size: 1.4rem; }
  .page-subtitle { font-size: 0.85rem; }
  .fc-toolbar { flex-direction: column !important; gap: 0.5rem; }
  .fc-toolbar-chunk { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; }
  .fc-button { font-size: 0.75rem !important; padding: 0.25rem 0.6rem !important; }
  .fc-toolbar-title { font-size: 1rem !important; }
}
</style>