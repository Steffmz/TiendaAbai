<template>
  <div class="dashboard-container">
    <h1 class="page-title">Dashboard Principal</h1>

    <div v-if="loading" class="loading-state">Cargando estadísticas...</div>

    <div v-else class="stats-grid">
      <div class="stat-card">
        <h3>Total de Usuarios</h3>
        <p>{{ stats.totalUsuarios }}</p>
        <span class="icon-bg"><i class="iconify" data-icon="mdi:account-group"></i></span>
      </div>
      <div class="stat-card">
        <h3>Productos Activos</h3>
        <p>{{ stats.totalProductos }}</p>
        <span class="icon-bg"><i class="iconify" data-icon="mdi:package-variant-closed"></i></span>
      </div>
      <div class="stat-card">
        <h3>Pedidos Pendientes</h3>
        <p>{{ getPedidosCount('Pendiente') }}</p>
        <span class="icon-bg"><i class="iconify" data-icon="mdi:clock-alert-outline"></i></span>
      </div>
      <div class="stat-card">
        <h3>Pedidos Aprobados</h3>
        <p>{{ getPedidosCount('Aprobado') }}</p>
        <span class="icon-bg"><i class="iconify" data-icon="mdi:check-circle-outline"></i></span>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-container">
        <h3>Productos Más Canjeados</h3>
        <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
        <p v-else class="text-center text-gray-500">No hay datos de productos para mostrar.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const stats = ref({});
const loading = ref(true);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Cantidad Canjeada',
    backgroundColor: '#3b82f6',
    borderColor: '#1e40af',
    borderWidth: 1,
    data: []
  }]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

const fetchStats = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, getAuthHeaders());
    stats.value = data;

    // Preparar datos para el gráfico
    if (data.productosPopulares) {
      chartData.value.labels = data.productosPopulares.map(p => p.nombre);
      chartData.value.datasets[0].data = data.productosPopulares.map(p => p.cantidad);
    }

  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  } finally {
    loading.value = false;
  }
};

const getPedidosCount = (estado) => {
  const found = stats.value.pedidosPorEstado?.find(e => e.estado === estado);
  return found ? found._count.estado : 0;
};

onMounted(fetchStats);
</script>

<style scoped>
.dashboard-container { padding: 1.5rem; }
.page-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 2rem; color: var(--text); }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background-color: var(--surface);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}
.stat-card h3 { font-size: 1rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.stat-card p { font-size: 2.5rem; font-weight: 700; color: var(--text); }
.stat-card .icon-bg {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 5rem;
  color: var(--primary);
  opacity: 0.1;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.chart-container {
  background-color: var(--surface);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  height: 400px; /* Altura fija para el gráfico */
}
.chart-container h3 { font-size: 1.2rem; font-weight: 600; margin-bottom: 1.5rem; color: var(--text); }

.loading-state { text-align: center; padding: 4rem; color: var(--text-muted); }
</style>