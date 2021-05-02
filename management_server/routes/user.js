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

// 管理及组织界面用户信息展示
/*
  body:
  skip: [Number], 分页查找偏移量，默认为0
  sort: [String], 排序，默认按更新时间排序
  order: [Number], 1正序；-1倒序, 默认倒序
  searchtext: [String], 查找内容
  department: [Array], 所属部门
  */
router.post('/admin', user_controller.getAdminData)

// 新建用户
/*
  body:
  username: [required, String], 用户名
  mail: [required, String], 邮箱
  password: [required, String], 密码
  role: [required, String], 用户类型
  department: [String], 所属部门
  */
router.post('/create', user_controller.create)

 // 修改
 /*
  body:
  _id: [Sring, required] 用户_id
  data: [Object], 修改信息
  */
router.post('/update', user_controller.update)

// 删除
 /*
  body:
  _id: [required, String], 用户_id
  */
router.post('/delete', user_controller.delete)

export default router
