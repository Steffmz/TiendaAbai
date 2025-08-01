<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <button class="toggle-btn" @click="$emit('toggle')">
        <Icon icon="mdi:menu" />
      </button>
    </div>

    <ul class="menu">
      <router-link to="/dashboard" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="navigate" title="Dashboard">
          <Icon icon="mdi:home-outline" />
          <span v-if="!isCollapsed">Dashboard</span>
        </li>
      </router-link>

      <router-link to="/dashboard/usuarios" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="navigate" title="Usuarios">
          <Icon icon="mdi:account-group-outline" />
          <span v-if="!isCollapsed">Usuarios</span>
        </li>
      </router-link>

      <router-link to="/dashboard/categorias" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="navigate" title="Categorías">
          <Icon icon="mdi:format-list-bulleted" />
          <span v-if="!isCollapsed">Categorías</span>
        </li>
      </router-link>
    </ul>
  </aside>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  isCollapsed: Boolean
});
</script>

<style src="./Sidebar.css"></style>