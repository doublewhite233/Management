'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const historySchema = new Schema({
  value: { type: Number }, // 单位h, 记录log
  issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  type: { type: String, enum: ['create', 'todo', 'inprogress', 'log', 'testing', 'verified', 'closed'] },
  // todo: change state to todo; create: first state when create[type=todo]
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  create_at: { type: Date, required: true }
})

const History = mongoose.model('History', historySchema)

export default History
