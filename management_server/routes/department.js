'use strict';

import express from 'express'
import department_controller from '../controller/department.js'

const router = express.Router()

// 获取信息
/*
  body:
  _id: [String], 部门_id
  */
router.post('/info', department_controller.departmentInfo)

// 创建部门
/*
  body:
  data: [Object], 需要的信息
  */
router.post('/create', department_controller.create)

// 更新部门
/*
  body:
  _id: [String], 部门_id
  data: [Object], 需要的信息
  */
router.post('/update', department_controller.update)

// 删除部门
/*
  body:
  _id: [String], 部门_id
  */
router.post('/delete', department_controller.delete)

export default router
