'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const issueTypeSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String }
})

const IssueType = mongoose.model('IssueType', issueTypeSchema)

export default IssueType
