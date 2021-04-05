'use strict';

import express from 'express'
import history_controller from '../controller/history.js'

const router = express.Router()

// 新建
/*
  body:
  issue: [required, String], 任务_id
  user: [required, String], 用户_id
  type: [required, String], 记录类型
  value: [Number], 时长h
  */
router.post('/log', history_controller.log)

export default router
