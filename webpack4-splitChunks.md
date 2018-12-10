## 代码分割
参考：[Webpack4学习笔记（三）——代码分割（多入口）](https://www.jianshu.com/p/741d9c98c395)
### 初始化项目并安装依赖包
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

### 编写基本页面及脚本代码(引用第三方库)
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

### 抽取公共代码
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

### 项目内多模块文件的公共代码抽取

经过之前的努力，终于实现了多入口文件的打包以及抽离第三方库到公共代码文件。但是在实际项目中免不了编写多个模块文件，模块之间也会相互引用。

下面我们将添加一些模块文件，并最终实现项目内模块文件的代码分割与公共代码提取。

1. 新建A、B、C、D、E、F、G、H等8个*-module.js文件，为8个模块

   + B模块依赖D模块

   + C模块依赖D和E两个模块

   + 其他模块之间彼此独立，无依赖关系

     在此仅列示C模块代码如下，其他模块代码类似

   ```js
   import d from './D-module'
   import e from './E-module'
   export default () => {
       d();
       e();
       console.log('Hello World from C!');
   };
   ```

2. 修改index1.js：添加对A、F、G模块的引用，并调用其方法；添加对B、C模块的异步依赖

   ```js
   import a from './A-module';
   import f from './F-module';
   import g from './G-module';
   import(/* webpackChunkName: "async-b" */ './B-module');
   import(/* webpackChunkName: "async-c" */ './C-module');
   
   a();
   f();
   g();
   ```

3. 修改index2.js：添加对A、G、H模块的引用，添加对B模块以及lodash的异步依赖

   ```js
   import a from './A-module';
   import g from './G-module';
   import h from './H-module';
   import(/* webpackChunkName: "async-lodash" */ 'lodash');
   import(/* webpackChunkName: "async-b" */ './B-module');
   
   a();
   g();
   h();
   ```

4. 修改index3.js：添加对A、F、H模块的引用，添加对C模块的异步依赖

   ```js
   import a from './A-module';
   import f from './F-module';
   import h from './H-module';
   import(/* webpackChunkName: "async-c" */ './C-module');
   
   a();
   f();
   h();
   ```

5. 执行`npx webpack --mode development`打包

   查看bundle报告，可以见到新生成的async-lodash.xxxx.js文件和之前生成过的vendor.xxxx.js文件中都完整的包含了一份lodash代码。
   index1.js中打包了A、F、G模块的代码
   index2.js中打包了A、G、H模块的代码
   index3.js中打包了A、F、H模块的代码

   使用文本编辑器在dist目录中搜索"Hello World from "，可以比较清楚的见到模块代码重复。

6. 修改webpack.config.js文件

   在splitChunks\cacheGroups配置项内增加一项配置

   ```js
           common: {
             chunks: "all",
             minChunks: 2,
             minSize: 0,
             name: 'common',
             enforce: true,
             priority: 5
           }
   ```

   同时，修改HtmlWebpackPlugin配置项，在3个chunks参数中都加一项'common'值，如：`chunks: ['index*', 'vendor', 'common']`

7. 再次执行`npx webpack --mode development`打包

   查看bundle报告，lodash还是被分别打包在async-lodash.xxxx.js和vendor.xxxx.js文件中，估计这可能就是正确的结果了，不过这个问题有时间还得深入研究一下。

   index\*.js文件中不再直接包含依赖模块的代码，在dist目录中搜索包含"Hello World from "的所有文件，可以验证这一点。

   查看新生成的common.xxxx.js文件，可以见到依次包含了F、G、H、A以及**D**模块的代码。

   慢着，为何D模块也被打包进来了呢？index\*.js文件并没有直接依赖D模块呀

   带着疑问打开async-b.xxxx.js和async-c.xxxx.js文件，发现了其中都有这样一行代码：

   `/* harmony import */ var _D_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./D-module */ "v6me");`

   之后有调用该模块的代码`Object(_D_module__WEBPACK_IMPORTED_MODULE_0__["default"])();`

   欧~，原来异步依赖的代码中重复依赖的模块也会被打包进common.xxxx.js，用`/*! ./D-module */`之后的那串字符为关键字可以在common.xxxx.js文件中搜索到D模块的代码。

**遗留问题：**

   optimization\runtimeChunk设置项的作用？

   ```js
   optimization: {
     runtimeChunk: {
       "name": "manifest"
   }
   ```
