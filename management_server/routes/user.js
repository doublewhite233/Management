'use strict';

import express from 'express'
import user_controller from '../controller/user.js'

const router = express.Router()

// 用户登录
/*
  body:
  mail: [required, String], 用户邮箱
  password: [required, String], 密码
  */
router.post('/login', user_controller.userLogin)

// 获取用户信息
/*
  body:
  _id: [required, String], 用户id
  */
router.post('/userinfo', user_controller.userInfo)

// 获取所有用户信息
/*
  params:
  input: [String], 用户名或邮箱查找的关键词
  */
router.get('/data', user_controller.userData)

export default router
