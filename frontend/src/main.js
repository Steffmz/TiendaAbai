import { createApp } from 'vue'
import App from './App.vue'
// IMPORTANTE: Importa Windi ANTES que tu CSS personalizado
import 'virtual:windi.css' 
import 'virtual:windi-devtools' 
import './components/login/Login.css'
// Tu CSS va DESPUÉS para que tenga prioridad
import './style.css'
import router from './router' 
import { initTheme } from './theme.js'

// Inicializa el tema ANTES de montar la app
initTheme()

const app = createApp(App)
app.use(router) 
app.mount('#app')