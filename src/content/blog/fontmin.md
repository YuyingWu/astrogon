---
title: 'Hi,fontmin'
categories: [tech]
tags: []
published: 2015-05-27 23:38:54
---
相信 FE 同学们在日常开发中，经常遇到爱用特殊字体的 UE，有时候偷偷改成微软雅黑会被发现（笑），被拆穿后只能乖乖切图，不过这样真的很不好，因为多一张图片（常常还是 banner 上的大文字）就多一个请求，哪怕用 CSSsprite 打包图片也占地儿，是不是？  
于是前阵子关注到 baidu EFE 的一个东东：[Fontmin](http://ecomfe.github.io/fontmin/)，具体介绍大家可以点过去看看哈。  
Fontmin 做的事情简单来说，引用字体文件弄成 fontface，然后在 font-family 中引用该自定义字体，最赞的一点是，不需要引进该字体完整的字形，只取你自己需要的文字产出的定制化的字符文件，譬如最近一个项目用到的思源黑体（bold），完整的字符文件 22.6MB，其实我只要几个字，产出的 ttf 只有 7KB，真心牛，给 32 个赞！  
<!--more-->  
我用的是 OS 版的 fontmin-app（可以点 [这里](https://github.com/ecomfe/fontmin-app/releases) 下载哈），可视化界面，拖进字体文件（tff 格式），输入目标文字，点击“生成”，然后帮你生成 css 文件（fontface 声明）和相关格式的字体文件 eot/svg/ttf/woff（多种格式应该是出于浏览器兼容的考虑吧~）  
    @font-face {  
        font-family: "SourceHanSansK-Bold";  
        src: url("SourceHanSansK-Bold.eot"); /* IE9 */  
        src: url("SourceHanSansK-Bold.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */  
        url("SourceHanSansK-Bold.woff") format("woff"), /* chrome, firefox */  
        url("SourceHanSansK-Bold.ttf") format("truetype"), /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */  
        url("SourceHanSansK-Bold.svg#SourceHanSansK-Bold") format("svg"); /* iOS 4.1- */  
        font-style: normal;  
        font-weight: normal; }  
    `</pre>  
    引用很简单~  
    <pre>`font-family: "SourceHanSansK-Bold";  
    font-size: 36px;  
但是问题来了，思源黑体网上下载的一般是 otf 格式的文件，而 fontmin 只支持 tff，怎么破？  
都 12 点了，先这样吧，后续再记录一下怎么在 OS 上把字体文件的格式从 otf 转成 tff。  
* * *
/** 我是华丽的分割线 **/  
* * *
好，下面讲一下在 MAC 上怎么把 otf 转成 ttf。  
推荐一个 app：Fontographer  
步骤：  
*   准备好字体文件（otf 格式）
*   在 Fontographer 中打开 otf 文件【file -&gt; open】
*   转换格式【file -&gt; generate font files -&gt; ttf】
