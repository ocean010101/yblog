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

  async sendCode() {
    const { ctx, service } = this
    const email = ctx.query.email // yangwebtest@163.com
    // 生成四位验证码
    const code = Math.random().toString().slice(2, 6)
    console.log('邮箱验证码：' + code)
    ctx.session.emailcode = code
    const subject = 'vueProSumm验证码'
    const html = `
    <h1>注册验证码</h1>
    <div>
      ${code}
    </div>
    `
    const text = ''
    // 发送验证码到邮箱
    const hasSend = await service.tools.sendEmail(email, subject, text, html)
    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }
}
module.exports = UtilController
