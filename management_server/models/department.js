'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const departmentSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String },
  parent: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
  children: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
  leader: { type: Schema.Types.ObjectId, ref: 'User' }
})

const Comment = mongoose.model('Department', departmentSchema)

export default Comment