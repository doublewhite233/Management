'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const projectSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String },
  leader: { type: String, required: true }
})