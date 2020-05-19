'use strict'

const BaseController = require('./base')
const svgCaptcha = require('svg-captcha')
const fse = require('fs-extra')
const path = require('path')

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
  /**
   * 把文件片段上传到 public/hash/{hash+index}
   */
  async uploadFile() {
    // if (Math.random() > 0.3) {
    //   return this.ctx.status = 500
    // }
    const { ctx } = this
    const { hash, name } = ctx.request.body
    const file = ctx.request.files[0]

    // 存储文件块的文件夹
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)
    // 判断存储chunk的目录是否存在
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }
    // 把chunk 从file.filepath 移到chunkPath 目录下
    await fse.move(file.filepath, `${chunkPath}/${name}`)
    this.message('切片上传成功')
    // this.success({
    //   url: `/public/${file.filename}`,
    // })
  }

  async mergeFile() {
    const { ctx, service } = this
    // ext: 文件后缀;  size: 切片大小; hash: 文件hash
    const { ext, size, hash } = ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await service.tools.mergeFile(filePath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`,
    })
  }
  async getUploadedList(fileDir) {
    return fse.existsSync(fileDir) ? (await fse.readdir(fileDir)).filter(name => name[0] !== '.') : []
  }
  /**
   * 根据文件hash名和后缀判断文件是否存在，
   *  如果没有存在 uploaded = false, uploadedList = []
   *  如果没有存在 uploaded = true, uploadedList = 已经存在的文件碎片的索引的列表
   *
   */
  async checkFile() {
    const { ctx } = this
    const { ext, hash } = ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    let uploaded = false,
      uploadedList = []
    if (fse.existsSync(filePath)) { // 文件存在
      uploaded = true
    } else { // 文件不存在，查询名字为文件hash的问价夹是否存在
      uploadedList = await this.getUploadedList(path.resolve(this.config.UPLOAD_DIR, hash))
    }
    this.success({
      uploaded,
      uploadedList,
    })
  }
}
module.exports = UtilController
