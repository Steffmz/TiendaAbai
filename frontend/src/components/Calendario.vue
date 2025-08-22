<template>
  <div class="page-container">
    <!-- 2. Contenedor para centrar y dar ancho máximo -->
    <div class="max-w-7xl w-full mx-auto">
      <!-- Encabezado -->
      <div class="page-header">
        <h1 class="page-title">Calendario de Campañas</h1>
        <p class="page-subtitle">Visualiza todas tus campañas activas y programadas.</p>
      </div>

      <!-- Contenedor del Calendario -->
      <div class="calendar-container">
        <FullCalendar :options="calendarOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  // 1. CORRECCIÓN DE ALTURA: El calendario se ajustará al mes actual
  fixedWeekCount: false, 
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek'
  },
  events: [],
  weekends: true,
  locale: 'es',
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
  },
  eventClick: handleEventClick,
});

async function fetchCampaigns() {
  try {
    const token = localStorage.getItem('authToken');
    const { data } = await axios.get('http://localhost:3000/api/campanas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const events = data.map(campana => ({
      id: campana.id,
      title: campana.titulo,
      start: campana.fechaInicio,
      end: campana.fechaFin,
      allDay: true,
      backgroundColor: campana.aprobada ? '#3788d8' : '#d39e00',
      borderColor: campana.aprobada ? '#3788d8' : '#d39e00'
    }));
    
    calendarOptions.value.events = events;

  } catch (error) {
    console.error("Error al cargar las campañas:", error);
    Swal.fire('Error', 'No se pudieron cargar las campañas en el calendario.', 'error');
  }
}

function handleEventClick(clickInfo) {
  Swal.fire({
    title: `<strong>Campaña: ${clickInfo.event.title}</strong>`,
    icon: 'info',
    html: `
      <p><b>Inicia:</b> ${new Date(clickInfo.event.start).toLocaleDateString('es-CO')}</p>
      <p><b>Finaliza:</b> ${new Date(clickInfo.event.end).toLocaleDateString('es-CO')}</p>
    `,
    showCloseButton: true,
    focusConfirm: false,
    confirmButtonText: '¡Entendido!'
  });
}

onMounted(() => {
  fetchCampaigns();
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  justify-content: flex-start;
}

.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
}

.page-subtitle {
  color: #6b7280;
}

/* Este contenedor es necesario para que mx-auto funcione */
.max-w-7xl {
  max-width: 80rem; /* 1280px */
}
.w-full {
  width: 100%;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.calendar-container {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

:deep(.fc-button-primary) {
  background-color: #74B9E7 !important;
  border-color: #74B9E7 !important;
  color: black;
  font-weight: 500;
}

:deep(.fc-button-primary:hover) {
  background-color: #FFB93B !important;
  border-color: #FFB93B !important;
}

:deep(.fc-daygrid-day.fc-day-today) {
  background-color: rgba(255, 185, 59, 0.15) !important;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5em;
  color: #374151;
}

:deep(.fc-col-header-cell-cushion) {
  color: #4b5563;
  font-weight: 600;
}
</style>
