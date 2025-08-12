import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

// Vistas y layouts
import Login from '../components/login/Login.vue';
import Dashboard from '../components/layouts/Dashboard.vue';
import Categorias from '../components/categorias/Categorias.vue';
import Productos from '../components/productos/Productos.vue';
import Campana from '../components/campanas/Campana.vue';


const routes = [
  { path: '/login', name: 'Login', component: Login },

  { path: '/', redirect: '/dashboard/categorias', meta: { requiresAuth: true } },

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
