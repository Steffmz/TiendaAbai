<template>
  <div class="user-layout">
    <Topbar />
    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Topbar from '../menu/Topbar.vue';
</script>

<style scoped>
.user-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-content {
  flex: 1;
}
</style>
