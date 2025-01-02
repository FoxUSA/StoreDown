import { createApp } from 'vue'
import './plugins/toasted'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'
import Toasted from '@hoppscotch/vue-toasted'

// Vue.config.productionTip = false

createApp(App)
  .use(router)
  .use(vuetify)
  .use(Toasted, {
    duration: '2000',
    position: 'bottom-right',
    keepOnHover: true
  })
  .mount('#app')
