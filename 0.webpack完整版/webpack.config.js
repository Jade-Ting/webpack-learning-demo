const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const path = require("path");
const isDev = process.env.NODE_ENV === "development";
const config = require("./public/js/config")[isDev ? "dev" : "build"];

module.exports = {
    mode: process.env.NODE_ENV === "development" ? "development" : "production",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"), // 必须是绝对路径
        filename: "main.[hash:8].js",
        publicPath: "/", // 通常是CDN地址
    },
    devtool: "cheap-module-eval-source-map",
    module: {
        rules: [
            {
                test: /\jsx?$/,
                use: ["babel-loader"],
                exclude: /node_modules/, // 排除 node_modules目录
            },
            {
                test: /\.(le|c)ss$/,
                use: [
                    // "style-loader",
                    MiniCssExtractPlugin.loader, // 替换 style-loader
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: function () {
                                return [
                                    require("autoprefixer")({
                                        overrideBrowserslist: [
                                            ">0.25%",
                                            "not dead",
                                        ],
                                    }),
                                ];
                            },
                        },
                    },
                    "less-loader",
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            outputPath: "assets",
                            limit: 10240, // 10K
                            esModule: false,
                            name: "[name]_[hash:8].[ext]",
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },

    devServer: {
        port: "3000", // 修改端口号，默认是8080
        stats: "errors-only", // 终端仅打印 error
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            filename: "index.html", // 打包后的文件名
            minify: {
                removeAttributeQuotes: false, // 是否删除属性的双引号
                collapseWhitespace: false, // 是否折叠空白
            },
            // hash: true // 是否加上hash，默认是false
            config: config.template,
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin(
            [
                {
                    from: "public/js/*.js",
                    to: path.resolve(__dirname, "dist", "js"),
                    flatten: true,
                },
            ],
            {
                ignore: ["other.js"],
            }
        ),
        new MiniCssExtractPlugin({
            filename: "css/[name].css", // 打包后的文件位置以及文件名
        }),
        new OptimizeCSSAssetsPlugin()
    ],

    // optimization: {
    //     minimizer: [
    //       new OptimizeCSSAssetsPlugin({})
    //     ]
    //   },
};
