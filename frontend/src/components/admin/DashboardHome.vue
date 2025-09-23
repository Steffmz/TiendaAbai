<template>
  <div class="dashboard-container">
  
    <h1 class="page-title">Informacion General</h1>

    <div v-if="loading" class="loading-state">
      Cargando estadísticas...
    </div>

    <div v-else class="stats-grid">
      <div class="stat-card" v-for="card in statCards" :key="card.title">
        <div class="stat-info">
          <h3>{{ card.title }}</h3>
          <p>{{ card.value }}</p>
        </div>
        <div class="stat-icon">
          <i class="iconify" :data-icon="card.icon"></i>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-container">
        <h3>Productos Más Canjeados</h3>
        <Bar
          v-if="chartData.labels.length"
          :data="chartData"
          :options="chartOptions"
        />
        <p v-else class="text-center text-gray-500">
          No hay datos de productos para mostrar.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const stats = ref({});
const loading = ref(true);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Cantidad Canjeada",
      backgroundColor: "#3b82f6",
      borderRadius: 8,
      borderWidth: 1,
      data: [],
    },
  ],
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } },
  },
};

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

const fetchStats = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/dashboard/stats`,
      getAuthHeaders()
    );
    stats.value = data;

    // Chart data
    if (data.productosPopulares) {
      chartData.value.labels = data.productosPopulares.map((p) => p.nombre);
      chartData.value.datasets[0].data = data.productosPopulares.map(
        (p) => p.cantidad
      );
    }
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  } finally {
    loading.value = false;
  }
};

const getPedidosCount = (estado) => {
  const found = stats.value.pedidosPorEstado?.find((e) => e.estado === estado);
  return found ? found._count.estado : 0;
};

const statCards = computed(() => [
  {
    title: "Total de Usuarios",
    value: stats.value.totalUsuarios || 0,
    icon: "mdi:account-group",
  },
  {
    title: "Productos Activos",
    value: stats.value.totalProductos || 0,
    icon: "mdi:package-variant-closed",
  },
  {
    title: "Pedidos Pendientes",
    value: getPedidosCount("Pendiente"),
    icon: "mdi:clock-alert-outline",
  },
  {
    title: "Pedidos Aprobados",
    value: getPedidosCount("Aprobado"),
    icon: "mdi:check-circle-outline",
  },
]);

onMounted(fetchStats);
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: var(--text);
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 16px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.stat-info h3 {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.stat-info p {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  text-align: center;
}

.stat-icon {
  font-size: 3rem;
  color: var(--primary);
  opacity: 0.7;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
}

.chart-container {
  background: #fff;
  padding: 1.8rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 420px;
  text-align: center;
}

.chart-container h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: var(--text);
}

.loading-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--text-muted);
}

/* 🎨 Ajustes modo oscuro */
html.dark .stat-card {
  background: linear-gradient(135deg, #242b3d, #2f3a4e);
  border: 1px solid var(--border);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
}

html.dark .stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.7);
}

html.dark .stat-info h3 {
  color: var(--text-muted);
}

html.dark .stat-info p {
  color: var(--text);
}

html.dark .stat-icon {
  color: var(--accent); /* Amarillo de contraste */
  opacity: 0.9;
}

html.dark .chart-container {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
}
</style>
