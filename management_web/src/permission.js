import router from './router'
import { resetRouter } from './router'
import store from './store'
import { getCookie } from '@/utils/cookies.js'

// 使用导航守卫
router.beforeEach((to, from, next) => {
  // 获取cookie并判断是否存在
  const cookie = getCookie('userid')
  if (cookie !== undefined) {
    // 截取cookie中user_id部分
    const regex = /".+"/
    let user_id = cookie.match(regex)
    user_id = user_id[0].substring(1, user_id[0].length - 1)
    // 没有用户信息，发送请求获取信息
    if (store.getters.user_id === '' || store.getters.user_id !== user_id) {
      store.dispatch('getUserInfo', user_id).then(res => {
        // 根据用户权限生成路由
        store.dispatch('getRoutes', res.role).then(routes => {
          resetRouter()
          router.addRoutes(routes)
          // 确保动态路由已经完全加载
          next({ ...to, replace: true })
        })
      })
    } else {
      next()
    }
    if (to.path === '/login') {
      next({ path: '/' })
    }
  } else {
    // 没有cookie，跳转登陆页面
    if (to.path !== '/login') {
      next({ path: '/login', replace: true })
    } else {
      next()
    }
  }
})
