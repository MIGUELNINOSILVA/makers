import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles.css'

import App from './App.vue'
import router from './router'
import './config/axios'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
