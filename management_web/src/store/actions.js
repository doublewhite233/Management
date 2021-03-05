import { request } from '@/network/request.js'
import { encryptAES } from '@/utils/secret.js'
import { SET_USER_STATE } from './mutation-types.js'

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
        resolve()
      }).catch(err => {
        reject(err)
      })
    })
  }
}
