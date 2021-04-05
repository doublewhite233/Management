'use strict';

import SprintModel from '../models/sprint.js'

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
    // todo 删除时将issue sprint 清空
    SprintModel.remove({ _id }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '删除冲刺成功！' })
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
}

export default new sprint_controller()
