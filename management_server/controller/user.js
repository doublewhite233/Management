'use strict';

import UserModel from '../models/user.js'
import md5 from 'blueimp-md5'
import { decryptAES } from '../utils/secret.js'

class user_controller {
  // 用户登录
  async userLogin(req, res, next) {
    const { mail, password } = req.body
    const decryptPass = decryptAES(password)
    UserModel.findOne({ mail, password: md5(decryptPass) }, { password: 0 }, (err, user) => {
      if(user) {
        res.cookie('userid', user._id, { maxAge: 1000*60*60*24 })
        res.send({ code: 0, data: user })
      } else {
        res.send({ code: 1, data: '邮箱或密码不正确！' })
      }
    })
  }
  // 获取用户信息
  async userInfo(req, res, next) {
    const { _id } = req.body
    UserModel.findOne({ _id }, '_id username role', (err, user) => {
      if(user) {
        res.send({ code: 0, data: user })
      } else {
        res.clearCookie('userid')
        res.send({ code: 1, data: '登录信息错误！' })
      }
    })
  }
}

export default new user_controller()
