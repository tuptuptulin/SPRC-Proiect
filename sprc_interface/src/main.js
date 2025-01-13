import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from 'axios'

/*https://www.youtube.com/watch?v=7pL9vdpSvnY*/

const app = createApp(App)

axios.defaults.baseURL = 'http://localhost:8000'

app.use(createPinia())
app.use(router, axios)

app.mount('#app')
