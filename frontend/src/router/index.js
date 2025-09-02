import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";

// Vistas y layouts
import Login from "../components/login/Login.vue";
import Dashboard from "../components/layouts/Dashboard.vue";
import EmployeeLayout from "../components/layouts/EmployeeLayout.vue";
import Inicio from "../components/inicio/Inicio.vue"; // Esta será la TIENDA
import CampaignProducts from "../components/employee/CampaignProducts.vue";

// Vistas de Admin (importa solo las que necesites para el router)
import GestionUsuarios from "../components/admin/GestionUsuarios.vue";
import Categorias from "../components/categorias/Categorias.vue";
import Campana from "../components/campanas/Campana.vue";
import Calendario from "../components/Calendario.vue";
import GestionPedidos from "../components/admin/GestionPedidos.vue";

const routes = [
  // --- LOGIN (PÚBLICO) ---
  { 
    path: "/login", 
    name: "Login", 
    component: Login 
  },

  // --- RUTAS DEL EMPLEADO ---
  {
    path: "/", // La raíz será la base para el empleado
    component: EmployeeLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "", // La ruta / se redirige a la tienda
        redirect: "/tienda",
      },
      {
        path: "tienda", // La tienda principal
        name: "Tienda",
        component: Inicio,
      },
      {
        path: "campana/:id",
        name: "CampaignProducts",
        component: CampaignProducts,
      },
    ],
  },

  // --- RUTAS DEL ADMIN ---
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "", redirect: "/dashboard/usuarios" },
      { path: "usuarios", name: "GestionUsuarios", component: GestionUsuarios },
      { path: "categorias", name: "Categorias", component: Categorias },
      { path: "campanas", name: "Campana", component: Campana },
      { path: "calendario", name: "Calendario", component: Calendario },
      { path: "pedidos", name: "GestionPedidos", component: GestionPedidos },
      // ... tus otras rutas de admin
    ],
  },

  // Atrapa cualquier ruta no definida y redirige al login
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- Middleware de protección ---
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");
  let decodedToken = null;

  if (token) {
    try { decodedToken = jwtDecode(token); }
    catch (error) { localStorage.removeItem("authToken"); }
  }
  
  if (to.name === 'Login' && decodedToken) {
    if (decodedToken.rol === "Administrador") return next("/dashboard");
    return next("/tienda");
  }

  if (to.meta.requiresAuth && !decodedToken) {
    return next('/login');
  }

  if (to.meta.requiresAdmin && decodedToken?.rol !== 'Administrador') {
    return next('/tienda');
  }

  next();
});

export default router;