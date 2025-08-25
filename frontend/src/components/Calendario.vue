<template>
  <div class="page-container">
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
      backgroundColor: campana.aprobada ? '#3b82f6' : '#f59e0b',
      borderColor: campana.aprobada ? '#3b82f6' : '#f59e0b'
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
/* ESTILOS UNIFICADOS CON VARIABLES DE TEMA */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  justify-content: flex-start;
}
.max-w-7xl { max-width: 80rem; width: 100%; margin-left: auto; margin-right: auto; }

.page-header { text-align: center; margin-bottom: 1.5rem; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--text); }
.page-subtitle { color: var(--text-muted); margin-top: 0.25rem; }

.calendar-container {
  background-color: var(--surface);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

/* Estilos profundos para FullCalendar */
:deep(th), :deep(td), :deep(h2) {
  color: var(--text);
}
:deep(.fc-scrollgrid) {
  border-color: var(--border) !important;
}
:deep(.fc-daygrid-day) {
  border-color: var(--border) !important;
}

:deep(.fc-button-primary) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: var(--primary-contrast) !important;
  font-weight: 500;
}
:deep(.fc-button-primary:hover) {
  background-color: var(--accent) !important;
  border-color: var(--accent) !important;
  color: black !important;
}
:deep(.fc-button-active) {
  background-color: var(--accent) !important;
  border-color: var(--accent) !important;
  color: black !important;
}

:deep(.fc-daygrid-day.fc-day-today) {
  background-color: rgba(43, 127, 255, 0.1) !important;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5em;
}

:deep(.fc-col-header-cell-cushion) {
  font-weight: 600;
  color: var(--text-muted);
}

:deep(.fc-daygrid-day-number) {
  color: var(--text-muted);
}
</style>
