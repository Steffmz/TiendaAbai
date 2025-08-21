# TiendaAbai Frontend

Interfaz web de la tienda TiendaAbai construida con [Vue 3](https://vuejs.org/) y [Vite](https://vitejs.dev/). Proporciona la capa de presentación para consumir la API del backend y gestionar el flujo de usuarios.

## Requisitos

- Node.js 18 o superior
- Dependencias instaladas con `npm install`

## Variables de entorno

El frontend necesita conocer la URL del servidor del backend. Configure un archivo `.env` en la raíz del proyecto con:

```bash
VITE_API_URL=http://localhost:3000
```

Ajuste la variable según el dominio del backend en cada entorno.

## Desarrollo

Inicie un servidor de desarrollo con recarga en caliente:

```bash
npm run dev
```

## Producción

Compile los activos optimizados y sirva una vista previa local:

```bash
npm run build
npm run preview
```

## Dependencias principales

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Buefy](https://buefy.org/)
- [Axios](https://axios-http.com/)
- [SweetAlert2](https://sweetalert2.github.io/)

Revise `package.json` para una lista completa de librerías utilizadas.

