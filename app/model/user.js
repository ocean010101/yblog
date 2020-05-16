'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const UserSchema = new Schema({
    __v: { type: Number, select: false },
    email: { type: String, required: true },
    nickname: { type: String, required: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, required: false, default: '/user.png' }, // 用户头像
  }, { timestamps: true })
  return mongoose.model('User', UserSchema)
}
