'use strict';

import IssueModel from '../models/issue.js'

class issue_controller {
  // 新建任务
  async create(req, res, next) {
    const { data } = req.body
    new IssueModel({ ...data, create_at: new Date(), update_at: new Date() }).save((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '新建任务成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 获取任务信息
  async getData(req, res, next) {
    const { project } = req.body
    const findQuery = { project: project }
    if (req.body.sprint) {
      findQuery.sprint = { $in: req.body.sprint }
    }
    const query = IssueModel.find(findQuery, { desc: 0 }).populate('type', 'name').populate('assigner assignee', 'username mail').sort({ 'priority': 1 })
    query.exec(async (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: doc })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 移动任务至其他sprint
  async move(req, res, next) {
    const { _id, sprint } = req.body
    IssueModel.findByIdAndUpdate({ _id }, { sprint, update_at: new Date() }, (err, oldDoc) => {
      if (oldDoc) {
        res.send({ code: 0, data: '修改成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new issue_controller()
