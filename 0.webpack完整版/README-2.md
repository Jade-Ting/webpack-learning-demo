> [参考 - 带你深度解锁webpack](https://juejin.im/post/5e6518946fb9a07c820fbaaf)

### 1. 静态资源拷贝
> 有些直接被引入到 index.html的静态文件不希望被编译，比如 config.js。

    ```html
    // 引入 config.js
    <script src="./config.js"></script>
    ```

直接打包的话，dist/index.html中也有 `./config.js`, 但是此时js文件已经被打包，所以找不到 `config.js` 文件，就会报错。

解决方法：

1. 此时可以手动将文件拷贝到 dist文件夹下。
2. 安装插件，自动化拷贝

    ```
    npm install copy-webpack-plugin -D
    ```

    配置webpack

    ```js
    //webpack.config.js
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    module.exports = {
        //...
        plugins: [
            new CopyWebpackPlugin([
                {
                    from: 'public/js/*.js',
                    to: path.resolve(__dirname, 'dist', 'js'),
                    flatten: true,
                },
                //还可以继续配置其它要拷贝的文件
            ], {
                ignore: ['other.js']
            })
        ]
    }

    1. flatten: true 表示只会拷贝文件，不会拷贝文件路径
    2. ignore: [] 表示忽略指定文件不拷贝
    ```

### 2.ProvidePlugin
> 自动加载模块（把模块作为全局变量调用）

ProvidePlugin 是webpack 的内置插件，可以直接进行配置, 如 react, jQuery, 

```js
new webpack.ProvidePlugin({
    React: 'react',
    Component: ['react', 'Component'],
    Vue: ['vue/dist/vue.ems.js', 'default'],
    $: 'jquery',
    _map: ['lodash', 'map']
})
```

配置之后就可以在全局直接使用 $, _map等，react组件也不需要引入react。

vue配置后面多个 `default` 是因为 `vue.esm.js` 中使用的是 `export.default` 导出，所以必须指定 default。而 react 使用的是 `module.exports` 的导出方式。


### 3.抽离CSS
> 若将静态文件（js|css|png）等都打包成一个js文件，可能会因为体积太大而导致加载速度变慢。

安装 mini-css-extract-plugin

```
npm install mini-css-extract-plugin -D
```

修改webpack配置

```js
//webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
            //publicPath:'../'   //如果你的output的publicPath配置的是 './' 这种相对路径，那么如果将css文件放在单独目录下，记得在这里指定一下publicPath 
        })
    ],
    module: {
        rules: [
            {
                test: /\.(le|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader, //替换之前的 style-loader
                    'css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')({
                                        "overrideBrowserslist": [
                                            "defaults"
                                        ]
                                    })
                                ]
                            }
                        }
                    }, 'less-loader'
                ],
                exclude: /node_modules/
            }
        ]
    }
}

```

抽离之后，修改 css 文件时，第一次页面会刷新，第二次页面不会刷新（还没测试，没太明白意思）。

在 MiniCssExtractPlugin.loader 对应的 options 中配置
```js
module.exports = {
    rules: [
        {
            test: /\.(c|le)ss$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: isDev,
                        reloadAll: true,
                    }
                },
                //...
            ],
            exclude: /node_modules/
        }
    ]
}
```

### 4.压缩抽离出来的的css
> 使用 `mini-css-extract-plugin` 时，css默认不会被压缩，如果想要压缩可以配置 `optimization` 。

安装 optimize-css-assets-webpack-plugin

```
npm install optimize-css-assets-webpack-plugin -D
```

修改webpack配置

```js
//webpack.config.js
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    //....
    plugins: [
        new OptimizeCssPlugin()
    ],
}

```
这里将OptimizeCssPlugin 直接配置在 plugins 里，js和css都能正常压缩。

如果配置在 optimization，就需要再配置一下 js 的压缩。

```js
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  },

  此时js文件不会压缩，需要另外进行配置。
  分开配置时注意，开发环境下js文件不需要进行压缩，所以将js压缩配置在 生产环境中。
```