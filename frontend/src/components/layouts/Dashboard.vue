<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <Sidebar 
      :isCollapsed="isCollapsed" 
      @toggle="toggleSidebar"
      @navigate="handleNavigation" 
    />

    <!-- Contenido principal -->
    <div class="main" :class="{ collapsed: isCollapsed }">
      <Topbar @toggle="toggleSidebar" />
      
      <div class="content">
        <!-- Mostrar Categorías -->
        <!--<Categorias v-if="activeSection === 'categorias'" />

        <!-- Mostrar Usuarios -->
        <div v-if="activeSection === 'usuarios'">
          <h2>Gestión de Usuarios</h2>
        </div>

        <!-- Dashboard principal -->
        <div v-if="activeSection === 'dashboard'">
          <div class="welcome-section">
            <h1 class="welcome-title">¡Bienvenido a ABAI S.A.S!</h1>
            <p class="welcome-subtitle">Panel principal</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ stats.usuarios }}</div>
              <div class="stat-label">Usuarios</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.proyectos }}</div> 
              <div class="stat-label">Proyectos</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.satisfaccion }}%</div>
              <div class="stat-label">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../menu/Sidebar.vue';
import Topbar from '../menu/Topbar.vue';
//import Categorias from '../categorias/Categorias.vue';

export default {
  name: "Dashboard",
  components: { Sidebar, Topbar },
  data() {
    return {
      isCollapsed: false,
      activeSection: 'dashboard', // Sección por defecto
      stats: {
        usuarios: 1247,
        proyectos: 89,
        ingresos: 45280,
        satisfaccion: 97
      }
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
    handleNavigation(item) {
      this.activeSection = item; // ✅ Cambia la sección activa
    },
    async loadDashboardData() {
      try {
        console.log('Datos del dashboard cargados');
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      }
    }
  },
  mounted() {
    this.loadDashboardData();
  }
};
</script>

<style src="./Dashboard.css"></style>
