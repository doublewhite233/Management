'use strict';

import CommentModel from '../models/comment.js'

class comment_controller {
  // 根据issue_id获取数据
  async getData(req, res, next) {
    const { _id } = req.body
    CommentModel.find({ issue: _id }).populate('user', 'username mail').sort({ update_at: -1 }).exec((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: doc })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 新建
  async create(req, res, next) {
    const { project, issue, user, comment } = req.body
    new CommentModel({ project, issue, user, comment, create_at: new Date(), update_at: new Date() }).save((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '新建成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 删除
  async delete(req, res, next) {
    const { _id } = req.body
    CommentModel.deleteOne({ _id }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '删除成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new comment_controller()
