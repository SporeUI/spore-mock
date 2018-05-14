# spore-mock

轻量级 mock 服务，模块化组织 mock 数据，数据自动更新

## Getting Started

推荐使用 [JSONView](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc) 来查看 JSON 输出

点击查看[详细文档](https://tabspace.gitbooks.io/spore-mock/content/)

命令行方式

mock.js 为配置文件路径

```shell
npm install -g spore-mock
spore-mock -c ./mock.js
```

代码方式

```script
var $sporeMock = require('spore-mock');
$sporeMock({
    configFilePath: './mock.js'
});

```

配置文件 mock.js

```script
var $path = require('path');
module.exports = {
    root: $path.resolve(__dirname),
    mock: './'
};
```

## Demo

参见 example 下的极简示例

下面几个命令选择其一来执行，然后访问 `http://127.0.0.1:8091/admin` 查看控制台

```shell
npm run example-full
npm run example-mock-api
npm run example-mock-page
npm run example-simple
```

## Release History

* 2018-05-14 v0.4.1 支持返回数据以 promise 方式提供
* 2017-12-05 v0.4.0 默认管理路径更换到 /admin, 并添加 routeAdmin 选项可配置管理页面入口路径，以便于本地模拟调试
* 2017-12-04 v0.3.11 解决设置tmplate为一个不存在的路径时，目录界面报错的问题
* 2017-11-30 v0.3.10 添加 ignore 选项，可按需过滤 mock 目录
* 2017-09-26 v0.3.9 完善报错信息处理
* 2017-09-23 v0.3.7 支持用 req.body 便捷的接收 form post 或者 json 方式传递的数据
* 2017-09-09 v0.3.6 mock数据为 null 时，跳过路径匹配，首页显示可用 api 列表
* 2017-07-13 v0.3.5 报错日志着色
* 2017-07-03 v0.3.4 支持自定义中间件，支持自定义反向代理
* 2017-07-03 v0.3.3 支持安装到全局环境
* 2017-06-08 v0.3.2 渲染模板链接固定后缀为 .html
* 2017-05-27 v0.3.1 更新 pug 版本为 2.0.0-rc.1
* 2017-05-24 v0.3.0 精简配置项，没有对应模板的mock数据访问时以接口形式输出
* 2017-05-02 v0.2.2 改进默认首页样式
* 2017-04-17 v0.2.1 使用 mockjs 自动生成 mock 数据
* 2017-03-23 v0.2.0 不再结合 htmlWebpackPlugin 的生成文件自动引用 js 与 css ，要求模板指定引用文件
* 2017-03-14 v0.1.1 entry 数据改为使用 exports.resolve 方法来返回动态数据
* 2017-03-03 v0.1.0 发布第一个正式版
