'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const sprintSchema = new Schema({
  name: { type: String, required: true },
  goal: { type: String },
  duration: { type: String, default: '2w', enum: ['2w', '3w', '1m'] }, // 持续时长
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  state: { type: String, default: 'new', enum: ['new', 'running', 'timeout', 'closed'] },
  start_at: { type: Date },
  end_at: { type: Date }
})

const Sprint = mongoose.model('Sprint', sprintSchema)

export default Sprint
