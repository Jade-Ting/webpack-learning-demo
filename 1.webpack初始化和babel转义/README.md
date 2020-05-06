## 初始化 | babel转义

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


5. 查看dist-转义前/main.js文件，可以看到，src/index.js并没有被转义为低版本的代码
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

10. 以上在构建时使用了`npx webpack --mode=development`，是为了构建开发环境的编译，可以直接在webpack中配置是开发环境还是生产环境。

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