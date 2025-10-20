import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'virtual:windi.css' 
import 'virtual:windi-devtools' 
import './components/login/Login.css'
import './style.css'
import router from './router' 
import { initTheme } from './theme.js'

initTheme()

const app = createApp(App)
const pinia = createPinia() 

app.use(pinia) 
app.use(router) 
app.mount('#app')