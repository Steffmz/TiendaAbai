import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

// Vistas y layouts
import Login from '../components/login/Login.vue';
import Dashboard from '../components/layouts/Dashboard.vue';
import Categorias from '../components/categorias/Categorias.vue';
import Productos from '../components/productos/Productos.vue';
import Campana from '../components/campanas/Campana.vue';
import Inicio from '../components/layouts/Inicio.vue';
import GestionUsuarios from '../components/admin/GestionUsuarios.vue';


const routes = [
  { path: '/login', name: 'Login', component: Login },

  { path: '/', redirect: '/dashboard/categorias' },

  { 
    path: '/inicio', 
    name: 'Inicio', 
    component: Inicio, 
    meta: { requiresAuth: true } // Protegida, pero no requiere ser admin
  },

   { path: '/', redirect: '/inicio' },

  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'categorias',
        name: 'Categorias',
        component: Categorias
      },
            { // <-- AÑADE ESTE OBJETO COMPLETO
        path: 'usuarios',
        name: 'GestionUsuarios',
        component: GestionUsuarios
      },
      {
        path: 'productos/:categoriaId',
        name: 'Productos',
        component: Productos,
        props: true
      },
       {
        path: 'campanas',
        name: 'Campana',
        component: Campana
      }
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Middleware de protección
// router/index.js - CÓDIGO CORREGIDO

// Middleware de protección
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');

  // Si la ruta no requiere autenticación, pero el usuario está logueado y va al login,
  // lo mandamos al dashboard o a su página de inicio. (Prevención)
  if (to.name === 'Login' && token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken.rol === 'Administrador') {
      return next('/dashboard');
    } else {
      return next('/inicio'); // Redirige al inicio si ya está logueado
    }
  }

  if (to.meta.requiresAuth) {
    if (!token) return next('/login');

    try {
      const decodedToken = jwtDecode(token);

      // --- ESTE ES EL CAMBIO IMPORTANTE ---
      // Si la ruta requiere admin y el usuario no lo es...
      if (to.meta.requiresAdmin && decodedToken.rol !== 'Administrador') {
        // ...lo mandamos a su propia página de inicio, NO a '/'.
        return next('/inicio'); 
      }
      
      // Si el usuario es admin pero intenta acceder a una ruta de empleado (si la tuvieras),
      // podrías redirigirlo al dashboard. (Lógica opcional para el futuro).

    } catch (error) {
      console.error('Token inválido:', error);
      localStorage.removeItem('authToken');
      return next('/login');
    }
  }

  next();
});

export default router;
