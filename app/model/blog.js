'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const BlogSchema = new Schema({
    // 标题
    title: { type: String, required: true },
    // 内容
    content: { type: String, required: true },
    content_html: { type: String, required: true },
    // 访问量
    views: { type: Number, required: false, default: 1 },
    // 作者
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // 赞数量
    like: { type: Number, required: false, default: 0 },
    // 踩数量
    dislike: { type: Number, required: false, default: 0 },
  }, { timestamps: true })

  return mongoose.model('Blog', BlogSchema)
}
