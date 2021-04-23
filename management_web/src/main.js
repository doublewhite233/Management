import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 路由权限
import '@/permission'

// 使用normalize.css
import 'normalize.css/normalize.css'
// 引入样式
import './styles/index.scss'

// 事件总线
Vue.prototype.$bus = new Vue()

// 使用ElementUI
import ElementUI from 'element-ui'
Vue.use(ElementUI)

// v-contextmenu
import contentmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'

// vue-animate-number
import VueAnimateNumber from 'vue-animate-number'
Vue.use(VueAnimateNumber)

Vue.use(contentmenu)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
