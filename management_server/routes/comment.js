'use strict';

import express from 'express'
import comment_controller from '../controller/comment.js'

const router = express.Router()

// 根据issue_id获取数据
/*
  body:
  _id: [required, String], 任务_id
  */
router.post('/commentinfo', comment_controller.getData)

// 新建
/*
  body:
  project: [required, String], 项目_id
  issue: [required, String], 任务_id
  user: [required, String], 用户_id
  comment: [required, String], 评论内容
  */
router.post('/create', comment_controller.create)

// 删除
/*
  body:
  _id: [required, String], 评论_id
  */
router.post('/delete', comment_controller.delete)

export default router
