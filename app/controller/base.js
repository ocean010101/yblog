'use strict'
const Controller = require('egg').Controller
// 规范
class BaseController extends Controller {
  success(data) {
    this.ctx.body = {
      code: 0,
      data,
    }
  }

  message(message) {
    this.ctx.body = {
      code: 0,
      message,
    }
  }
  error(message, code = -1) {
    this.ctx.body = {
      code,
      message,
    }
  }
}

module.exports = BaseController
