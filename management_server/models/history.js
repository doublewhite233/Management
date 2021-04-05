'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const historySchema = new Schema({
  value: { type: Number }, // 单位h, 记录log
  issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  type: { type: String, enum: ['create', 'start', 'log'] },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

const History = mongoose.model('History', historySchema)

export default History
