'use strict';

import HistoryModel from '../models/history.js'

class history_controller {
  // 新建
  async log(req, res, next) {
    const { issue, user, type } = req.body
    let value = null
    if (req.body.value) value = req.body.value
    new HistoryModel({ issue, user, type, value, create_at: new Date() }).save((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '新建log成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new history_controller()
