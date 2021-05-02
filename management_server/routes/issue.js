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
  sprint: [Array], Sprint_id;
  user: [Array], user_id; 该查询不显示sprint为null且已关闭的问题
  */
router.post('/data', issue_controller.getData)

// 根据_id获取任务信息
/*
  body:
  _id: [String, required], _id;
  */
  router.post('/databyid', issue_controller.getDataByID)

// 移动任务至其他sprint
/*
  body:
  _id: [String, required], _id;
  sprint: [Stirng, required], Sprint_id
  */
router.post('/move', issue_controller.move)

// 更新任务状态
/*
  body:
  _id: [String, required], _id;
  data: 相关数据
  */
router.post('/update', issue_controller.update)

// 删除任务
/*
  body:
  _id: [required, String], 问题_id
  */
router.post('/delete', issue_controller.delete)

// 首页获取用户任务进行情况
/*
  body:
  _id: [required, String], 用户_id
  */
router.post('/mywork', issue_controller.mywork)

// 任务概况图(任务状态)
/*
  body:
  _id: [required, String], 项目_id
  */
router.post('/detail', issue_controller.detail)

// 任务概况图(任务类型)
/*
  body:
  _id: [required, String], 项目_id
  */
router.post('/detailbytype', issue_controller.detailByType)

// 燃尽图
/*
  body:
  _id: [required, String], sprint_id
  */
router.post('/burndown', issue_controller.burnDown)

// 燃起图
/*
  body:
  _id: [required, String], sprint_id
  */
router.post('/burnup', issue_controller.burnUp)

// 每日新增任务统计
/*
  body:
  _id: [required, String], sprint_id
  */
router.post('/newdaily', issue_controller.newDaily)

// 所有问题信息
/*
  body:
  project: [required, String], 项目_id
  skip: [Number], 分页查找偏移量，默认为0
  sort: [String], 排序，默认按update_at排序
  order: [Number], 1正序；-1倒序, 默认倒序
  search: [Object], 查找内容
  */
  router.post('/all', issue_controller.getAll)

export default router