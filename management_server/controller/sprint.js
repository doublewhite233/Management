'use strict';

import SprintModel from '../models/sprint.js'
import IssueModel from '../models/issue.js'

class sprint_controller {
  async create(req, res, next) {
    const { name, project } = req.body
    new SprintModel({ name, project }).save((err, data) => {
      if (data) {
        res.send({ code: 0, data: '新建冲刺成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  async delete(req, res, next) {
    const { _id } = req.body
    // 删除时将issue sprint 清空
    SprintModel.deleteOne({ _id }, (err, doc) => {
      if (doc) {
        IssueModel.updateMany({ sprint: _id }, { sprint: null }, (e, docs) => {
          if (docs) {
            res.send({ code: 0, data: '删除冲刺成功！' })
          } else {
            res.send({ code: 1, data: 'error' })
          }
        })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 修改
  async update(req, res, next) {
    const { _id } = req.body
    SprintModel.findByIdAndUpdate({ _id }, { ... req.body }, (err, oldDoc) => {
      if (oldDoc) {
        res.send({ code: 0, data: '修改成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  async getData(req, res, next) {
    const { state, project } = req.body
    let skip = 0
    if (req.body.skip && Number(req.body.skip) !== NaN) skip = Number(req.body.skip)
    const total = await SprintModel.find({ state: { $in: state }, project }, { skip }).countDocuments()
    SprintModel.find({ state: { $in: state }, project }, { skip }, (err, sprints) => {
      if (sprints) {
        res.send({ code: 0, data: sprints, total })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 关闭冲刺
  async close(req, res, next) {
    const { _id } = req.body
    SprintModel.findByIdAndUpdate({ _id }, { state: 'closed', end_at: new Date() }, (err, doc) => {
      if (doc) {
        IssueModel.updateMany({ sprint: _id, state: { $ne: 'closed' } }, { sprint: null }, (e, d) => {
          if (d) {
            res.send({ code: 0, data: 'success' })
          } else res.send({ code: 1, data: 'error' })
        })
      } else res.send({ code: 1, data: 'error' })
    })
  }

  // 历史冲刺信息
  async getReport(req, res, next) {
    // 获取skip和sort、search
    const { project } = req.body
    let skip = 0
    const sort = {}
    let search = ''
    let findQuery = { project }
    if (req.body.skip && Number(req.body.skip) !== NaN) skip = Number(req.body.skip)
    if (req.body.sort && typeof(req.body.sort) === 'string') {
      sort[req.body.sort] = -1
    } else {
      sort['start_at'] = -1
    }
    if (req.body.order && Number(req.body.order) !== NaN) sort[req.body.sort] = Number(req.body.order)
    if (req.body.search) {
      search = req.body.search
    }
    if (search !== '') {
      findQuery.name = { $regex: search }
    }
    const totalCount = await SprintModel.find({ project }).countDocuments()
    const total = await SprintModel.find(findQuery).countDocuments()
    const query = SprintModel.find(findQuery).skip(skip).sort(sort)
    query.limit(10).exec(async (err, data) => {
      if (data) {
        res.send({ code: 0, data, total, totalCount })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new sprint_controller()
