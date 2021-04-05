'use strict';

import express from 'express'
import project_controller from '../controller/project.js'

const router = express.Router()

// 项目信息展示
/*
  params:
  skip: [Number], 分页查找偏移量，默认为0
  sort: [String], 排序，默认按更新时间排序
  order: [Number], 1正序；-1倒序, 默认倒序
  searchcol: [String], 查找列
  searchtext: [String], 查找内容
  */
router.get('/data', project_controller.getData)

// 新建项目
/*
  body:
  name: [required, String], 项目名称
  desc: [String], 项目描述
  tag: [Array], 项目标签
  leader: [required, String], 项目负责人_id
  */
router.post('/create', project_controller.create)

 // 删除项目
 /*
  body:
  _id: [required, String], 项目_id
  */
router.post('/delete', project_controller.delete)

 // 修改项目
 /*
  body:
  _id: [Sring, required] 项目_id
  name: [String], 项目名称
  desc: [String], 项目描述
  tag: [Array], 项目标签
  leader: [String], 项目负责人_id
  */
router.post('/update', project_controller.update)

 // 获取项目标签
router.get('/gettag', project_controller.getTag)

// 获取项目信息
/*
  params:
  input: [String], 查找的关键词
  */
router.get('/projectlist', project_controller.getProjectList)

// 根据id获得项目信息
 /*
  body:
  _id: [required, String], 项目_id
  */
router.post('/databyid', project_controller.getDataById)

export default router
