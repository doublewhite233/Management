import { request } from '@/network/request.js'
import { encryptAES } from '@/utils/secret.js'
import { removeCookie } from '@/utils/cookies.js'
import { constantRoutes, adminRoutes } from '@/router'
import { SET_USER_STATE, CLEAR_USER_STATE, SET_ROUTES, SET_PROJECT_INFO, CLEAR_PROJECT_INFO, SET_LOADING_STATE } from './mutation-types.js'

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

  // 获取项目信息
  getProjectInfo(context, payload) {
    return new Promise((resolve, reject) => {
      context.commit(CLEAR_PROJECT_INFO)
      request({
        url: '/project/data'
      }).then(res => {
        if (res.code === 0 && res.totalCount > 0) {
          // 设置加载状态为true
          context.commit(SET_LOADING_STATE, true)
          context.commit(SET_PROJECT_INFO, res.data[0])
        }
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  // 设置项目信息
  setProjectInfo(context, payload) {
    const { id } = payload
    return new Promise((resolve, reject) => {
      request({
        url: '/project/databyid',
        method: 'post',
        data: { id }
      }).then(res => {
        if (res.code === 0) {
          context.commit(SET_LOADING_STATE, true)
          context.commit(SET_PROJECT_INFO, res.data)
          resolve(res.data)
        }
      }).catch(err => {
        reject(err)
      })
    })
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
