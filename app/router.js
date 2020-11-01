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
    const { register, login, info,
      isFollow, follow, unfollow,
      blogStatus, likeBlog, cancelLikeBlog, dislikeBlog, cancelDislikeBlog } = controller.user
    router.post('/register', register)
    router.post('/login', login)
    router.get('/info', jwt, info)

    // 判断当前用户是否关注了文章作者
    router.get('/isfollow/:id', jwt, isFollow)
    // 关注文章作者
    router.put('/follow/:id', jwt, follow)
    // 取消关注文章作者
    router.delete('/follow/:id', jwt, unfollow)

    // 获取文章被点赞和踩的状态
    router.get('/blog/:id', jwt, blogStatus)
    // 点赞文章
    router.put('/likeblog/:id', jwt, likeBlog)
    // 取消点赞文章
    router.delete('/likeblog/:id', jwt, cancelLikeBlog)
    // 踩文章
    router.put('/dislikeblog/:id', jwt, dislikeBlog)
    // 取消踩文章
    router.delete('/dislikeblog/:id', jwt, cancelDislikeBlog)
  })

  router.group({ name: 'blog', prefix: '/blog' }, router => {
    const { create, detail } = controller.blog
    router.post('/create', jwt, create)
    router.get('/:id', detail)
  })
}
