'use strict'

// 用于解析token
const jwt = require('jsonwebtoken')
module.exports = ({ app }) => {
  return async function verify(ctx, next) {
    // 判断请求报文中是否包含token
    if (!ctx.request.header.authorization) {
      ctx.body = {
        code: -666,
        message: '用户没有登录',
      }
      return
    }
    // 从响应报文中获取token
    const token = ctx.request.header.authorization.replace('Bearer ', '')
    // jwt验证
    try {
      const ret = await jwt.verify(token, app.config.jwt.secret)
      console.log('中间件获取token信息', ret)
      ctx.state.email = ret.email
      ctx.state.userid = ret._id
      await next()
    } catch (err) {
      console.log('解析token err=', err)

      if (err.name === 'TokenExpiredError') { // token 过期
        ctx.state.email = ''
        ctx.state.userid = ''
        ctx.body = {
          code: -666,
          message: 'token 过期， 请重新登录',
        }
      } else {
        ctx.body = {
          code: -1,
          message: '用户信息出错',
        }
      }
    }
  }
}
