'use strict';
import mongoose from 'mongoose'

import IssueModel from '../models/issue.js'
import HistoryModel from '../models/history.js'
import CommentModel from '../models/comment.js'

import IssueTypeModel from '../models/issueType.js'
import SprintModel from '../models/sprint.js'

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
    let findQuery = { project: project }
    if (req.body.sprint && req.body.sprint.length !== 0) {
      findQuery.sprint = { $in: req.body.sprint }
    }
    if (req.body.user && req.body.user.length !== 0) {
      findQuery.assignee = { $in: req.body.user }
    }
    if (req.body.sprint.includes(null) && req.body.sprint.length > 1) {
      const sprint = []
      req.body.sprint.forEach((k, i) => {
        if (k !== null) sprint.push(k)
      })
      const temp = { $or: [JSON.parse(JSON.stringify(findQuery)), JSON.parse(JSON.stringify(findQuery))] }
      temp.$or[0].sprint = { $in: sprint }
      temp.$or[1].sprint = null
      temp.$or[1].state = { $ne: 'closed' }
      findQuery = temp
    }
    if (req.body.sprint.includes(null) && req.body.sprint.length === 1) {
      findQuery.state = { $ne: 'closed' }
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

  // 详情页获取项目任务情况
  async detail(req, res, next) {
    const { _id } = req.body
    const todo = await IssueModel.find({ project: _id, state: 'todo' }).countDocuments()
    const inprogress = await IssueModel.find({ project: _id, state: 'inprogress' }).countDocuments()
    const testing = await IssueModel.find({ project: _id, state: 'testing' }).countDocuments()
    const verified = await IssueModel.find({ project: _id, state: 'verified' }).countDocuments()
    const closed = await IssueModel.find({ project: _id, state: 'closed' }).countDocuments()
    if (!isNaN(todo) && !isNaN(inprogress) && !isNaN(testing) && !isNaN(verified) && !isNaN(closed)) {
      res.send({ code: 0, data: { todo, inprogress, testing, verified, closed } })
    } else res.send({ code: 1, data: 'error' })
  }

  // 任务概况图(任务类型)
  async detailByType(req, res, next) {
    const { _id } = req.body
    IssueModel.aggregate([
      { $match: { project: mongoose.Types.ObjectId(_id) }},
      { $group: { _id: '$type', count: { $sum: 1 } }},
      { $lookup: { from: 'issuetypes', localField: '_id', foreignField: '_id', as: 'issuetype' } }
    ]).exec((err, doc) => {
      if (doc) {
        if (doc.length > 0) {
          res.send({ code: 0, data: doc })
        } else {
          IssueTypeModel.find().exec((e, d) => {
            if (d) {
              res.send({ code: 0, data: d })
            } else res.send({ code: 1, data: 'error' })
          })
        }
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 燃尽图
  async burnDown(req, res, next) {
    const { _id } = req.body
    SprintModel.findById(_id).exec((err, sprint) => {
      if (sprint) {
        IssueModel.aggregate([
          { $match: { sprint: mongoose.Types.ObjectId(_id) }},
          { $group: { _id: '$sprint', count: { $sum: '$estimate' } }}
        ]).exec((e, d) => {
          if (d) {
            HistoryModel.aggregate([
              { $lookup: { from: 'issues', localField: 'issue', foreignField: '_id', as: 'issueinfo' } },
              { $unwind: '$issueinfo' },
              { $match: { 'issueinfo.sprint': mongoose.Types.ObjectId(_id), type: 'log' }},
              { $project: {
                day: { $substr: [{ "$add": ["$create_at", 28800000]}, 0, 10]},
                value: 1
              }},
              { $group: { _id: '$day', count: { $sum: '$value' } } }
            ]).exec((error, doc) => {
              if (doc) {
                res.send({ code: 0, data: { sprint, totalEstimate: d.length > 0 ? d[0].count : 0, data: doc } })
              } else res.send({ code: 1, data: 'error' })
            })
          } else res.send({ code: 1, data: 'error' })
        })
      } else res.send({ code: 1, data: 'error' })
    })
  }

  // 燃起图
  async burnUp(req, res, next) {
    const { _id } = req.body
    SprintModel.findById(_id).exec((err, sprint) => {
      if (sprint) {
        HistoryModel.aggregate([
          { $lookup: { from: 'issues', localField: 'issue', foreignField: '_id', as: 'issueinfo' } },
          { $unwind: '$issueinfo' },
          { $match: { 'issueinfo.sprint': mongoose.Types.ObjectId(_id), type: { $in: ['testing', 'verified'] } }},
          { $project: {
            day: { $substr: [{ "$add": ["$create_at", 28800000]}, 0, 10]},
            type: 1
          }},
          { $group: { _id: { day: '$day', type: '$type' } , count: { $sum: 1 } } }
        ]).exec((error, doc) => {
          if (doc) {
            res.send({ code: 0, data: { sprint, data: doc } })
          } else res.send({ code: 1, data: 'error' })
        })
      } else res.send({ code: 1, data: 'error' })
    })
  }

  // 每日新增任务统计
  async newDaily(req, res, next) {
    const { _id } = req.body
    SprintModel.findById(_id).exec((err, sprint) => {
      if (sprint) {
        HistoryModel.aggregate([
          { $lookup: { from: 'issues', localField: 'issue', foreignField: '_id', as: 'issueinfo' } },
          { $unwind: '$issueinfo' },
          { $match: { 'issueinfo.sprint': mongoose.Types.ObjectId(_id), type: 'create' }},
          { $project: {
            day: { $substr: [{ "$add": ["$create_at", 28800000]}, 0, 10]}
          }},
          { $group: { _id: '$day' , count: { $sum: 1 } } }
        ]).exec((error, doc) => {
          if (doc) {
            res.send({ code: 0, data: { sprint, data: doc } })
          } else res.send({ code: 1, data: 'error' })
        })
      } else res.send({ code: 1, data: 'error' })
    })
  }

  // 所有问题信息
  async getAll(req, res, next) {
    // 获取skip和sort、search
    const { project } = req.body
    let skip = 0
    const sort = {}
    let search = {}
    let findQuery = { project }
    if (req.body.skip && Number(req.body.skip) !== NaN) skip = Number(req.body.skip)
    if (req.body.sort && typeof(req.body.sort) === 'string') {
      sort[req.body.sort] = -1
    } else {
      sort['update_at'] = -1
    }
    if (req.body.order && Number(req.body.order) !== NaN) sort[req.body.sort] = Number(req.body.order)
    if (req.body.search) {
      search = req.body.search
    }
    if (Object.keys(search).length > 0) {
      Object.keys(search).forEach(k => {
        if (typeof(search[k]) === 'string') {
          findQuery[k] = { $regex: search[k] }
        } else {
          findQuery[k] = { $in: search[k] }
        }
      })
    }
    const totalCount = await IssueModel.find({ project }).countDocuments()
    const total = await IssueModel.find(findQuery).countDocuments()
    const query = IssueModel.find(findQuery).skip(skip).sort(sort).populate('assigner assignee', 'username mail').populate('type', 'name').populate('sprint', 'name')
    query.limit(10).exec(async (err, data) => {
      if (data) {
        res.send({ code: 0, data, total, totalCount })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new issue_controller()
