'use strict'

const Service = require('egg').Service
const nodemailer = require('nodemailer')

const emailAddress = 'yangwebtest@163.com'
const transporter = nodemailer.createTransport({
  service: '163',
  port: 465,
  secureConnetion: true,
  auth: {
    user: emailAddress,
    pass: 'GJSWRVCEKTVBXDFB', // 邮箱授权码
  },
})

class ToolsService extends Service {
  async sendEmail(email, subject, text, html) {
    const mailOptions = {
      from: emailAddress,
      cc: emailAddress,
      to: email,
      subject,
      text,
      html,
    }
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (err) {
      console.log('email error', err)
      return false
    }
  }
}

module.exports = ToolsService
