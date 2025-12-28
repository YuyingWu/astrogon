---
title: Hexo主题的置顶功能
categories: [tech]
tags: [blog,hexo]
published: 2017-02-02 13:23:18
---
忽然想要一个置顶功能，可惜原生的 `hexo-generator-index` 没有提供这样的方法，那只能自己搞一个了~  
<!-- more -->  
## 一、hexo-generator-index 修改
Hexo 排序编译组件，一般默认安装的，默认配置（按 date 排序）  
```
index_generator:  
  per_page: 10  
  order_by: -date  
```
如果没有安装的话，可执行：  
```bash
$ npm install hexo-generator-index --save  
```
在 `node_modules/lib/generator.js` 添加以下排序代码：  
```
  posts.data = posts.data.sort(function(a, b) {  
    !a.top && (a.top = 0);  
    !b.top && (b.top = 0);  
    // 若 top 值一样则按照文章日期降序排，否则按照 top 值降序排  
    if(a.top == b.top){  
      return b.date - a.date; //   
    }else{  
      return b.top - a.top; //   
    }  
  });  
```
## 二、日志配置
在 Front-matter 添加 top 属性  
```
---  
title: 我的 2016  
tags:  
  - 总结
date: 2017-01-20 00:11:18  
top: 1  
---  
```
## 三、置顶文案/样式设定
简单在日期边上加了个“置顶”的箭头~  
添加一个模板 `theme/landscape/layout/_partial/post/top.ejs`，判断当前日志是否有 top 属性（`post.top`）  
```html
<% if (post.top){ %>  
    <i class="fa fa-arrow-up article-top"></i>  
<% } %>   
```
然后在你想添加的位置，引用该模板组件  
```
blah blah ...  
<%- partial('post/top') %>  
blah blah ...  
```
Reference:   
[Netcan](http://www.netcan666.com) 的 [《解决 hexo 置顶问题》](http://www.netcan666.com/2015/11/22/解决 Hexo 置顶问题/)  
