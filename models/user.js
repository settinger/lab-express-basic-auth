'use strict';
const mongoose = require('mongoose');

// User model goes here
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('User', userSchema);