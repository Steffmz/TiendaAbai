<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="logo-container2">
      <div class="toggle-btn" @click="$emit('toggle')">
        <span class="iconify" data-icon="mdi:menu"></span>
      </div>
    </div>

    <ul class="menu">
      <li :class="{ active: activeItem === 'usuarios' }" @click="setActive('usuarios')">
        <span class="iconify" data-icon="mdi:account-group"></span>
        <span v-if="!isCollapsed">Usuarios</span>
      </li>
      <li :class="{ active: activeItem === 'categorias' }" @click="setActive('categorias')">
        <span class="iconify" data-icon="mdi:format-list-bulleted"></span>
        <span v-if="!isCollapsed">Categorías</span>
      </li>
      <li :class="{ active: activeItem === 'campanas' }" @click="setActive('campanas')">
        <span class="iconify" data-icon="mdi:bullhorn"></span>
        <span v-if="!isCollapsed">Campañas</span>
      </li>
      <li :class="{ active: activeItem === 'calendario' }" @click="setActive('calendario')">
        <span class="iconify" data-icon="mdi:calendar"></span>
        <span v-if="!isCollapsed">Calendario</span>
      </li>
      <li :class="{ active: activeItem === 'catalogo' }" @click="setActive('catalogo')">
        <span class="iconify" data-icon="mdi:apps"></span>
        <span v-if="!isCollapsed">Catálogo</span>
      </li>
    </ul>
  </aside>
</template>

<script>

export default {
  props: ['isCollapsed'],
  data() {
    return {
      activeItem: 'usuarios' 
    };
  },
  methods: {
    setActive(item) {
      this.activeItem = item;
      this.$emit('navigate', item);
    }
  }
};
</script>

<style src="./Sidebar.css"></style>