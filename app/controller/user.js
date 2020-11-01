'use strict'

const BaseController = require('./base')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
}
const hashSalt = 'yblogHashSalt'
class UserController extends BaseController {
  async checkEmail(email) {
    const user = this.ctx.model.User.findOne({ email })
    return user
  }
  async register() {
    const { ctx } = this
    try {
      // 校验参数
      ctx.validate(createRule)
    } catch (e) {
      return this.error('参数校验失败', -1, e.errors)
    }
    // 获取数据
    const { email, nickname, captcha, password } = ctx.request.body
    // console.log(email, nickname, captcha, password );
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('图片验证码错误')
    }
    if (await this.checkEmail(email)) {
      return this.error('邮箱已经存在')
    }
    const ret = ctx.model.User.create({
      email,
      nickname,
      password: md5(password + hashSalt),
    })
    if (ret._id) {
      this.message('注册成功')
    } else {
      this.message('注册失败')
    }
  }

  async login() {
    const { ctx, app } = this
    const { email, password, captcha, emailcode } = ctx.request.body
    console.log('login ', email, password, captcha, emailcode)
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('图片验证码错误')
    }
    if (emailcode !== ctx.session.emailcode) {
      return this.error('邮箱验证码错误')
    }
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + hashSalt),
    })
    if (!user) {
      return this.error('用户名或密码错误')
    }
    // 把用户的信息加密成token 返回

    const token = jwt.sign({
      _id: user._id,
      email,
    }, app.config.jwt.secret, {
      expiresIn: '10h', // 过期时间
    })

    this.success({
      token,
      email,
      nickname: user.nickname,
    })
  }

  async info() {
    const { ctx } = this
    // 从token 中读取用户信息
    const { email } = ctx.state
    console.log('info email=', email)
    const user = await this.checkEmail(email)
    this.success(user)
  }
  /**
   * 判断是否关注文章作者
   */
  async isFollow() {
    const { ctx } = this
    const me = await this.ctx.model.User.findById(ctx.state.userid)
    // 在当前用户的关注列表following 中查找文章作者id
    const isFollow = !!me.following.find(v => v.toString() === ctx.params.id)
    this.success({
      isFollow,
    })
  }
  /**
   * 关注文章作者
   */
  async follow() {
    const { ctx } = this
    // 获取当前用户
    const me = await this.ctx.model.User.findById(ctx.state.userid)
    // 获取文章作者
    const blogAuthor = ctx.params.id
    const isFollow = !!me.following.find(v => v.toString() === blogAuthor)
    if (!isFollow) {
      me.following.push(blogAuthor) // 把文章作者添加到关注列表
      me.save()
      this.message('关注成功')
    }
  }
  /**
   * 取消关注文章作者
   */
  async unfollow() {
    const { ctx } = this
    // 获取当前用户
    const me = await this.ctx.model.User.findById(ctx.state.userid)
    // 在当前用户的关注列表following 中查找文章作者id
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)// 从关注列表中把文章作者删除
      me.save()
      this.message('取消关注成功')
    }
  }
  /**
   * 获取文章被点赞和踩的状态
   */
  async blogStatus() {
    const { ctx } = this
    // 获取当前用户
    const me = await ctx.model.User.findById(ctx.state.userid)
    // 获取文章id
    const blogId = ctx.params.id
    const like = !!me.likeBlog.find(id => id.toString() === blogId)
    const dislike = !!me.dislikeBlog.find(id => id.toString() === blogId)
    this.success({
      like, dislike,
    })
  }
  /**
   * 点赞这个文章
   */
  async likeBlog() {
    const { ctx } = this
    // 获取当前用户
    const me = await ctx.model.User.findById(ctx.state.userid)
    // 获取文章id
    const blogId = ctx.params.id
    // 如果当前用户喜欢的文章列表中没有当前文章
    if (!me.likeBlog.find(id => id.toString() === blogId)) {
      me.likeBlog.push(blogId) // 将当前文章加入喜欢列表
      me.save()
      // 更新文章赞个数like
      await ctx.model.Blog.findByIdAndUpdate(blogId, { $inc: { like: 1 } })
      return this.message('点赞成功')
    }
    this.message('已经点赞过')
  }
  /**
   * 取消点赞这个文章
   */
  async cancelLikeBlog() {
    const { ctx } = this
    // 获取当前用户
    const me = await ctx.model.User.findById(ctx.state.userid)
    // 获取文章id
    const blogId = ctx.params.id
    const index = me.likeBlog.map(id => id.toString()).indexOf(blogId)
    if (index > -1) {
      me.likeBlog.splice(index, 1) // 将当前文章从喜欢列表likeBlog字段中移除
      me.save()
      await ctx.model.Blog.findByIdAndUpdate(blogId, { $inc: { like: -1 } })
      return this.message('取消点赞成功')
    }
    this.message('已经取消点赞')
  }
  /**
   * 踩这个文章
   */
  async dislikeBlog() {
    const { ctx } = this
    // 获取当前用户
    const me = await ctx.model.User.findById(ctx.state.userid)
    // 获取文章id
    const blogId = ctx.params.id
    if (!me.dislikeBlog.find(id => id.toString() === blogId)) {
      me.dislikeBlog.push(blogId)
      me.save()
      // 更新文章踩个数dislike
      await ctx.model.Blog.findByIdAndUpdate(blogId, { $inc: { dislike: 1 } })
      return this.message('成功踩')
    }
    this.message('已经踩过了')
  }
  /**
   * 取消不喜欢这个作者的文章
   */
  async cancelDislikeBlog() {
    const { ctx } = this
    // 获取当前用户
    const me = await ctx.model.User.findById(ctx.state.userid)
    // 获取文章id
    const blogId = ctx.params.id
    const index = me.dislikeBlog.map(id => id.toString()).indexOf(blogId)
    if (index > -1) {
      me.dislikeBlog.splice(index, 1)
      me.save()
      await ctx.model.Blog.findByIdAndUpdate(blogId, { $inc: { dislike: -1 } })
      return this.message('取消踩成功')

    }
    this.message('已经取消踩了')
  }
}
module.exports = UserController
