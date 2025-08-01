<template>
  <div class="dashboard">
    <Sidebar 
      :isCollapsed="isCollapsed" 
      @toggle="toggleSidebar"
    />

    <div class="main-content">
      <Topbar @toggle="toggleSidebar" />
      
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '../menu/Sidebar.vue';
import Topbar from '../menu/Topbar.vue';

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style src="./Dashboard.css"></style>