<<<<<<< HEAD
module.exports = {
  publicPath: './'
  // devServer: {
  //   proxy: {
  //     //laravel 中获取 csrf-token 的接口
  //      '/wav': {
  //           //将/api访问转换为target
  //           target: 'http://localhost:8080',
  //           //跨域请求携带cookie
  //           changeOrigin: true,
  //           //url 重写删除`/api`
  //           pathRewrite: path => path.replace(/^\/wav/, ''),
  //       },
  //   },
  // },
}
=======
'use strict'
const path = require('path')

module.exports = {

  publicPath: '/chat',
  outputDir: 'dist',
  assetsDir: 'static',

}
>>>>>>> 3eb8794809e99d2d831f6d4d5362696cf6fbd2a1
