---
title: Blog Log
categories: [tech]
tags: [blog]
published: 2015-04-23 00:35:45
updateDate: 2017-04-02 15:13:02
---
**2018.08.26**  
豆瓣插件 [hexo-tag-douban](https://www.npmjs.com/package/hexo-tag-douban)  
**2017.04.02**  
1. jQuery -> Zepto
2. fancybox -> magnific popup
以下是相同网络环境下，disable Cache，线上首页用 Chrome Network 的测试数据：  
上线前：  
JS，**三个**请求，`jquery.min.js`, `aio.js`, `fancybox.js`，总计**39.8KB**  
CSS，**两个**请求，`style.css`, `fancybox.css`，总计**7KB**  
上线后：  
JS，**两个**请求，`zepto.min.js`, `aio.js`，总计**17.9KB**  
CSS，**一个**请求，`style.css`，总计**6.5KB**  
<!--more-->  
**2017.02.16**  
1. 添加侧边栏的 wgt-search
**2016.04.04**  
1. wordpress 迁移到 [Hexo](https://hexo.io/zh-cn/docs/)
2. 使用新浪云的 CDN 放图片
**2015.05.07**  
1.  选一个在线展示 ppt 的框架，并学习之~
**2015.05.02**  
1.  地图，记录我的旅游轨迹，每个地方 hover 可以展示一个图片和文字链
**2015.04.29**  
1.  用 angularJS 搭建单页结构的 [demo](/demo/) 展示页
2.  做一个单页内切换模板的转场插件
**2015.04.28**  
1.  <del>生成订阅 feed.xml</del>
原来 wordpress 本身就有生成了，天才！订阅地址是：http://www.wuyuying.com/feed，另外，设置 rss 的数目限制可以去“设置 - 阅读”  
**2015.04.27**  
1.  demo 页，迁到 github 维护，基于 fis-pure 和 angular 建立单页页面，编译完之后上线到 wordpress 的 demo 模板
2.  优化 meeta 主题的资源请求
**2015.04.23**  
1.  jekyll 博客的 post 迁回来
2.  知道 9 周年框架用 fis-pure 重写，产出 demo 和日志
3.  <del>学习 firebug</del>
其实 firebug 和 chrome dev tools 功能差不多，chrome dev tools 还内嵌了 emulator，方便调试移动页面，我还是习惯用 chrome 多一点呀~  
4.  <del>gulp</del>
嗷，看了两眼，发现没有工作驱动就没动力去学，还是有点学习成本，我还是乖乖用 fis 吧，再赞万能的 [fis](http://fis.baidu.com "fis 官网")~  
5.  zen-coding
