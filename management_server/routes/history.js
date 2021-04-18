'use strict';

import express from 'express'
import history_controller from '../controller/history.js'

const router = express.Router()

// 新建
/*
  body:
  project: [required, String], 项目_id
  issue: [required, String], 任务_id
  user: [required, String], 用户_id
  type: [required, String], 记录类型
  value: [Number], 时长h
  */
router.post('/log', history_controller.log)

// 根据issue_id获取数据
/*
  body:
  _id: [required, String], 任务_id
  */
router.post('/historyinfo', history_controller.getData)

// 删除历史
/*
  body:
  _id: [required, String], 历史记录_id
  */
router.post('/delete', history_controller.delete)

export default router
