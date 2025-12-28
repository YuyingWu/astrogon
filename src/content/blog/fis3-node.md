---
title: fis3安装时遇到的node版本问题
categories: [tech]
tags: []
published: 2017-01-18 00:18:45
---
今天在调试 demo，执行编译命令时，  
```
fis3 release  
```
报了一大堆错误，一时懵逼~  
<!-- more -->  
关键行：  
```
Fatal error in ../deps/v8/src/api.cc, line 1051  
blah blah  
Illegal instruction: 4  
```
运行环境是：  
* node，v 7.4.0
* fis3，v 3.4.31
这都啥呀，于是搜了下，可能是因为**node 的 v8 内核不稳定或者跟涉及的插件不合适**~遇到类似的问题，可以尝试安装稳定版本的 node。  
后来发现，还是不 okay，就去 fis 官网看 [安装指南](http://fis.baidu.com/fis3/docs/beginning/install.html)，发现 fis 只支持以下的 node 版本：  
```
0.8.x, 0.10.x, 0.12.x, 4.x, 6.x  
```
最后我装了 node 的 0.12.0 版本，bingo！  
由于 node 版本的变更，一些模块可能需要重装，根据提示 rebuild 就好了 :)  
```
npm rebuild node-sass  
```
***  
## node 版本管理模块 —— n
顺便安利一个 npm 的模块 —— n，专门管理 node 版本的模块，功能多多，可以查询 node 最新、最稳定的版本，又或者安装指定版本……  
**一、全局安装**  
```
npm install -g n  
```
**二、n 的常用功能**  
```
n stable // 安装最稳定版本  
n ls // 查看 node 版本列表  
n 0.12.0 // 安装指定版本  
```
