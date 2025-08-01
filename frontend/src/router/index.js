// frontend/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/login/Login.vue';
import Home from '../views/Home.vue';
import Catalogo from '../views/Catalogo.vue';

const routes = [
  // Ruta para la página de inicio de sesión
  { 
    path: '/login', 
    name: 'Login', 
    component: Login 
  },
  // Ruta principal, muestra el perfil del usuario
  { 
    path: '/', 
    name: 'Home', 
    component: Home, 
    meta: { requiresAuth: true } // Esta línea protege la ruta
  },
  // Ruta para el catálogo de productos
  { 
    path: '/catalogo', 
    name: 'Catalogo', 
    component: Catalogo, 
    meta: { requiresAuth: true } // Esta ruta también está protegida
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guardia de navegación: Se ejecuta antes de cada cambio de ruta
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('authToken');

  // Si la ruta requiere autenticación y el usuario no tiene token...
  if (to.meta.requiresAuth && !loggedIn) {
    next('/login'); // ...lo redirigimos a la página de login.
  } else {
    next(); // De lo contrario, le permitimos continuar.
  }
});

export default router;