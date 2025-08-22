import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

// Vistas y layouts
import Login from '../components/login/Login.vue';
import Dashboard from '../components/layouts/Dashboard.vue';
import Inicio from '../components/layouts/Inicio.vue';
import Categorias from '../components/categorias/Categorias.vue';
import Productos from '../components/productos/Productos.vue';
import Campana from '../components/campanas/Campana.vue';
import Calendario from '../components/Calendario.vue';
import GestionUsuarios from '../components/admin/GestionUsuarios.vue';
// --- ESTA ES LA LÍNEA QUE FALTABA ---
import GestionPedidos from '../components/admin/GestionPedidos.vue'; 

const routes = [
  { path: '/login', name: 'Login', component: Login },
  
  { 
    path: '/inicio', 
    name: 'Inicio', 
    component: Inicio, 
    meta: { requiresAuth: true }
  },

  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/dashboard/categorias'
      },
      {
        path: 'categorias',
        name: 'Categorias',
        component: Categorias
      },
      {
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
      },
      {
        path: 'calendario',
        name: 'Calendario',
        component: Calendario
      },
      { // La ruta que añadimos
        path: 'pedidos',
        name: 'GestionPedidos',
        component: GestionPedidos // Ahora 'GestionPedidos' sí está definido
      }
    ]
  },

  { path: '/:pathMatch(.*)*', redirect: '/inicio' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Middleware de protección
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');

  if (to.name === 'Login' && token) {
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.rol === 'Administrador') {
        return next('/dashboard');
      } else {
        return next('/inicio');
      }
    } catch {
      localStorage.removeItem('authToken');
      return next('/login');
    }
  }

  if (to.meta.requiresAuth) {
    if (!token) return next('/login');

    try {
      const decodedToken = jwtDecode(token);
      if (to.meta.requiresAdmin && decodedToken.rol !== 'Administrador') {
        return next('/inicio'); 
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
