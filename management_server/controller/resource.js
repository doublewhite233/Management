'use strict';

import ResourceModel from '../models/resource.js'

class resource_controller {
  // 新建
  async log(req, res, next) {
    const { project, issue, user, type } = req.body
    let value = null
    if (req.body.value) value = req.body.value
    new HistoryModel({ project, issue, user, type, value, create_at: new Date() }).save((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '新建log成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new resource_controller()
