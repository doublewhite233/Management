'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const commentSchema = new Schema({
  comment: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  project: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
  create_at: { type: Date, required: true },
  update_at: { type: Date, required: true }
})

const Comment = mongoose.model('Comment', commentSchema)

export default Comment