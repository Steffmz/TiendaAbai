<template>
  <div class="welcome-section">
    <h1 class="welcome-title">¡Bienvenido a ABAI S.A.S!</h1>
    <p class="welcome-subtitle">Panel principal</p>
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
      <div class="stat-number">97%</div>
      <div class="stat-label">Satisfacción</div>
    </div>
  </div>
</template>

<script setup>
// Aquí irá la lógica para cargar las estadísticas reales en el futuro
</script>

<style scoped>
/* Estos estilos son de tu Dashboard.css, los movemos aquí para que el componente sea independiente */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.stat-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); text-align: center; }
.stat-number { font-size: 2.5rem; font-weight: 700; color: #74B9E7; margin-bottom: 0.5rem; }
.stat-label { color: #64748b; font-weight: 500; }
.welcome-section { background: linear-gradient(135deg, #74B9E7 0%, #5aa3d9 100%); color: white; border-radius: 16px; padding: 3rem 2rem; margin-bottom: 2rem; text-align: center; }
.welcome-title { font-size: 2.5rem; font-weight: 700; }
.welcome-subtitle { font-size: 1.2rem; opacity: 0.9; }
</style>