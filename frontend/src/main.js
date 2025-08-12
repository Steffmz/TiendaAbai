// frontend/src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:windi.css'  
import './style.css'
import router from './router' // 1. Importa el router
import './components/login/Login.css' // Importa tus estilos

const app = createApp(App)

app.use(router) // ✅ 2. ESTA LÍNEA INSTALA EL ROUTER EN TU APP

app.mount('#app')