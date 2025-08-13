import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:windi.css'  
import './style.css'
import router from './router' 
import './components/login/Login.css' 

const app = createApp(App)

app.use(router) 

app.mount('#app')