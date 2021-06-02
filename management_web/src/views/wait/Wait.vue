<template>
  <div>跳转中...</div>
</template>

<script>
import { authGitHub } from '@/network/user.js'
import { SET_USER_STATE } from '@/store/mutation-types.js'
import { resetRouter } from '@/router'

export default {
  async mounted() {
    const user = this.$store.state.user_info._id
    const code = this.$route.query.code
    const res = await authGitHub(code, user)
    if (res && res.code === 0) {
      if (user.trim() !== '') {
        this.$router.replace({ path: '/userinfo', query: { id: user }})
      } else {
        this.$store.commit(SET_USER_STATE, res.data)
        // 登录成功，生成路由并跳转
        this.$store.dispatch('getRoutes', res.data.role).then(routes => {
          resetRouter()
          this.$router.addRoutes(routes)
        })
        window.location.replace('http://localhost:8080/mywork')
      }
    } else {
      // 出错则退出登录
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style>

</style>
