'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const issueSchema = new Schema({
  name: { type: String, required: true },
  priority: { type: Number, enum: [1, 2, 3, 4], default: 3 }, // 数字越小越重要
  type: { type: Schema.Types.ObjectId, required: true, ref: 'IssueType' },
  project: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
  desc: { type: String },
  assigner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' },
  estimate: { type: Number }, // 预计花费时间，统一采用h为单位
  logtime: { type: Number }, // 剩余时间
  sprint: { type: Schema.Types.ObjectId, ref: 'Sprint' },
  resource: { type: Schema.Types.ObjectId, ref: 'Resource' },
  state: { type: String, default: 'todo', enum: ['todo', 'inprogress', 'testing', 'verified', 'closed'] },
  create_at: { type: Date, required: true },
  update_at: { type: Date, required: true }
})

const Issue = mongoose.model('Issue', issueSchema)

export default Issue
