import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/login/Login.vue';
import Dashboard from '../components/layouts/Dashboard.vue';
import Producto from '../components/productos/Producto.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Dashboard }, 
  { path: '/productos', component: Producto }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
