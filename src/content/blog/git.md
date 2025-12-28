---
title: git学习笔记
published: 2017-01-23 18:35:51
categories: [tech]
tags: [note]
---
最近想要做博客的云端编码，在哪都能发日志，于是入了 coding.net 的坑，从 svn 转到 git 下~  
以前工作中，因为没有什么使用 git 的需要，说要学吧，总有各种理由没时间。为了小博客真是操碎了心，看了廖老师的教程，发现其实 git 跟 svn cli 还是有很多的相同之处，也没有特别陌生，相信不用多久就能上手了 :)  
本文是自己学习和记录用的，如果大家想看教程，还是推荐廖雪峰老师的 [《Git 教程》](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000)  
<!-- more -->  
## 关于版本库、工作区和暂存区
* 版本库/Repository：Git 版本库，会自动创建分支 master，以及指向 master 的 HEAD 指针；
* 工作区/Working Directory：你在本地写代码的目录；
* 暂存区/Stage：
	* 当你使用`git add`时，是把本地代码提交到暂存区；
	* 而使用`git commit`时，则把暂存区的代码提交到当前的分支；
## 常用命令
```
git clone git@github.com:YuyingWu/blog.git // 从远程库克隆  
git status // 查看状态  
// 文件处理  
git add <file> // 添加文件到暂存区  
git rm <file> // 从版本库删除文件  
git checkout -- <file> // 撤销更改  
git reset HEAD <file> // 撤销更改  
git diff HEAD -- <file> // 比较 diff  
git commit // 把暂存区的所有内容提交到当前分支  
// 分支管理  
git branch // 查看分支列表及当前分支，带参数-d 代表删除某分支  
git checkout branch-n // 切换到 xx 分支，带参数-b 代表创建并切换  
git checkout -b branch-n origin/branch-n // 创建与远程库对应的本地分支  
git merge branch-n // 合并 branch-n 的代码到当前分支  
// 分支推送  
git push origin master // origin 为远程库，master 为当前分支  
// 分支抓取  
git pull // pull = fetch + merge  
// 本地分支 push 到远程仓库  
git init  
git remote add origin git@github.com:YuyingWu/blog.git  
git add .  
git commit -m "init"  
git push origin preact:preact  
// 删除分支  
git push origin :Branch1 // 删除远程分支 :代表 delete  
git branch -d branchName // 删除本地分支  
```
## Git 小贴士
`问`：怎么生成 SSH key（SSH 密钥）？  
`答`：命令行执行以下代码。Mac 系统下，生成的 id_rsa.pub 和 id_rsa 在/Users/xxx/.ssh 目录。  
```
ssh-keygen -t rsa -C“your email address”  
```
`问`：想把一份代码同步到多个 git 源，咋整？  
`答`：打开本地工作区的.git/config 文件，给 remote "origin"多添加几个 url 即可  
`问`：RPC failed  
`答 `：默认 Git 设置`http post`的缓存为 1MB，改为 500MB 后成功提交  
```
// Question  
error: RPC failed; HTTP 411 curl 22 The requested URL returned error: 411 Length Required  
fatal: The remote end hung up unexpectedly  
// Solution  
git config http.postBuffer  524288000  
```
`问`：不同的 SSH key 给不同的站点使用  
`答 `：在`.ssh`目录下，添加`config` 文件，给对应的站点指定读对应的 rsa 文件  
```
Host github.com  
HostName github.com  
User git  
IdentityFile ~/.ssh/github_rsa  
Host git.coding.net  
User wuyuying1128@163.com  
PreferredAuthentications publickey  
IdentityFile ~/.ssh/coding_rsa  
```
