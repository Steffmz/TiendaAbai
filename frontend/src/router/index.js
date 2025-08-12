import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

// Vistas y layouts
import Login from '../components/login/Login.vue';
import Dashboard from '../components/layouts/Dashboard.vue';
import DashboardIndex from '../views/admin/DashboardIndex.vue'; // <-- Importa el index
import GestionUsuarios from '../views/admin/GestionUsuarios.vue'; // <-- Importa la gestión de usuarios
import Categorias from '../components/categorias/Categorias.vue';
import Productos from '../components/productos/Productos.vue';
import Campana from '../components/campanas/Campana.vue';


const routes = [
  { path: '/login', name: 'Login', component: Login },

  // Redirige la ruta raíz a la página principal del dashboard
  { path: '/', redirect: '/dashboard', meta: { requiresAuth: true } },

  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      // ✅ RUTA RESTAURADA: Página principal del dashboard
      {
        path: '', // La ruta vacía (ej: /dashboard) muestra el Index
        name: 'Dashboard',
        component: DashboardIndex
      },
      // ✅ RUTA RESTAURADA: Gestión de usuarios
      {
        path: 'usuarios', // La ruta /dashboard/usuarios
        name: 'GestionUsuarios',
        component: GestionUsuarios
      },
      {
        path: 'categorias',
        name: 'Categorias',
        component: Categorias
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
  }
];

  const router = createRouter({
    history: createWebHistory(),
    routes
  });

  // Middleware de protección
  router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('authToken');

    if (to.meta.requiresAuth) {
      if (!token) return next('/login');

      try {
        const decodedToken = jwtDecode(token);

        if (to.meta.requiresAdmin && decodedToken.rol !== 'Administrador') {
          return next('/');
        }
      } catch (error) {
        console.error('Token inválido:', error);
        localStorage.removeItem('authToken');
        return next('/login');
      }
    }

    next();
  });

  export default router;
