'use strict';

import UserModel from '../models/user.js'
import md5 from 'blueimp-md5'
import { decryptAES } from '../utils/secret.js'

import fetch from 'node-fetch'
import config from 'config'

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

  // 获取用户信息
  async info(req, res, next) {
    const { _id } = req.body
    UserModel.findOne({ _id }, { password: 0 }).populate('department', 'name').exec((err, user) => {
      if(user) {
        res.send({ code: 0, data: user })
      } else {
        res.send({ code: 1, data: 'error' })
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

  // 修改密码
  async chpass(req, res, next) {
    const { _id, password } = req.body
    const decryptPass = decryptAES(password)
    UserModel.findByIdAndUpdate({ _id }, { password: md5(decryptPass) }, (err, doc) => {
      if (doc) {
        res.send({ code: 0, data: '修改密码成功' })
      } else res.send({ code: 1, data: 'error' })
    })
  }

  // github_auth
  async authGitHub(req, res, next) {
    const { code } = req.query
    const { _id } = req.query
    let path = 'https://github.com/login/oauth/access_token'
    const params = {
      client_id: config.github_client_id,
      client_secret: config.github_client_secret,
      code: code
    }
    await fetch(path, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    }).then(res => {
      return res.text()
    })
    .then(body => {
      // 解析并返回access_token
      let args = body.split('&')
      let arg = args[0].split('=')
      let access_token = arg[1]
      return access_token
    })
    .then(async token => {
      // 通过token获取用户信息
      let url = 'https://api.github.com/user'
      await fetch(url, {
        headers: {
          'Authorization': 'token ' + token
        }
      }).then( res2 => {
        return res2.json()
      })
      .then(response => {
        if (_id.trim() !== '') {
          // 存在用户_id，为用户绑定，插入数据库
          UserModel.find({ github_id: response.id }, (err, doc) => {
            if (doc) {
              if (doc.length === 0 || String(doc[0]._id) == _id) {
                UserModel.findByIdAndUpdate({ _id }, { github_id: response.id, github_name: response.login }, (errr, docc) => {
                  if (docc) {
                    res.send({ code: 0, data: '绑定成功！' })
                  } else {
                    res.send({ code: 1, data: 'error' })
                  }
                })
              } else {
                res.send({ code: 2, data: 'duplicate!' })
              }
            }
          })
        } else {
          // 无用户_id，为登陆界面唤起登录
          UserModel.findOne({ github_id: response.id }, { password: 0 }, (err, user) => {
            if(user) {
              res.cookie('userid', user._id, { maxAge: 1000*60*60*24 })
              res.send({ code: 0, data: user })
            } else {
              res.send({ code: 1, data: 'error' })
            }
          })
        }
      })
    }).catch(() => {
      res.send({ code: 1, data: 'error' })
    })
  }

  // 解绑第三方账号
  async unBind(req, res, next) {
    const { _id, type } = req.body
    if (type === 'github') {
      UserModel.findByIdAndUpdate({ _id }, { github_id: undefined, github_name: undefined }, (err, doc) => {
        if (doc) {
          res.send({ code: 0, data: 'success' })
        } else res.send({ code: 1, data: 'error' })
      })
    }
  }
}

export default new user_controller()
