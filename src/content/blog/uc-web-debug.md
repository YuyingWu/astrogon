---
title: UC浏览器调试无线页面
categories: [tech]
tags: []
published: 2016-04-19 14:20:54
---
上次写了篇 [《Safari 调试无线页面》](/archives/safari-web-debug/)，有小伙伴进来的第一反应是，需要一台 MacBook 和 iPhone，臣妾做不到呀！  
让使用安卓设备的小伙伴情何以堪，于是有了姐妹篇，也就是本文《UC 浏览器调试无线页面》  
准备：  
1. Android 设备和 [UC 浏览器开发者版](http://www.uc.cn/business/developer/)
2. 浏览器（小编用的 [Chrome](http://www.google.cn/chrome/browser/)，真的不要再用低版本 IE 了好吗~）
概要步骤：  
```
Wifi 条件下，PC 浏览器输入手机 ip:9998 打开 UC 浏览器的调试界面  
```
<!-- more -->  
***  
## Android 手机配置
1. 准备：在手机上安装 UC 浏览器开发者版本
2. 使用 UC 浏览器开发版打开需要调试的页面
3. 查看手机 IP
```
设置 - WLAN - 选中连接中的 WiFi - IP 地址  
```
## 浏览器端
在 WiFi 环境下，保持手机与 PC 处于同一个无线网段即可（连接同一个 WiFi）  
浏览器的访问地址：  
```
访问地址：手机 IP:9998  
```
## 授权访问
电脑浏览器访问该地址时，UC 浏览器会弹窗提示“是否允许远端设备的调试请求？”确定即可。  
在 PC 调试界面中，选中你需要调试的 tab，就会出现 console 的界面，enjoy 你的调试过程吧！  
