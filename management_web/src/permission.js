import router from './router'

// 使用导航守卫
router.beforeEach((to, from, next) => {
  console.log(to)
  if (to.path === '/search') {
    router.replace('/login')
  }
  next()
})
