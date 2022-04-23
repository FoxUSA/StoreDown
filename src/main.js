import Vue from 'vue'
import './plugins/vuetify'
import './plugins/toasted'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'

Vue.config.productionTip = false

new Vue({
  router,
  render (h) { return h(App) }
}).$mount('#app')

// Require login
router.beforeEach()
