import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";

// Vistas y layouts
import Login from "../components/login/Login.vue";
import ForgotPassword from "../components/login/ForgotPassword.vue";
import ResetPassword from "../components/login/ResetPassword.vue";
import Inicio from "../components/inicio/Inicio.vue";
import InicioLogueado from "../components/inicio/InicioLogueado.vue";
import EmployeeLayout from "../components/layouts/EmployeeLayout.vue";
import CampaignProducts from "../components/employee/CampaignProducts.vue";
import Dashboard from "../components/layouts/Dashboard.vue";
// ... Vistas de Admin
import GestionUsuarios from "../components/admin/GestionUsuarios.vue";
import Categorias from "../components/categorias/Categorias.vue";
import Campana from "../components/campanas/Campana.vue";
import Calendario from "../components/Calendario.vue";
import GestionPedidos from "../components/admin/GestionPedidos.vue";
import MiPerfil from "../components/employee/MiPerfil.vue";
import Carrito from "../components/employee/Carrito.vue";
import Productos from "../components/productos/Productos.vue";
import MisPedidos from "../components/employee/MisPedidos.vue";

const routes = [
  // --- RUTAS PÚBLICAS ---
  {
    path: "/",
    name: "InicioPublico",
    component: Inicio,
    meta: { publicOnly: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { publicOnly: true },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { publicOnly: true },
  },
  {
    path: "/reset-password/:token",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { publicOnly: true },
  },

  // --- RUTAS DE EMPLEADO (protegidas) ---
  {
    path: "/tienda",
    component: EmployeeLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "", // La ruta /tienda muestra el catálogo
        name: "Tienda",
        component: InicioLogueado,
      },
      // --- ESTA ES LA RUTA NUEVA ---
      {
        path: "campana/:id",
        name: "CampaignProducts",
        component: CampaignProducts,
      },
      {
        path: "carrito",
        name: "Carrito",
        component: Carrito,
      },
      { path: "mi-perfil", name: "MiPerfil", component: MiPerfil },
      {
        path: "mis-pedidos",
        name: "MisPedidos",
        component: MisPedidos,
      },
    ],
  },

  // --- RUTAS DE ADMIN ---
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "", redirect: "/dashboard/usuarios" },
      { path: "usuarios", name: "GestionUsuarios", component: GestionUsuarios },
      { path: "categorias", name: "Categorias", component: Categorias },

      {
        path: "productos/:categoriaId",
        name: "AdminProductos",
        component: Productos,
        props: true, // Esto permite que el ID de la categoría llegue como prop al componente
      },

      { path: "campanas", name: "Campana", component: Campana },
      { path: "calendario", name: "Calendario", component: Calendario },
      { path: "pedidos", name: "GestionPedidos", component: GestionPedidos },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/" },
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
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      localStorage.removeItem("authToken");
    }
  }

  if (to.meta.publicOnly && decodedToken) {
    if (decodedToken.rol === "Administrador") return next("/dashboard");
    return next("/tienda");
  }

  if (to.meta.requiresAuth && !decodedToken) {
    return next("/login");
  }

  if (to.meta.requiresAdmin && decodedToken?.rol !== "Administrador") {
    return next("/tienda");
  }

  next();
});

export default router;
