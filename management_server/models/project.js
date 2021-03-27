'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const projectSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String },
  tag: { type: Array },
  leader: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  create_at: { type: Date, required: true },
  update_at: { type: Date, required: true }
})

const Project = mongoose.model('Project', projectSchema)

export default Project
