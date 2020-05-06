### 在浏览器中查看页面

- 查看页面，就需要 `html` 文件， 新建 `public/index.html`, 引入打包后的js/css文件

- 但是每次生成的文件名有可能不同，为了避免一次次手动修改html的引入，可以使用 `html-webpack-plugin`插件。

    1. 安装

    ```bash
    npm install --save-dev html-webpack-plugin
    ```

    2. 修改webpack.config.js

    ```js
    // 引入插件
    const HtmlWebpackPlugin = require('html-webpack-plugin')

    module.exports = {
        // ....
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
                filename: 'index.html', // 打包后的文件名
                minify: {
                    removeAttributeQuotes: false,   // 是否删除属性的双引号
                    collapseWhitespace: false // 是否折叠空白
                },
                // hash: true // 是否加上hash，默认是false
            })
        ]
    }
    
    ```

    3. 执行 `npx webpack`，dist 目录下就会新增一个 index.html 文件，并且文件中引入了打包之后的js文件。

- html-webpack-plugin的 config 的妙用

    > 项目可能需要用到配置文件，使用不同的配置文件展示不同的页面，这时候就需要 `html-webpack-plugin`来将配置文件中的配置实现在页面上。

    1. 新增配置文件 `config.js` 在public文件夹下。

    ```js
    //public/config.js 除了以下的配置之外，这里面还可以有许多其他配置，例如,pulicPath 的路径等等
    module.exports = {
        // 开发环境
        dev: {
            template: {
                title: '你好',
                header: false,
                footer: false
            }
        },

        // 生产环境
        build: {
            template: {
                title: '你好才怪',
                header: true,
                footer: false
            }
        }
    }
    ```

    2. 修改webpack.config.js

    ```js
    //webpack.config.js
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const isDev = process.env.NODE_ENV === 'development' // 判断是否是开发环境
    const config = require('./pubilc/config')[isDev ? 'dev' : 'build']

    modue.exports = {
        //...
        mode: isDev ? 'development' : 'production'
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
                filename: 'index.html', //打包后的文件名
                config: config.template
            })
        ]
    }

    ```


    3. 接下来就可以修改 `public/index.html` 文件，把配置文件的内容嵌入

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!-- 如果header为true,则显示 -->
        <% if(htmlWebpackPlugin.options.config.header) { %>
                <!-- 显示配置文件中的title -->
            <title><%= (htmlWebpackPlugin.options.config.title) %></title>
        <% } %>
    </head>
    <body>
        <div>练习</div>
    </body>
    </html>

    ```

    【注意】 `process.env` 中默认并没有 `NODE_ENV`,我们需要自己配置 `package.json`的 `scripts`

    首先需要安装 `cross-env` 它可以提供一个设置环境变量的scripts, 可以使用 *unix 方式设置环境变量，同时可以兼容在window上运行。只需要在命令 `NODE_ENV=XXXX` 前加上就可以了。

    ```json
    {
        "scripts": {
            "dev": "cross-env NODE_ENV=development webpack --open", // --open => 编译完成后自动打开浏览器
            "build": "cross-env NODE_ENV=production webpack"
        }
    }

    ```

    4. 分别运行 `npm run dev` 和 `npm run build`，对比 dist/index.html，可以看到是根据配置文件的不同配置渲染的。

- 配置devServer 使页面运行在浏览器中
    1. 安装
    ```
    npm install --save-dev webpack-dev-server
    ```
    2. 修改package.json
    ```json
    {
        "scripts": {
            "dev": "cross-env NODE_ENV=development webpack-dev-server",
            "build": "cross-env NODE_ENV=production webpack"
        },
    }
    ```
    3. 运行 `npm run dev`
    
        可以看到 `Project is running at http://localhost:8080/`, 在浏览器中打开，就是我们的页面。

    4. 可以在 webpack 中配置 devServer
    ```js
    //webpack.config.js
    module.exports = {
        //...
        devServer: {
            // contenBase告诉服务器从哪个目录中提供内容，但是如果已经配置 htmlWebpackPlugin，则contentBase不起作用
            // contentBase: path.join(__dirname, 'public') 
            publicPath: '/assets/', // 指定打包目录
            host: '0.0.0.0', // 指定使用一个host，默认是localhost
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

    ```
- 如果在 `src/index.js` 中加上 `console.log('aaa')`, 在浏览器控制台中输出
    ```
    aaaaa // 打印信息                   index.js:27 // 位置
    ```
    点击浏览器控制台的 `index.js`，会得到编译后的js文件。

    这不利于我们进行开发调试，不能定位源码的错误位置。

    可以在 webpack 中引入： `devtool`, 在开发环境下，信息能直接定位到源码上。
    ```js
    module.exports = {
        devtool: 'cheap-module-eval-source-map' //开发环境下使用
    }
    ```
    其他配置可以查看 [开发工具-Devtool](http://webpack.html.cn/configuration/devtool.html)
