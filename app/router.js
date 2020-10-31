'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  const jwt = app.middleware.jwt({ app })
  router.get('/', controller.home.index)
  router.get('/captcha', controller.util.captcha)
  router.get('/sendCode', controller.util.sendCode)
  router.post('/uploadFile', controller.util.uploadFile)
  router.post('/mergeFile', controller.util.mergeFile)
  router.post('/checkFile', controller.util.checkFile)

  router.group({ name: 'user', prefix: '/user' }, router => {
    const { register, login, info } = controller.user
    router.post('/register', register)
    router.post('/login', login)
    router.get('/info', jwt, info)
  })
  router.group({ name: 'blog', prefix: '/blog' }, router => {
    const { create } = controller.blog
    router.post('/create', jwt, create)
  })
}
