'use strict'
const marked = require('marked')
const BaseController = require('./base')

class BlogController extends BaseController {
  async create() {
    const { ctx } = this
    const { userid } = ctx.state
    const { content } = ctx.request.body
    const title = content.split('\n').find(v => {
      return v.indexOf('# ') === 0
    })
    // 组装参数
    const payload = {
      title: title.replace('# ', ''),
      content, // 内部编辑的时候看的
      content_html: marked(content), // 给外部显示看的
      author: userid,
    }
    // 调用 Service 进行业务处理
    const ret = await ctx.model.Blog.create(payload)
    console.log('create blog ret=', ret)

    // 设置响应内容和响应状态码
    if (ret._id) { // 创建文章成功
      this.success({
        id: ret._id,
        title: ret.title,
      })
    } else {
      this.error('创建文章失败')
    }
  }
  async detail() {
    const { ctx } = this
    const { id } = ctx.params
    const blog = await ctx.model.Blog.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } }).populate('author')
    // console.log("blog detail blog=", blog);
    this.success(blog)
  }
  async index() {
    const { ctx } = this
    const blogs = await ctx.model.Blog.find().populate('author')
    this.success(blogs)
  }
}
module.exports = BlogController
