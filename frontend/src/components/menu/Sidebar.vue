<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="logo-container2">
      <div class="toggle-btn" @click="$emit('toggle')">
        <Icon icon="mdi:menu" />
      </div>
    </div>

    <ul class="menu">
      <router-link to="/dashboard" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="navigate">
          <Icon icon="mdi:home-outline" />
          <span v-if="!isCollapsed">Dashboard</span>
        </li>
      </router-link>

      <router-link to="/dashboard/usuarios" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="navigate">
          <Icon icon="mdi:account-group-outline" />
          <span v-if="!isCollapsed">Usuarios</span>
        </li>
      </router-link>

      <router-link to="/dashboard/categorias" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="navigate">
          <Icon icon="mdi:format-list-bulleted" />
          <span v-if="!isCollapsed">Categorías</span>
        </li>
      </router-link>

      <router-link to="/dashboard/campanas" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="navigate">
          <Icon icon="mdi:format-list-bulleted" />
          <span v-if="!isCollapsed">Campañas</span>
        </li>
      </router-link>

      </ul>
  </aside>
</template>

<script setup>
// Usamos script setup para consistencia con los otros componentes
import { Icon } from '@iconify/vue';

defineProps({
  isCollapsed: Boolean
});
</script>

<style src="./Sidebar.css"></style>