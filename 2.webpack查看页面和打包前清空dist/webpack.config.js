const HtmlWebpackPlugin = require('html-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development' // 判断是否是开发环境
const config = require('./public/config')[isDev ? 'dev' : 'build']

module.exports = {
    mode: isDev ? 'development' : 'production',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ['babel-loader'],
                exclude: /node_modules/ //排除 node_modules 目录
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html', //打包后的文件名
            config: config.template
        })
    ],
    devServer: {
        // contenBase告诉服务器从哪个目录中提供内容，但是如果已经配置 htmlWebpackPlugin，则contentBase不起作用
        // contentBase: path.join(__dirname, 'public'),
        publicPath: '/assets/', // 指定打包目录
        // host: '0.0.0.0', // 指定使用一个host，默认是localhost
        port: '3000', // 修改端口号，默认是8080
        quiet: false, // 默认不启用，如果启用则除了初始启动信息其他的内容都不会被打印到控制台，也就是webpack的警告或错误在控制台都不可见
        inline: true, // 默认开启 inline 模式，如果设置为false,开启 iframe 模式
        stats: "errors-only", // 终端仅打印 error
        overlay: false, // 默认不启用
        clientLogLevel: "silent", // 日志等级
        compress: true, // 是否启用 gzip 压缩
        // overlay 当出现编译器错误或警告时，在浏览器中显示全屏覆盖层。默认禁用。
        // overlay: true, // 只显示编译器错误
        overlay: {  // 显示警告和错误
            warnings: true,
            errors: true
        }
    }
}