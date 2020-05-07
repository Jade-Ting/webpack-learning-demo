本章笔记主要学习初步搭建webpack，主要参照[刘小夕 - 带你深度解锁Webpack系列(基础篇)](https://juejin.im/post/5e5c65fc6fb9a07cd00d8838#heading-0)

### 初探索


1. 初始化 `package.json`
    ```bash
    npm init -y
    ```


2. 安装webpack, webpack-cli, webacck@4.0.0开始，webpack就是开箱即用的，在不引入任何配置文件的情况下就可以使用
    ```bash
    npm install webpack webpack-cli -D
    ```


3. 新建 `src/index.js`文件
    ```js
    class Animal {
        constructor(name) {
            this.name = name
        }

        getName() {
            return this.name
        }
    }

    const dog = new Animal('dog')
    ```


4. 构建
    ```js
    npx webpack --mode=development // 默认是production模式，使用development可以更清楚的看到打包后代码
    ```


5. 查看dist/main.js文件，可以看到，src/index.js并没有被转义为低版本的代码
    ```js
    {
        "./src/index.js":
            (function (module, exports) {

                eval("class Animal {\n    constructor(name) {\n        this.name = name;\n    }\n    getName() {\n        return this.name;\n    }\n}\n\nconst dog = new Animal('dog');\n\n//# sourceURL=webpack:///./src/index.js?");

            })
    }

    ```


6. 将js转义为低版本， 使用loader进行转义

    ```bash
    // 安装babel-loader
    npm install babel-loader -D

    // 其他依赖
    npm install @babel/core @babel/preset-env @babel/plugin-transform-runtime -D

    npm install @babel/runtime @babel/runtime-corejs3

    ```


7. 新建 `webpack.config.js`

    ```js
    //webpack.config.js
    module.exports = {
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/ //排除 node_modules 目录
                }
            ]
        }
    }
    ```

    【建议】给loader指定include或exclude，指定其中一个即可，因为 `node_module`目录通常不需要编译，排除之后，有效提升编译效率。

8. 新建 `.babelrc` 文件

    ```js
    {
        "presets": ["@babel/preset-env"],
        "plugins": [
            [
                "@babel/plugin-transform-runtime",
                {
                    "corejs": 3
                }
            ]
        ]
    }

    ```

    也可以在 `webpack`中配置

    ```js
    //webpack.config.js
    module.exports = {
        // mode: 'development',
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-env"],
                            plugins: [
                                [
                                    "@babel/plugin-transform-runtime",
                                    {
                                        "corejs": 3
                                    }
                                ]
                            ]
                        }
                    },
                    exclude: /node_modules/
                }
            ]
        }
    }

    ```

9. 再次构建 `npx webpack --mode=development`， 此时 `dist/main.js`中已经被编译成低版本的js代码。

### 进一步

1. 以上构建时使用了`npx webpack --mode=development`，是为了构建开发环境的编译，可以直接在webpack中配置是开发环境还是生产环境。

    ```js
    module.exports = {
        mode: 'development',
        module: {
            // ...
        }
    }

    // mode: 'development'： 将 process.env.NODE_ENV 的值设置为 development， 启用 `NamedChunksPlugin`和`NamedModulesPlugin`

    // mode: 'production': 将 process.env.NODE_ENV 的值设置为 production，启用 `FlagDependencyUsagePlugin`,`FlagIncludedChunksPlugin`,`ModuleConcatenationPlugin`,`NoEmitOnErrorsPlugin`,`OccurrenceOrderPlugin`,`SideEffectsFlagPlugin`和`UglifyJsPlugin`
    ```

    现在可以直接用 `npx webpack`进行编译

2. 在浏览器中查看页面
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
				"dev": "cross-env NODE_ENV=development webpack",
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

3. 处理样式文件
    > webpack 不能直接处理css，需要借助 `loader`, 如果是 `.css`，我们需要的 `loader`通常有 `style-loader`,`css-loader`, 考虑到兼容性问题，还需要`postcss-loader`, 而如果是 `less` 或 `sass` 的话，还需要`less-loader` 和`sass-loader`。

    这里我们使用 `less`，如果使用 `sass`，则将 `less-loader`换成`sass-loader`

    - 安装依赖

    ```
    npm install style-loader less-loader css-loader postcss-loader autoprefixer less -D
    ```

    - 配置到webpack中

    ```js
    // webpack.config.js
    module.exports = {
        //...
        module: {
            rules: [
                {
                    test: /\.(le|c)ss$/,
                    use: ['style-loader', 'css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')({
                                        "overrideBrowserslist": [
                                            ">0.25%",
                                            "not dead"
                                        ]
                                    })
                                ]
                            }
                        }
                    }, 'less-loader'],
                    exclude: /node_modules/
                }
            ]
        }
    }

    // 说明配置信息
    loader的执行顺序是 less-loader ---> postcss-loader ---> css-loader ---> style-loader
    1. style-loader动态创建 style 标签，将 css插入到 head 中;
    2. css-loader 负责处理 @import 等语句;
    3. postcss-loader 和 autoprefixer 自动生成浏览器兼容性前缀，如 -ms-, -webkit-,-o-等
    4. less-loader负责将 .less 文件转为 .css
    ```

    - 创建 `src/index.less` 文件，写上样式如下

    ```less
    @color: #558899;

    body {
        background: @color;
        transition: all 2s;
    }
    ```

    - 引入到`src/index.js` 中 `import './index.html' `, 重新运行项目会发现页面背景变成灰蓝色。

4. 处理图片文件
    > 若在 less 文件中引入 背景图片 `background-image: url(./assets/bg.jpg);`，此时就会报错。

    可以使用 `url-loader` 或 `file-loader` 来处理本地的资源文件。

    1. 安装依赖

    ```
    npm install --save-dev url-loader

    // 安装过程中可能会警告要安装 file-loader, 那就安装 file-loader
    ```

    2. 配置 url-loader 处理 图片
    
    ```js
    //webpack.config.js
    module.exports = {
        //...
        modules: {
            rules: [
                {
                    test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 10240, //10K
                                esModule: false 
                            }
                        }
                    ],
                    exclude: /node_modules/
                }
            ]
        }
    }

    // 配置说明
    1. limit: 10240 表示资源大小小于 10k 时，将资源转化为 base64，超过 10k 的则将拷贝到 dist目录下。
    2. esModule: false 设置为false， 否则 `<img src={require('XXX.jpg')} />` 会出现 `<img src=[Module Object] />`
    
    【注意】将资源转换为 base64 可以减少网络请求次数，但是 base64数据较大，如果太多的资源是base64，会导致加载变慢，因此设置limit值时，需要二者兼顾。
    ```

    3. 配置修改图片等资源输出名称

    默认情况下，生成的图片的名称就是文件内容的 `MD5`哈希值并会保留引用资源的原始扩展名，例如上面引入的 `./assets/bg.jpg`, 会得到

    ```html
    <style>
        body {
            background-image: url(a63be687d275b76eb03235c4b2eda004.jpg);
        }
    </style>
    ```

    可以通过 `options` 参数进行修改

    ```js
    use: [
        {
            loader: 'url-loader',
            options: {
                // ...
                name: '[name]_[hash:8].[ext]'
            }
        }
    ],
    ```

    再次运行项目，会得到

    ```html
     <style>
        body {
            background-image: url(bg_a63be687.jpg);
        }
    </style>
    ```

    4. 配置图片等资源打包的文件位置
    > 可以将dist中的静态资源打包在指定文件夹中

    ```js
    use: [
        {
            loader: 'url-loader',
            options: {
                // ...
                outpath: 'assets' // 将资源打包到 dist/assets 文件下
            }
        }
    ],
    ```

5. 处理 html 中的本地图片
    > 下面说明主要针对没有加载出 html 引入的相对路径的本地图片的解决方法。（我index.html文件中加入后运行图片是可以正常显示的。）

    1. 问题说明: 在 'public/index.html' 中引入本地图片
        ```html
        <img src="./img.jpg">
        ```
        重新运行项目，浏览器中加载不出这张图片，因为相对路径找不到图片。（说明：在测试中图片可以正常加载）
    
    2. 解决： 安装 `html-withimg-loader`

    ```
    npm install html-withimg-loader -D

    ```

    3. 修改 webpack

    ```js
    module.exports = {
        //...
        module: {
            rules: [
                {
                    test: /.html$/,
                    use: 'html-withimg-loader'
                }
            ]
        }
    }

    ```

    4. 但是使用 `html-withimg-loader` 处理图片html文件就不能使用 `vm`, `ejs`的模板，即不能使用 `<% if() {%>` 这类模板。因此也可以不使用 `html-withimg-loader`，直接用 <% %>
    ```html
    <!-- index.html -->
    <img src="<%= require('./img.jpeg') %>" />

    ```

6. 入口配置

    ```js
    //webpack.config.js
    module.exports = {
        entry: './src/index.js' //webpack的默认配置
    }

    ```

7. 出口配置

    ```js
    const path = require('path');
    module.exports = {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'), // 必须是绝对路径
            filename: 'bundle.js',
            publicPath: '/' // 通常是CDN地址
        }
    }

    // 配置说明
    1. path 打包输出的文件位置
    2. filename 打包输出的包名称, 考虑到 cdn 缓存，一般给文件加上 hash， 如 bundle.[hash].js
    3. publicPath 可以不配置或者直接配置为 '/'。 （若需要配置：在文件部署到 CDN 上后，若资源的地址为：'https://AAA/BBB/YourProject/XXX'，就可以将生产的 publicPath 配置为 '//AAA/BBB/'）

    【注意】可以根据 isDev等字段来指定不同环境配置不同的 publicPath
    ```

7. 每次打包前清空 dist 目录
    > 每次打包时，需要手动清空 dist 目录，设置成打包编译时自动清空

    1. 安装 `clean-webpack-plugin` 插件

    ```
    npm install clean-webpack-plugin -D

    ```
    2. 配置 webpack

    ```js
    //webpack.config.js
    const { CleanWebpackPlugin } = require('clean-webpack-plugin');

    module.exports = {
        //...
        plugins: [
            //不需要传参数喔，它可以找到 outputPath
            new CleanWebpackPlugin() 
        ]
    }

    // 可以指定不删除某些目录
    new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns:['**/*', '!dll', '!dll/**'] //不删除dll目录下的文件
    })

    ```

<a href="./README-2.md">查看其他配置</a>