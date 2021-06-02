'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const resourceSchema = new Schema({
  name: { type: Number }, // 资源/设备名称
  maintainer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 负责人
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 申请人
  state: { type: String, default: 'todo', enum: ['free', 'using', 'maintain'] },
  create_at: { type: Date, required: true },
  update_at: { type: Date, required: true }
})

const Resource = mongoose.model('Resource', resourceSchema)

export default Resource
