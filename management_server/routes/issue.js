'use strict';

import express from 'express'
import issue_controller from '../controller/issue.js'

const router = express.Router()

// 新建任务
/*
  body:
  data: 相关数据
  */
router.post('/create', issue_controller.create)

// 获取任务信息
/*
  body:
  project: [String, required], 项目_id;
  sprint: [Array], Sprint_id
  */
router.post('/data', issue_controller.getData)

// 移动任务至其他sprint
/*
  body:
  _id: [String, required], _id;
  sprint: [Stirng, required], Sprint_id
  */
router.post('/move', issue_controller.move)

export default router