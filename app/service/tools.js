'use strict'

const Service = require('egg').Service
const nodemailer = require('nodemailer')
const fse = require('fs-extra')
const path = require('path')

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

  /**
   *
   * @param {*} files // 从切片目tr录读取到的数据
   * @param {String} dest // 要生成的文件路径
   * @param {Number} size 切片大小
   */
  async mergeChunks(files, dest, size) {
    console.log('mergeChunks files, dest, size', files, dest, size)

    const pipStream = (filePath, writeStream) => new Promise(resolve => {
      console.log('mergeChunks filePath= ', filePath)

      const readStream = fse.createReadStream(filePath) // 从文件中读取一定范围的字节
      readStream.on('end', () => { // 当流中数据都写完时，删除切片文件夹
        fse.unlinkSync(filePath) // 删除碎片文件
        resolve()
      })
      readStream.pipe(writeStream)
    })
    await Promise.all(
      files.map((file, index) => {
        // 写入size大小的数据到文件
        return pipStream(file, fse.createWriteStream(dest, {
          start: index * size, // 写入的起始位置
          end: (index + 1) * size, // 写入的结束位置
        }))
      })
    )
  }

  /**
   *
   * @param {String} filePath 要生成的文件的路径
   * @param {String} hash 文件hash
   * @param {Number} size 切片大小
   */
  async mergeFile(filePath, hash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, hash) // 切片文件夹
    // 读取切片文件夹
    console.log('mergeFile chunkDir=', chunkDir)

    let chunks = await fse.readdir(chunkDir)
    // 排序
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1])
    console.log('chunks1=', chunks)
    chunks = chunks.map(cp => path.resolve(chunkDir, cp)) // 构建成完整的文件路径

    console.log('chunks2=', chunks)

    // 将从切片文件夹读取到的数据chunks合并到路径为filePath的文件
    await this.mergeChunks(chunks, filePath, size)
    if (fse.existsSync(chunkDir)) {
      console.log('=========');
      // fse.readdirSync(chunkDir).forEach(function (file) {
      //   console.log('file=',file);
      //   var curPath = chunkDir + "/" + file;
      //   if (fse.statSync(curPath).isDirectory()) { // recurse
      //     deleteFolderRecursive(curPath);
      //   } else { // delete file
      //     fse.unlinkSync(curPath);
      //   }
      // });
      fse.rmdirSync(chunkDir);
    }
  }
}

module.exports = ToolsService
