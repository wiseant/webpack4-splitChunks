#### 代码分割

##### 初始化项目并安装依赖包
1. 初始化项目
   `npm init -y`

2. 安装webpack4
   `npm i webpack webpack-cli -D`

3. 安装html-webpack-plugin、clean-webpack-plugin
   `npm i html-webpack-plugin clean-webpack-plugin -D`

4. 安装webpack-bundle-analyzer
   `npm i webpack-bundle-analyzer -D`

5. 安装lodash和axios包
   `npm i axios lodash -S`

##### 编写基本页面及脚本代码(引用第三方库)
0. **目标**
    将建立三个页面，及三个相应的脚本文件，在页面文件中不需要直接引用脚本文件，这是webpack的工作。
    index1.js和index2.js都引用了axios，index1.js和index3.js引用了lodash，三个脚本文件之间无引用关系。
    最终目标是在打包时将公共代码抽离出来放到一个文件中以便重用，三个页面各自引用相应的index\*.js文件以及必要的公共代码文件。

1. 新建src\index1.html、src\index1.js文件

   ```html
   <!doctype html>
   <html>
   <head>
       <meta charset="UTF-8">
       <title>index1</title>
   </head>
   <body>
       <a href="./index2.html">index2</a><br/>
       <a href="./index3.html">index3</a><br/>
   </body>
   </html>
   ```

   ```js
   import axios from "axios"
   import lodash from 'lodash'
   
   console.log('加载index1.js...')
   
   let div=document.createElement("div");
   div.innerHTML = "<br><i>index1.js已加载</i>";
   document.body.appendChild(div);
   ```

2. 新建src\index2.html、src\index2.js文件

   ```html
   <!doctype html>
   <html>
   <head>
       <meta charset="UTF-8">
       <title>index2</title>
   </head>
   <body>
       <a href="./index3.html">index3</a><br/>
       <a href="./index1.html">index1</a><br/>
   </body>
   </html>
   ```

   ```js
   import axios from "axios"
   
   console.log('加载index2.js...')
   
   let div=document.createElement("div");
   div.innerHTML = "<br><i>index2.js已加载</i>";
   document.body.appendChild(div);
   ```

3. 新建src\index3.html、src\index3.js文件

   ```html
   <!doctype html>
   <html>
   <head>
       <meta charset="UTF-8">
       <title>index3</title>
   </head>
   <body>
       <a href="./index1.html">index1</a><br/>
       <a href="./index2.html">index2</a><br/>
   </body>
   </html>
   ```

   ```js
   import lodash from 'lodash'
   
   console.log('加载index3.js...')
   
   let div=document.createElement("div");
   div.innerHTML = "<br><i>index3.js已加载</i>";
   document.body.appendChild(div);
   ```

4. 在项目根目录下新建webpack.config.js文件

   定义了三个入口，并通过HtmlWebpackPlugin插件打包三个页面文件

   ```js
   const webpack = require('webpack');
   const HtmlWebpackPlugin = require('html-webpack-plugin');
   const CleanWebpackPlugin = require('clean-webpack-plugin');
   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
   
   module.exports = {
     entry: {
       'index1': './src/index1.js',
       'index2': './src/index2.js',
       'index3': './src/index3.js'
     },
     output: {
       filename: '[name].[contenthash:4].js'
     },
     plugins: [
       // 打包前先清空
       new CleanWebpackPlugin('dist'),
       new BundleAnalyzerPlugin({
         openAnalyzer: false,
         analyzerMode: 'static',
         reportFilename: 'bundle-analyzer-report.html'
       }),
       new HtmlWebpackPlugin({
         template: './src/index1.html',
         filename: 'index1.html',
       }),
       new HtmlWebpackPlugin({
         template: './src/index2.html',
         filename: 'index2.html',
       }),
       new HtmlWebpackPlugin({
         template: './src/index3.html',
         filename: 'index3.html',
       })
     ],
   }
   ```

5. 执行`npx webpack --mode development`打包

   可以见到dist目录中生成了3个html文件和3个js文件，以及webpack-bundle-analyzer插件生成的报告文件。

   见到3个js文件的大小如下：

   > index1.xxxx.js	1531KB
   >
   > index2.xxxx.js	  134KB
   >
   > index3.xxxx.js	1407KB

   通过查看报告文件，可以清晰看到index1.js和index3.js都包含lodash包的代码，index1.js和index2.js都包含了axios包的代码。

   浏览任意一个页面文件，并在3个页面之间跳转，可以发现页面可以正常加载，但是每一个页面下方都显示了相同的三行文字

   > *index1.js已加载*
   > *index2.js已加载*
   > *index3.js已加载*

   查看dist目录下3个html文件的内容，发现每个页面都引入了3个脚本文件。

   **问题1：公共代码未抽取
   问题2：页面引用了不相关的脚本文件**

##### 抽取公共代码
1. 修改webpack.config.js文件，使用webpack4内置的splitChunks功能做代码分割

   在plugins配置项下方添加

   ```js
     optimization: {
       splitChunks: {
         cacheGroups: {
           default: false,
           vendors: false,
           vendor: {
             test: /[\\/]node_modules[\\/]/,
             chunks: 'initial',
             enforce: true,
             priority: 10
           }
         }
       }
     }
   ```

2. 执行`npx webpack --mode development`打包

   可以见到dist目录下多了两个文件`vendor~index1~index2.xxxx.js`和`vendor~index1~index3.xxxx.js`
   前一个文件包含了index1.js和index2.js共同引用的第三方包代码(即axios)
   后一个文件包含了index1.js和index3.js共同引用的第三方包代码(即lodash)

   **问题1**貌似很轻松的都解决掉了

   不过，别高兴太早，查看dist目录中的3个html文件，可以发现每个页面都引用了全部5个脚本文件:(

3. 页面只引用特定的脚本文件

   特定的html只引入指定的代码块文件，可以通过配置html-webpack-plugin插件的chunks参数来实现

   修改webpack.config.js文件，将三项HtmlWebpackPlugin配置代码修改为：

   ```js
       new HtmlWebpackPlugin({
         template: './src/index1.html',
         filename: 'index1.html',
         chunks: ['index1', 'vendor']
       }),
       new HtmlWebpackPlugin({
         template: './src/index2.html',
         filename: 'index2.html',
         chunks: ['index2', 'vendor']
       }),
       new HtmlWebpackPlugin({
         template: './src/index3.html',
         filename: 'index3.html',
         chunks: ['index3', 'vendor']
       }),
   ```

   此时三个chunks参数中设定的'vendor'并不会起作用，因为还没有名称为vender的代码块，不过为了后面不用再回过头来改chunks参数，所以先写在这里了，没副作用。

4. 再次执行`npx webpack --mode development`打包

   查看dist目录下的三个html文件，终于它们都只引用了与自己相关的脚本文件，在浏览器中打开页面可以验证这一点。

   不过，仔细想想，问题并未解决，html文件竟然没有引用打包生成的公共代码文件(那两个vendor开头的文件)

   因为HtmlWebpackPlugin依赖于chunk的名字，才会在目标html中添加相应的脚本文件引用，我们之前配置splitChunks时并未指定名称，而webpack官网也推荐不要配置`name:'vendor'`，因为配置了名字之后所有的公共依赖都只会放到一个脚本文件中，即使某些页面只需要其中一部分功能也必须加载整个脚本文件。

   可问题就摆在面前了，不配置`name:'vendor'`将使得生成未知份数的公共脚本文件，而且其名称还会根据引用次数和引用文件的名称而变化，HtmlWebpackPlugin目前搞不掂这个问题。

5. 修改webpack.config.js文件，为splitChunks\cacheGroups\vendor配置项设定name参数

   ```js
           vendor: {
             test: /[\\/]node_modules[\\/]/,
             chunks: 'initial',
             name: 'vendor',
             enforce: true,
             priority: 10
           }
   ```

6. 再次执行`npx webpack --mode development`打包

   这次dist目录中生成了3个index\*.html文件、3个index\*.js文件以及vendor.xxxx.js文件

   3个html文件都各自引用了相应的index[n].js文件，以及vendor.xxxx.js文件

   在浏览器中打开任意一个页面文件，并在各页面之间跳转可以发现一切正常。

   OK！问题1和问题2总算是解决掉了，虽然没那么完美，但世界上本就没有完美的东西，只有尽可能完美:）

