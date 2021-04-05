'use strict';

import express from 'express'
import sprint_controller from '../controller/sprint.js'

const router = express.Router()

// 新建冲刺
/*
  body:
  name: [required, String], 项目名称,
  project: [ObjectId, required], 所属项目_id
  */
router.post('/create', sprint_controller.create)

// 删除
 /*
  body:
  _id: [required, String], _id
  */
router.post('/delete', sprint_controller.delete)

 // 修改
 /*
  body:
  _id: [Sring, required] sprint _id
  name: [String], 名称
  goal: [String], 冲刺目标
  duration: [String], 持续时间
  state: [String], 状态
  start_at: [Date], 开始时间
  end_at: [Date], 结束时间
  */
router.post('/update', sprint_controller.update)

// 冲刺信息展示
/*
  params:
  skip: [Number], 分页查找偏移量，默认为0
  state: [Array, required], 问题状态 e.g['running']
  project: [ObjectId, required], 所属项目_id
  search: [String], todo
  */
router.post('/data', sprint_controller.getData)

export default router
