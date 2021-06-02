'use strict';

import express from 'express'
import resource_controller from '../controller/resource.js'

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
router.post('/log', resource_controller.log)

export default router
