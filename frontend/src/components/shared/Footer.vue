<template>
  <footer class="app-footer">
    <div class="max-w-7xl mx-auto px-12 text-center">
      <div class="flex justify-center space-x-6 mb-4">
        <a
          href="https://facebook.com/abai"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:scale-110 transition-transform"
          aria-label="Facebook"
        >
          <span class="iconify text-3xl" data-icon="mdi:facebook" style="color: #ffffff;"></span>
        </a>

        <a
          href="https://instagram.com/abai"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:scale-110 transition-transform"
          aria-label="Instagram"
        >
          <span class="iconify text-3xl" data-icon="mdi:instagram" style="color: #ffffff;"></span>
        </a>

        <a
          href="https://www.tiktok.com/@abai"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:scale-110 transition-transform"
          aria-label="TikTok"
        >
          <span class="iconify text-3xl" data-icon="ic:baseline-tiktok" style="color: #ffffff;"></span>
        </a>
      </div>
      <p class="text-sm opacity-80">&copy; {{ new Date().getFullYear() }} Abai Group. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script setup>
// No se necesita lógica de script para este componente.
</script>

<style scoped>
.app-footer {
  color: white;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  margin-top: auto;
}
</style>