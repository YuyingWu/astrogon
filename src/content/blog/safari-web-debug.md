---
title: Safari调试无线页面
categories: [tech]
tags: []
published: 2016-02-25 13:36:54
---
进行无线开发时，很多时候会发现，有些 bug 是在电脑浏览器如 chrome 模拟时无法复现的，得在真机上调试。无奈手机浏览器没有 PC 的功能那么完善，不设断点很难调试，于是以前我会使用比较傻的方式是，用原生的 alert 输出我想得到的信息（人肉断点）。  
后来还是 QA 同学告诉我，可以用 Safari 连接 mobile 和 PC，在 PC Safari 中打开调试界面，console 设断点或者执行各种命令进行调试，在 mobile Safari 中浏览效果，非常方便，在这记录一下 :)  
<!--more-->  
准备：  
1. 一台 Macbook
2. 一台 iPhone
没有 mac 和 iPhone 怎么破？没事，看看姐妹篇 [《UC 浏览器调试无线页面》](/archives/uc-web-debug/)  
* * *
## Mac OS Safari 设置
Safari - 偏好设置 - 高级 - 在菜单栏中显示“开发”菜单  
## iPhone iOS Safari 设置：
设置 - Safari - 高级 - web 检查器 - 打开  

* * *
okay，所有设置都好啦，接下来可以开始调试啦~~~  
### Step 1:
把手机连接到电脑上~  
### Step 2:
打开 Mac Safari  
### Step 3:
Mac Safari - 菜单“开发” - xxx's iPhone（找到你连接的 iPhone 的名字） - 选择你要调试的页面  
选中调试页面后，Safari 会自动打开一个调试窗口，在里面就可以开始查看各种元素和断点的设置等等，跟 PC 调试页面一样啦，很方便~  
譬如在这，我在 console 命令行执行一个 alert，手机屏幕上就会响应这个命令。  
