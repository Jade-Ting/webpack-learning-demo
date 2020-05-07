### 处理静态资源文件

1. 处理样式文件
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

2. 处理图片文件
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

    默认情况下，生成的图片的名称就是文件内容的 `MD5`哈希值并会保留引用资源的原始扩展名，例如上面引入的 `./assets/bg.jpg`, 在页面会得到

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

3. 处理 html 中的本地图片
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
