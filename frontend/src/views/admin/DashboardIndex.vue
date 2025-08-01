<template>
  <div class="dashboard-index">
    <div class="welcome-section">
      <h1 class="welcome-title">¡Bienvenido a ABAI S.A.S!</h1>
      <p class="welcome-subtitle">Gestiona tu negocio de manera eficiente y profesional</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">1247</div>
        <div class="stat-label">Usuarios</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">89</div> 
        <div class="stat-label">Proyectos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">$ 45.280</div>
        <div class="stat-label">Ingresos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">97%</div>
        <div class="stat-label">Satisfacción</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// En el futuro, aquí cargaremos las estadísticas reales desde la API.
</script>

<style scoped>
/* Estilos para que se vea como en tu imagen de referencia */
.stats-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 1.5rem; 
}

.stat-card { 
  background: white; 
  border-radius: 16px; 
  padding: 2rem; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); 
  text-align: center; 
  border: 1px solid #e2e8f0;
}

.stat-number { 
  font-size: 2.5rem; 
  font-weight: 700; 
  color: #334155; 
  margin-bottom: 0.5rem; 
}

.stat-label { 
  color: #64748b; 
  font-weight: 500; 
}

.welcome-section { 
  background: #74B9E7; 
  color: white; 
  border-radius: 16px; 
  padding: 2rem; 
  margin-bottom: 2rem; 
  text-align: center; 
}

.welcome-title { 
  font-size: 2.2rem; 
  font-weight: 700; 
}

.welcome-subtitle { 
  font-size: 1.1rem; 
  opacity: 0.9; 
}
</style>  