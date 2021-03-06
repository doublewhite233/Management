import { request } from '@/network/request.js'
import { encryptAES } from '@/utils/secret.js'
import { removeCookie } from '@/utils/cookies.js'
import { constantRoutes, adminRoutes } from '@/router'
import { SET_USER_STATE, CLEAR_USER_STATE, SET_ROUTES } from './mutation-types.js'

export default {
  // 用户登录
  login(context, payload) {
    return new Promise((resolve, reject) => {
      const { mail, password } = payload
      const encryptPass = encryptAES(password.trim())
      request({
        url: '/user/login',
        method: 'post',
        data: { mail: mail.trim(), password: encryptPass }
      }).then(res => {
        // code为0，登陆成功并储存用户信息
        if (res.code === 0) {
          context.commit(SET_USER_STATE, res.data)
          resolve(res)
        }
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  // 获取用户信息
  getUserInfo(context, _id) {
    return new Promise((resolve, reject) => {
      request({
        url: '/user/userinfo',
        method: 'post',
        data: { _id }
      }).then(res => {
        context.commit(SET_USER_STATE, res.data)
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  },

  // 退出登录
  logout(context, payload) {
    removeCookie('userid')
    context.commit(CLEAR_USER_STATE)
  },

  // 根据权限生成路由
  getRoutes(context, role) {
    return new Promise((resolve, reject) => {
      let routes = null
      if (role === 'admin') {
        routes = constantRoutes.concat(adminRoutes)
      } else {
        routes = constantRoutes
      }
      // 添加404匹配
      routes.push({ path: '*', redirect: '/404', hidden: true })
      context.commit(SET_ROUTES, routes)
      resolve(routes)
    })
  }
}
