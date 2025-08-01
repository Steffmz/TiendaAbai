// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode'; 

import Login from '../components/login/Login.vue';
import Home from '../views/Home.vue';
import Catalogo from '../views/Catalogo.vue';
import Dashboard from '../components/layouts/Dashboard.vue';
import GestionUsuarios from '../views/admin/GestionUsuarios.vue';
import DashboardIndex from '../views/admin/DashboardIndex.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/catalogo', name: 'Catalogo', component: Catalogo, meta: { requiresAuth: true } },
    { 
    path: '/dashboard', 
    component: Dashboard, 
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardIndex
      },
      {
        path: 'usuarios',
        name: 'GestionUsuarios',
        component: GestionUsuarios
      }
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 👇 REEMPLAZA TU router.beforeEach CON ESTE CÓDIGO ACTUALIZADO 👇
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');

  if (to.meta.requiresAuth) {
    if (!token) {
      // Si requiere autenticación y no hay token, va al login
      return next('/login');
    }

    try {
      const decodedToken = jwtDecode(token);
      // Si la ruta requiere ser admin y el rol del token NO es Administrador
      if (to.meta.requiresAdmin && decodedToken.rol !== 'Administrador') {
        // Lo mandamos a la página de inicio normal, no tiene permiso
        return next('/');
      }
    } catch (error) {
      // Si el token es inválido, lo mandamos al login
      console.error("Token inválido:", error);
      localStorage.removeItem('authToken');
      return next('/login');
    }
  }

  next(); // Todo en orden, permite el paso
});

export default router;