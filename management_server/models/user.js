'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema({
  mail: { type: String, required: true, unique: true }, // 通过邮箱登录
  password: { type: String, required: true },
  username: { type: String },
  role: { type: String, default: 'user', enum: ['admin', 'user'] }, // 用户身份
  // todo
  extra: { type: Map, of: String }
})

const User = mongoose.model('User', userSchema)

export default User
