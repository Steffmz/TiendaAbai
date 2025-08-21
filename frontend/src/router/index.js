import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";

// Vistas y layouts
import Login from "../components/login/Login.vue";
import Dashboard from "../components/layouts/Dashboard.vue";
import UserLayout from "../components/layouts/UserLayout.vue";
import DashboardIndex from "../views/admin/DashboardIndex.vue";
import GestionUsuarios from "../views/admin/GestionUsuarios.vue";
import Categorias from "../components/categorias/Categorias.vue";
import Productos from "../components/productos/Productos.vue";
import Campana from "../components/campanas/Campana.vue";
import ProductForm from "../views/admin/ProductForm.vue";
import GestionProductos from "../views/admin/GestionProductos.vue";
import UserForm from "../views/admin/UserForm.vue";
import Carrito from "../views/Carrito.vue";
import PedidosAdmin from "../views/admin/Pedidos.vue";

const routes = [
  { path: "/login", name: "Login", component: Login },
  {
    path: "/",
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/inicio" },
      { path: "inicio", name: "Inicio", component: DashboardIndex },
      { path: "carrito", name: "Carrito", component: Carrito },
    ],
  },
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
      {
        path: "pedidos",
        name: "GestionPedidos",
        component: PedidosAdmin,
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
  let decodedToken = null;

  if (token) {
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      localStorage.removeItem("authToken");
      return next("/login");
    }
  }

  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  if (to.path === "/login" && token) {
    if (decodedToken && decodedToken.rol === "Administrador") {
      return next("/");
    }
    return next();
  }

  if (to.meta.requiresAdmin) {
    if (!decodedToken || decodedToken.rol !== "Administrador") {
      localStorage.removeItem("authToken");
      return next("/login");
    }
  }

  next();
});

export default router;
