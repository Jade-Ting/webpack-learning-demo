//public/config.js 除了以下的配置之外，这里面还可以有许多其他配置，例如,pulicPath 的路径等等
module.exports = {
    // 开发环境
    dev: {
        template: {
            title: '开发环境',
            dev: true
        }
    },

    // 生产环境
    build: {
        template: {
            title: '生产环境',
            pro: true
        }
    }
}