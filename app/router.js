'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  router.get('/', controller.home.index)
  router.get('/captcha', controller.util.captcha)
  router.get('/sendCode', controller.util.sendCode)
  router.group({ name: 'user', prefix: '/user' }, router => {
    const { register, login } = controller.user
    router.post('/register', register)
    router.post('/login', login)
  })
}
