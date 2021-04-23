'use strict';

import DepartmentModel from '../models/department.js'

class department_controller {
  // 获取信息
  async departmentInfo(req, res, next) {
    let _id = null
    if (req.body._id) _id = req.body._id
    DepartmentModel.find(_id === null ? null : { _id }).populate({ path: 'parent', populate: 'parent', select: 'name' }).populate('leader', 'username').exec((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: doc })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 创建
  async create(req, res, next) {
    const { data } = req.body
    new DepartmentModel({ ...data }).save((err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '新建成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 修改
  async update(req, res, next) {
    const { _id, data } = req.body
    DepartmentModel.findByIdAndUpdate({ _id }, { ...data }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '更新成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 删除
  async delete(req, res, next) {
    const { _id } = req.body
    DepartmentModel.deleteOne({ _id }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '删除成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new department_controller()
