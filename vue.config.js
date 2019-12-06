module.exports = {
    configureWebpack :{
        module: {
            rules: [
                {
                    test: /\.(gltf)$/,
                    use: [
                        {
                            loader: "gltf-webpack-loader"
                        }
                    ]
                },
                {
                    test: /\.(bin)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {}
                        }
                    ]
                },
                {
                    test: /\.(scss)$/,
                    use: [
                        {
                            loader: 'sass-loader'
                        }
                    ]
                }
            ]
        }
    }
};
