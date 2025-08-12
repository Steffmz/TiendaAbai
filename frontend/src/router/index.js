import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";

// Vistas y layouts
import Login from "../components/login/Login.vue";
import Dashboard from "../components/layouts/Dashboard.vue";
import DashboardIndex from "../views/admin/DashboardIndex.vue"; // <-- Importa el index
import GestionUsuarios from "../views/admin/GestionUsuarios.vue"; // <-- Importa la gestión de usuarios
import Categorias from "../components/categorias/Categorias.vue";
import Productos from "../components/productos/Productos.vue";
import Campana from "../components/campanas/Campana.vue";
import ProductForm from "../views/admin/ProductForm.vue";
import GestionProductos from "../views/admin/GestionProductos.vue";

const routes = [
  { path: "/login", name: "Login", component: Login },

  // Redirige la ruta raíz a la página principal del dashboard
  { path: "/", redirect: "/dashboard", meta: { requiresAuth: true } },

  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: DashboardIndex,
      },
      {
        path: "usuarios",
        name: "GestionUsuarios",
        component: GestionUsuarios,
      },
      {
        path: "categorias",
        name: "Categorias",
        component: Categorias,
      },
      {
        path: "productos/:categoriaId",
        name: "Productos",
        component: Productos,
        props: true,
      },
      {
        path: "campanas",
        name: "Campana",
        component: Campana,
      },

      {
        path: "productos/nuevo",
        name: "CrearProducto",
        component: ProductForm,
      },

      {
        path: "productos",
        name: "GestionProductos",
        component: GestionProductos,
      },

      {
        path: "productos/editar/:id", // Usamos un parámetro dinámico ':id'
        name: "EditarProducto",
        component: ProductForm,
        props: true, // Esto pasa el ':id' como una prop al componente
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// frontend/src/router/index.js

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");

  // CASO 1: La ruta necesita autenticación Y el usuario NO tiene token
  if (to.meta.requiresAuth && !token) {
    // Lo mandamos al login
    return next("/login");
  }

  // CASO 2: El usuario YA está logueado Y está intentando ir a la página de login
  if (to.path === "/login" && token) {
    // Lo mandamos a la página de inicio para que no vea el login de nuevo
    return next("/");
  }

  // En todos los demás casos, permite que la navegación continúe
  next();
});

export default router;
