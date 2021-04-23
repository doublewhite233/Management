'use strict';

import IssueModel from '../models/issue.js'
import HistoryModel from '../models/history.js'
import CommentModel from '../models/comment.js'

class issue_controller {
  // 新建任务
  async create(req, res, next) {
    const { data } = req.body
    new IssueModel({ ...data, create_at: new Date(), update_at: new Date() }).save((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: doc })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 获取任务信息
  async getData(req, res, next) {
    const { project } = req.body
    const findQuery = { project: project }
    if (req.body.sprint && req.body.sprint.length !== 0) {
      findQuery.sprint = { $in: req.body.sprint }
    }
    if (req.body.user && req.body.user.length !== 0) {
      findQuery.assignee = { $in: req.body.user }
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

  // 根据_id获取任务信息
  async getDataByID(req, res, next) {
    const { _id } = req.body
    IssueModel.findById(_id).populate('assigner assignee', 'username mail').populate('project', 'name').populate('type', 'name').populate('sprint', 'name').exec((err, doc) => {
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
    IssueModel.findByIdAndUpdate({ _id }, { sprint, update_at: new Date() }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '修改成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 更新任务状态
  async update(req, res, next) {
    const { _id, data } = req.body
    IssueModel.findByIdAndUpdate({ _id }, { ...data, update_at: new Date() }, (err, doc) => {
      console.log(err)
      if (doc) {
        res.send({ code: 0, data: '修改成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 删除
  async delete(req, res, next) {
    const { _id } = req.body
    IssueModel.deleteOne({ _id }, (err, doc) => {
      if (doc) {
        CommentModel.deleteMany({ issue: _id }, (error, doo) => {
          if (doo) {
            HistoryModel.deleteMany({ issue: _id }, (e, d) => {
              if (d) {
                res.send({ code: 0, data: '删除成功！' })
              } else {
                res.send({ code: 1, data: 'error' })
              }
            })
          } else {
            res.send({ code: 1, data: 'error' })
          }
        })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 首页获取用户任务进行情况
  async mywork(req, res, next) {
    const { _id } = req.body
    const assigner = await IssueModel.find({ assigner: _id, state: { $in: ['todo', 'inprogress', 'testing', 'verified']} }).countDocuments()
    const unfinished = await IssueModel.find({ assignee: _id, state: { $in: ['todo', 'inprogress', 'testing', 'verified']} }).countDocuments()
    const todo = await IssueModel.find({ assignee: _id, state: 'todo' }).countDocuments()
    const inprogress = await IssueModel.find({ assignee: _id, state: 'inprogress' }).countDocuments()
    const testing = await IssueModel.find({ assignee: _id, state: 'testing' }).countDocuments()
    const verified = await IssueModel.find({ assignee: _id, state: 'verified' }).countDocuments()
    if (!isNaN(assigner) && !isNaN(unfinished) && !isNaN(todo) && !isNaN(inprogress) && !isNaN(testing) && !isNaN(verified)) {
      res.send({ code: 0, data: { assigner, unfinished, todo, inprogress, testing, verified } })
    } else res.send({ code: 1, data: 'error' })
  }
}

export default new issue_controller()
