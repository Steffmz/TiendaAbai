<template>
  <aside :class="['sidebar', { collapsed: isCollapsed, open: isOpen }]">
    <div class="logo-container2">
      <div class="toggle-btn" @click="$emit('toggle')">
        <span class="iconify" data-icon="mdi:menu"></span>
      </div>
    </div>

    <ul class="menu">
      <router-link to="/dashboard" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="navigate">
          <span class="iconify" data-icon="mdi:view-dashboard"></span>
          <span v-if="!isCollapsed">Dashboard</span>
        </li>
      </router-link>
      <router-link to="/dashboard/usuarios" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="() => { navigate(); $emit('close') }">
          <span class="iconify" data-icon="mdi:account-group"></span>
          <span v-if="!isCollapsed">Usuarios</span>
        </li>
      </router-link>

      <router-link to="/dashboard/categorias" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="() => { navigate(); $emit('close') }">
          <span class="iconify" data-icon="mdi:format-list-bulleted"></span>
          <span v-if="!isCollapsed">Categorías</span>
        </li>
      </router-link>

      <router-link to="/dashboard/campanas" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="() => { navigate(); $emit('close') }">
          <span class="iconify" data-icon="mdi:bullhorn"></span>
          <span v-if="!isCollapsed">Campañas</span>
        </li>
      </router-link>

      <router-link to="/dashboard/calendario" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="() => { navigate(); $emit('close') }">
          <span class="iconify" data-icon="mdi:calendar"></span>
          <span v-if="!isCollapsed">Calendario</span>
        </li>
      </router-link>

      <router-link to="/dashboard/pedidos" custom v-slot="{ navigate, isActive }">
        <li :class="{ active: isActive }" @click="() => { navigate(); $emit('close') }">
          <span class="iconify" data-icon="mdi:package-variant-closed"></span>
          <span v-if="!isCollapsed">Pedidos</span>
        </li>
      </router-link>
    </ul>
  </aside>
</template>

<script>
export default {
  props: {
    isCollapsed: { type: Boolean, default: false }, 
    isOpen: { type: Boolean, default: false }       
  }
}
</script>

<style src="./Sidebar.css"></style>
