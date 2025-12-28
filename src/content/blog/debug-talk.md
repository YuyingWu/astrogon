---
title: 谈谈怎么在不熟悉上下文的情况下debug
published: 2017-02-27 21:56:02
categories: [tech]
tags: []
---
跟大家分享一个最近调 bug 的故事，在不熟悉架构、业务上下文、编程语言、调试环境等等的情况下，遇到问题时，我们可以怎么解决。简单的来说，路过一个你喜欢的站点，发现页面有 bug，想帮忙修，怎么办？  
<!-- more -->  
***  
偶然访问了阿里 [Ant Design](https://ant.design/)，默认是英文版本，我看右上角有个切换到中文的按钮，就过去一点，咦，跳到错误页了~  
职业习惯，我在 chrome 和 Safari 都测了一下，稳定复现，bug~  
恰好这个站点是开源的，那就去 github fork 一下，把这个 bug 修了吧。  
原 href：https://ant.design/  
正确跳转 href：https://ant.design/index-cn  
Chrome 下跳转到：https://ant.design/index-cn/ant.design/  
Safari 下跳转到：https://index-cn/ant.design/  
## 问题定位
咋眼一看，我以为是程序猿或者 PM 在配置时写错了，于是我打开 console，检查这个按钮的元素，看有什么关键字（url、data-属性、id、特别的 classname 等）  
没有链接，看来是 js 控制的，那就去翻源码吧~问题来了，怎么翻呢？  
从上图看，这个 `button`没什么特色，不过，仔细一看，有个不太普通的类名，`ant-btn-ghost`，那我们就去模板那搜`ghost` 吧！  
从目录可以看出来，整个源是非常庞大的，除了官网页面、文档，还有 Ant Design UI 库的源码。凭”直觉“，到 `site` 文件夹搜`ghost`，因为那么多文件夹，就 site 比较像是放官网的。  
Bingo!!!  
### button
看看 `button`相关的代码，虽然我不太懂 React.js，但不难看出来，`button`的`click`事件处理函数`handleLangChange` 就是我们要找的逻辑~  
```
<Button className="lang" type="ghost" size="small" onClick={this.handleLangChange} key="lang">  
    <FormattedMessage id="app.header.lang" />  
</Button>  
```
### handleLangChange
接下来去看 `handleLangChange` 函数，幸好代码不是很多，简单扫一眼~  
```
  handleLangChange = () => {  
    const pathname = this.props.location.pathname;  
    if (utils.isLocalStorageNameSupported()) {  
      localStorage.setItem('locale', utils.isZhCN(pathname) ? 'en-US' : 'zh-CN');  
    }  
    location.href = location.href.replace(  
      location.pathname,  
      utils.getLocalizedPathname(pathname, !utils.isZhCN(pathname)),  
    );  
  }  
```
第一句，变量声明，忽略；  
第二段，localstorage，忽略；  
第三段，replace，参数 1 是当前地址，参数 2 那段的 `utils.getLocalizedPathname` 是什么意思呢？  
### getLocalizedPathname
在 `site`文件夹再搜搜`getLocalizedPathname`，在`utils.jsx` 找到了。  
```
export function getLocalizedPathname(path, zhCN) {  
  const pathname = path.startsWith('/') ? path : `/${path}`;  
  if (!zhCN) { // to enUS  
    return /\/?index-cn/.test(pathname) ? '/' : pathname.replace('-cn', '');  
  } else if (pathname === '/') {  
    return '/index-cn';  
  } else if (pathname.endsWith('/')) {  
    return pathname.replace(/\/$/, '-cn/');  
  }  
  return `${pathname}-cn`;  
}  
```
我们再轻轻扫一眼，可以发现函数 `getLocalizedPathname`的作用是根据当前路径`path` 与是否中文版本`zhCN`，返回对应 path 值。  
经过上面的排查，我们基本定位切换中文的功能，涉及 3 个函数：  
* handleLangChange
* utils.isZhCN
* utils.getLocalizedPathname
上面只是跟大家分享**问题定位**的思路，当然不是看看就可以”盲调“啦，哪有辣么厉害，运行调试才是正解！下面开聊**怎么调试和修 bug**。  
## 怎么调试和修 bug
我在 Github 上看到有个 [开发指导](https://github.com/ant-design/ant-design/wiki/Development) 文档，上面写着这样可以预览调试：  
```
// Fork and git clone.  
$ npm install  
$ npm start  
```
我 clone 到本地，执行`npm start`后，提示有个 npm 组件报错，导致编译失败~没办法在线预览和调试。  
在这里我遇到两个问题：  
1. .jsx 文件编译
2. 运行环境不能在线调试 
遇到事，咱不怕事，见招拆招就 okay 啦~  
1. 把 jsx 编译成 js（或者用 babel，具体问题具体分析）
2. 写好 demo 后，随便用 fis 或者 webpack 在线调试就好了
**针对上面的问题，我的处理方法是，直接把涉及的几个函数串起来，写成 demo，想怎么调就怎么调噜~**  
```
<script>  
// 判断当前是否中文版本  
function isZhCN(pathname) {  
    return (/-cn\/?$/.test(pathname));  
}  
// 根据当前 pathname 和 isZhCN() 返回该跳转的相对路径  
function getLocalizedPathname(path, zhCN) {  
    var pathname = path.startsWith('/') ? path : '/' + path;  
    if (!zhCN) {  
        // to enUS  
        return (/\/?index-cn/.test(pathname) ? '/' : pathname.replace('-cn', '')  
    );  
    } else if (pathname === '/') {  
        return '/index-cn';  
    } else if (pathname.endsWith('/')) {  
        return pathname.replace(/\/$/, '-cn/');  
    }  
        return pathname + '-cn';  
}  
// handleLangChange 的简写  
// 由于当前环境不在 https://ant.design 域下，我是直接访问 demo.html  
// 原文中的 location.pathname，这里使用硬编码替代  
var pathname = '/index-cn';  
var result = location.href.replace(  
    location.pathname,  
    getLocalizedPathname(pathname, isZhCN(pathname))  
);  
// 输出测试结果  
console.log(result);  
</script>  
```
其实这样也属于盲调，纯本地调试，修 bug 的原理没错，但是没有实时调试，加上我不了解业务逻辑（我以为只有首页有中英版本切换，没考虑到其他入口也有），导致我提交的第一个版本会丢失 hash 和 query，后续我再 PR 了一版，修复的详细这里就不详述了。  
[第一版](https://github.com/ant-design/ant-design/pull/5050) [第二版](https://github.com/YuyingWu/ant-design/commit/9c9c164617ec35d9c30e5518f94661601bcd736b)  
## 结语
不懂业务、不了解系统的架构和实现、不懂编程语言、没法实时调试，这些可能会变成我们在问题定位和修复时的拦路虎~但是，不要方，见招拆招，用自己的思路和方式解决：）  
