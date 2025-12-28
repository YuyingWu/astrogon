---
title: 图解HTTP
categories: [tech,reading]
tags: [http]
published: 2015-02-26 18:33:38
---
还记得刚开始工作，GET 和 POST 请求我都不知道是什么，尽管在大学学过《计算机网络》。经过 1 年的工作，初步对此有了认识（发一个异步请求从服务器端获取我需要的东西），感谢 @maxiao 送我这本 [《图解 HTTP》](http://book.douban.com/subject/25863515/)，让我重新认识 HTTP。  
全书的内容很多很多，包括 HTTP 诞生的背景、版本，它的 method、报文结构以及具体参数的解释、状态码，更延伸出 HTTPS、身份验证以及 web 安全等等的知识，有兴趣的同学不妨去读一读，很生动有趣~  
下面只摘录我了解的关于 HTTP 协议最基础的认识 :)  
<!--more-->  
### 一、各种协议和 HTTP 协议的关系
1.  GET 获取资源
2.  POST 传输实体主体
3.  PUT 传输文件
4.  HEAD 获得报文首部
5.  DELETE 删除文件
6.  OPTIONS 询问支持的方法
7.  TRACE 追踪路径
8.  CONNECT 要求用隧道协议连接代理
### 二、HTTP 的那些方法（method）
* * *
* * *
### 三、HTTP 报文结构
### 四、状态码
| 状态码        | 类别           | 原因短语  |  
| ------------- |:-------------:| -----:|  
| 1XX      | information（信息性状态码） | 接收的请求正在处理 |  
| 2XX      | success（成功状态码）      |   请求正常处理完毕 |  
| 3XX | redirection（重定向状态码）      |    需要进行附加操作以完成请求 |  
| 4XX      | client error（客户端错误状态码）      |   服务器无法处理请求 |  
| 5XX | server error（服务器错误状态码）      |    服务器处理请求出错 |  
