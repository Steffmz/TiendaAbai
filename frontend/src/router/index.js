import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";

// Vistas y layouts
import Login from "../components/login/Login.vue";
import Dashboard from "../components/layouts/Dashboard.vue";
import DashboardIndex from "../views/admin/DashboardIndex.vue";
import GestionUsuarios from "../views/admin/GestionUsuarios.vue"; 
import Categorias from "../components/categorias/Categorias.vue";
import Productos from "../components/productos/Productos.vue";
import Campana from "../components/campanas/Campana.vue";
import ProductForm from "../views/admin/ProductForm.vue";
import GestionProductos from "../views/admin/GestionProductos.vue";
import UserForm from "../views/admin/UserForm.vue";

const routes = [
  { path: "/login", name: "Login", component: Login },

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
        path: "usuarios/nuevo",
        name: "CrearUsuario",
        component: UserForm,
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
        path: "productos/editar/:id",
        name: "EditarProducto",
        component: ProductForm,
        props: true,
      },

      {
        path: "usuarios/editar/:id",
        name: "EditarUsuario",
        component: UserForm,
        props: true,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

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
