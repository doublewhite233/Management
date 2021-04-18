'use strict';

import HistoryModel from '../models/history.js'

class history_controller {
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

  // 根据issue_id获取数据
  async getData(req, res, next) {
    const { _id } = req.body
    HistoryModel.find({ issue: _id }).populate('user', 'username mail').sort({ create_at: -1 }).exec((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: doc })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 删除
  async delete(req, res, next) {
    const { _id } = req.body
    HistoryModel.deleteOne({ _id }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '删除成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new history_controller()
