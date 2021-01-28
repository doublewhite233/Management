import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 使用normalize.css
import 'normalize.css/normalize.css'
// 引入样式
import './styles/index.scss'

// 使用ElementUI
import ElementUI from 'element-ui'
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
