'use strict';

import UserModel from '../models/user.js'
import md5 from 'blueimp-md5'
import { decryptAES } from '../utils/secret.js'

class user_controller {
  // 用户登录
  async userLogin(req, res, next) {
    const { mail, password } = req.body
    const decryptPass = decryptAES(password)
    UserModel.findOne({ mail, password: md5(decryptPass) }, { password: 0 }, (err, user) => {
      if(user) {
        res.cookie('userid', user._id, { maxAge: 1000*60*60*24 })
        res.send({ code: 0, data: user })
      } else {
        res.send({ code: 1, data: '邮箱或密码不正确！' })
      }
    })
  }
  // 获取用户信息
  async userInfo(req, res, next) {
    const { _id } = req.body
    UserModel.findOne({ _id }, '_id username role', (err, user) => {
      if(user) {
        res.send({ code: 0, data: user })
      } else {
        res.clearCookie('userid')
        res.send({ code: 1, data: '登录信息错误！' })
      }
    })
  }
  // 获取所有用户信息
  async userData(req, res, next) {
    let input = ''
    if (req.query.input) input = req.query.input
    UserModel.find({ $or: [{ username: { $regex: input }}, { mail: { $regex: input }}]}, '_id username mail', (err, user) => {
      if (user) {
        res.send({ code: 0, data: user })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 用户管理页面获取用户信息
  async getAdminData(req, res, next) {
    // 获取skip和sort、search
    let skip = 0
    const sort = {}
    let search = ''
    let department = []
    let findQuery = { $and: [] }
    if (req.body.skip && Number(req.body.skip) !== NaN) skip = Number(req.body.skip)
    if (req.body.sort && typeof(req.body.sort) === 'string') {
      sort[req.body.sort] = -1
    } else {
      sort['update_at'] = -1
    }
    if (req.body.order && Number(req.body.order) !== NaN) sort[req.body.sort] = Number(req.body.order)
    if (req.body.searchtext) {
      search = req.body.searchtext
    }
    if (req.body.department) department = req.body.department
    if (department && department.length > 0) {
      findQuery.$and.push({ department: { $in: department }})
    }
    if (search !== '') {
      findQuery.$and.push({ $or: [{ username: { $regex: search }}, { mail: { $regex: search }}]})
    }
    // console.log(findQuery)
    const totalCount = await UserModel.countDocuments()
    const total = await UserModel.find(findQuery.$and.length > 0 ? findQuery : null).countDocuments()
    const query = UserModel.find(findQuery.$and.length > 0 ? findQuery : null).skip(skip).sort(sort)
    query.limit(10).exec(async (err, data) => {
      if (data) {
        res.send({ code: 0, data, total, totalCount })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 新建
  async create(req, res, next) {
    const { username, mail, password, role, department } = req.body
    const decryptPass = decryptAES(password)
    UserModel.findOne({ mail }, { password: 0 }, (err, user) => {
      if (user === null) {
        new UserModel({ username, mail, password: md5(decryptPass), role, department, create_at: new Date(), update_at: new Date() }).save((err, data) => {
          if (data) {
            res.send({ code: 0, data: '新建成功！' })
          } else {
            res.send({ code: 1, data: 'error' })
          }
        })
      } else {
        res.send({ code: 2, data: '登录邮箱重复!' })
      }
    })
  }

  // 修改
  async update(req, res, next) {
    const { _id, data } = req.body
    UserModel.findByIdAndUpdate({ _id }, { ... data, update_at: new Date() }, (err, oldDoc) => {
      console.log(err)
      if (oldDoc) {
        res.send({ code: 0, data: '修改成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }

  // 删除
  async delete(req, res, next) {
    const { _id } = req.body
    UserModel.deleteOne({ _id }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '删除成功！' })
      } else {
        res.send({ code: 1, data: 'error' })
      }
    })
  }
}

export default new user_controller()
