'use strict'

const BaseController = require('./base')
const svgCaptcha = require('svg-captcha')
class UtilController extends BaseController {
  async captcha() {
    // 生成图形验证码
    const { ctx } = this
    // 调用 Service 进行业务处理
    const captcha = await svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    })
    console.log('图形验证码' + captcha.text)
    // 注册用户时需要检查图形验证码是否匹配，所以需要将验证码保存到上下文中
    ctx.session.captcha = captcha.text
    // 通过 HTTP 将结果响应给用户
    ctx.response.type = 'image/svg+xml'
    ctx.body = captcha.data
  }
}
module.exports = UtilController
