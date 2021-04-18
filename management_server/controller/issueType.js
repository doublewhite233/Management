'use strict';

import IssueTypeModel from '../models/issueType.js'

class issuetype_controller {
  // 获取问题类型信息
  async getData(req, res, next) {
    IssueTypeModel.find((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: doc })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 新建或更新问题类型
  async update(req, res, next) {
    const { type } = req.body
    if (type._id) {
      // update
      IssueTypeModel.findByIdAndUpdate({ _id: type._id }, { name: type.name, desc: type.desc }, (err, doc) => {
        if (doc) {
          res.send({ code: 0, data: '修改成功！' })
        } else {
          res.send({ code: 1, data: 'error' })
        }
      })
    } else {
      // create
      new IssueTypeModel({ name: type.name, desc: type.desc }).save((err, data) => {
        if (data) {
          res.send({ code: 0, data: '新建成功！' })
        } else {
          res.send({ code: 1, data: 'error' })
        }
      })
    }
  }

  // 删除
  async delete(req, res, next) {
    const { _id } = req.body
    IssueTypeModel.deleteOne({ _id }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '删除成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new issuetype_controller()
