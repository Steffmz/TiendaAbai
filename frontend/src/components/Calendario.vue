<template>
  <div class="calendar-page">
    <div class="calendar-wrapper">
      <!-- Encabezado -->
      <div class="page-header">
        <h1 class="page-title">Calendario de Campañas</h1>
        <p class="page-subtitle">Visualiza todas tus campañas activas y programadas.</p>
      </div>

      <!-- Calendario centrado -->
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

const eventsData = ref([]);

const isMobile = window.innerWidth <= 768;

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  fixedWeekCount: false,
  expandRows: true,
  headerToolbar: {
    left: isMobile ? 'prev,next' : 'prev,next today',
    center: 'title',
    right: isMobile ? '' : 'dayGridMonth,dayGridWeek'
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
  eventDisplay: 'list-item',

  
  height: isMobile ? "auto" : 650,
  contentHeight: isMobile ? 500 : 650,
  aspectRatio: isMobile ? 0.7 : 1.35,
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

    eventsData.value = events;
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
    confirmButtonText: '¡Entendido!'
  });
}

onMounted(() => {
  fetchCampaigns();
});
</script>

<style scoped>
.calendar-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(214, 9, 9, 0.06);
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

.dark .fc-toolbar,
.dark .fc-toolbar-title {
  color: #f8fafc;
}

.dark .fc-button {
  background: #334155 !important;
  border: none !important;
  color: #f8fafc !important;
}
.dark .fc-button:hover {
  background: #475569 !important;
}

.dark .fc-daygrid-day {
  background: #0f172a;
  border: 1px solid #1e293b;
}
.dark .fc-daygrid-day-number {
  color: #e2e8f0;
}

.dark .fc-col-header-cell {
  background: #3b291e !important;
  color: #f8fafc !important;
}

/* Eventos */
.dark .fc-event {
  background-color: #3b82f6 !important;
  border: none !important;
  color: white !important;
  font-size: 0.8rem;
  padding: 2px 4px;
  border-radius: 6px;
}

/*  Responsivo móviles */
@media (max-width: 768px) {
  .calendar-container {
    padding: 0.8rem;
    border-radius: 10px;
    max-width: 100%;
    min-height: 500px; 
  }

  .page-title {
    font-size: 1.4rem;
  }

  .page-subtitle {
    font-size: 0.85rem;
  }

  .fc-toolbar {
    flex-direction: column !important;
    gap: 0.5rem;
    align-items: center;
  }

  .fc-toolbar-chunk {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
  }

  .fc-button {
    font-size: 0.75rem !important;
    padding: 0.25rem 0.6rem !important;
    border-radius: 6px !important;
  }

  .fc-toolbar-title {
    font-size: 1rem !important;
    text-align: center;
  }

  .fc-daygrid-day-frame {
    min-height: 60px !important; 
  }

  .fc-daygrid-day-number {
    font-size: 0.75rem;
  }

  .fc-event {
    font-size: 0.7rem !important;
    padding: 1px 3px !important;
  }
}
</style>
