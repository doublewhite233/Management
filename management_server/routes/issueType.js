'use strict';

import express from 'express'
import issuetype_controller from '../controller/issueType.js'

const router = express.Router()

// 获取问题类型信息
router.get('/data', issuetype_controller.getData)

// 新建或更新问题类型
 /*
  body:
  type: [required, object] { name, desc, [_id] }
  */
router.post('/update', issuetype_controller.update)

 // 删除问题类型
  /*
  body:
  _id: [required, String], _id
  */
router.post('/delete', issuetype_controller.delete)

export default router