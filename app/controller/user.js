'use strict'

const BaseController = require('./base')
const md5 = require('md5')

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
}
module.exports = UserController