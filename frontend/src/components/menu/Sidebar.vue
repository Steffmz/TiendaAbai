<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="logo-container2">
      <div class="toggle-btn" @click="$emit('toggle')">
        <span class="iconify" data-icon="mdi:menu"></span>
      </div>
    </div>

    <ul class="menu">
      <router-link
        to="/dashboard/usuarios"
        custom
        v-slot="{ navigate, isActive }"
      >
        <li :class="{ active: isActive }" @click="navigate">
          <span class="iconify" data-icon="mdi:account-group"></span>
          <span v-if="!isCollapsed">Usuarios</span>
        </li>
      </router-link>

      <router-link
        to="/dashboard/categorias"
        custom
        v-slot="{ navigate, isActive }"
      >
        <li :class="{ active: isActive }" @click="navigate">
          <span class="iconify" data-icon="mdi:format-list-bulleted"></span>
          <span v-if="!isCollapsed">Categorías</span>
        </li>
      </router-link>

      <router-link
        to="/dashboard/campanas"
        custom
        v-slot="{ navigate, isActive }"
      >
        <li :class="{ active: isActive }" @click="navigate">
          <span class="iconify" data-icon="mdi:bullhorn"></span>
          <span v-if="!isCollapsed">Campañas</span>
        </li>
      </router-link>

      <router-link
        to="/dashboard/calendario"
        custom
        v-slot="{ navigate, isActive }"
      >
        <li :class="{ active: isActive }" @click="navigate">
          <span class="iconify" data-icon="mdi:calendar"></span>
          <span v-if="!isCollapsed">Calendario</span>
        </li>
      </router-link>

      <router-link
        to="/dashboard/catalogo"
        custom
        v-slot="{ navigate, isActive }"
      >
        <li :class="{ active: isActive }" @click="navigate">
          <span class="iconify" data-icon="mdi:apps"></span>
          <span v-if="!isCollapsed">Catálogo</span>
        </li>
      </router-link>
    </ul>
  </aside>
</template>

<script>
export default {
  props: ['isCollapsed']
};
</script>

<style src="./Sidebar.css"></style>
