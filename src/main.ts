import './assets/reset.css'
import './assets/global.less'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import SunIcon from './components/icons/Sun.vue'
import MoonIcon from './components/icons/Moon.vue'
import PlayIcon from './components/icons/Play.vue'
import EditIcon from './components/icons/Edit.vue'
import TrashIcon from './components/icons/Trash.vue'

const app = createApp(App)
app
  .component('SunIcon', SunIcon)
  .component('MoonIcon', MoonIcon)
  .component('PlayIcon', PlayIcon)
  .component('EditIcon', EditIcon)
  .component('TrashIcon', TrashIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
