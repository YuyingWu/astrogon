---
title: CSS Variables学习笔记
published: 2018-01-11 17:32:16
categories: [tech]
tags: [css]
type: photo
---
最近看了下 CSS Variables（CSS 变量，又名 CSS 自定义属性），跟大家分享一下我的学习笔记。

## 一、什么是 CSS Variables
来，直接看 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_variables) 上的描述：

> CSS 变量是由 CSS 作者定义的实体，其中包含要在整个文档中重复使用的特定值。使用自定义属性来设置变量名，并使用特定的 var() 来访问。

```
color: var(--main-color);

```
## 二、学习笔记
### 1. 声明 & 调用
#### i. 声明方式
CSS 变量声明的方式非常简单，如下，声明了一个名叫 `color` 的 CSS 变量。

* 在 css 文件中写
* 写在 html 标签的 inline-style 里
* 用 JS 给某个元素声明，方法 `.style.setProperty`
```css
body{

  --color: red;

}

```
```html
<body style="--color: red;"></body>

```
```javascript
document.getElementsByTagName('body')[0].style.setProperty('--color', 'red')
```
#### ii. 调用方式
通过 `var()` 函数调用，如：

```CSS
.block{

  color: var(--color);

}

```
#### iii. 变量的命名
说完声明和调用，还有个小问题。那么，CSS 变量的命名，有什么限制么？下面我们来测试一下。

```CSS
.foo-test{

  --foo:;

  --ffoo:;

  --Foo: red;

  --FOo: blue;

  --FOO: green;

  /* 以下省略测试 className 的代码 */

}

```
从以上测试代码可以看出：

* CSS 变量的命名是大小写敏感的
* 不赋值或者赋值空格，都是无效的
### 2. 作用域 & 继承
CSS 变量也有作用域一说，而最顶层的作用域就是 `:root`，下面的所有的元素都可以共享相关 CSS 变量。

```CSS
:root{

  --color: green;

}

```
刚才我们在 `body`上，定义了`--color`，在`body`下的子元素，都会默认继承这个属性，随意使用。当然也可以重载，把`--color` 定义为别的值。

```html
<div class="block">

  <p>inherit color</p>

  <p class="css-var-text">overwrite color - hello world</p>

</div>

```
```css
body{

  --color: green;

}

.block{

  color: var(--color);

}

.css-var-text{

  --color: red;

  color: var(--color);

}

```
`.block`，作为 `body`的子元素，继承了`--color` 属性，所以边框出来就是`green`。

而 `.css-var-text` 在自己的作用域中，重写了`--color`，出来的字体颜色是 overwrite 后的`blue`。

### 3. 浏览器支持
#### i. 浏览器支持现状
来看看 [caniuse](https://caniuse.com/#search=css%20variables) 上 CSS Variables (Custom Properties) 的支持度：

PC 的话，IE 11 和 Edge 的支持度都很差，而Chrome（2016.3）、Firefox（2017.11）和 Safari(2017.3) 的一些新版本都是支持的，相信很快就能普及。

Mobile 的话，Safari 在 2016年的版本已经支持 CSS 变量了，但 Opera、Chrome、UC 等的支持还不太好。

#### ii. fallbacks
浏览器的支持度不太好，我们又想玩新东西的话，就需要考虑如果浏览器不支持 CSS 变量，怎么优雅降级。（嗷，两套代码是有点……）

```CSS
/* 当浏览器不支持 CSS 变量 */

.browser-support{

  background: red;

}

/* 当浏览器支持 CSS 变量 */

@supports (--css: variables) {

  .browser-support{

    background: var(--color);

  }

}

```
## 三、代码习作
### 1. codepen
在学习 CSS Variables 的时候，有边写一些教程的 demo，除了以上，还包括一些实际场景的应用，如像 box-shadow复合属性的拆解，以及 JS 操作 CSS 变量等。

<p data-height="500" data-theme-id="0" data-slug-hash="dZrYJg" data-default-tab="css,result" data-user="wuyuying" data-embed-version="2" data-pen-title="CSS Varibles Study Notes" class="codepen">See the Pen <a href="https://codepen.io/wuyuying/pen/dZrYJg/">CSS Varibles Study Notes</a> by Y (<a href="https://codepen.io/wuyuying">@wuyuying</a>) on <a href="https://codepen.io">CodePen</a>.</p>

<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 2. flexbox 属性的 DEMO
之前在团队也做过一下下 flexbox 的分享，大家也知道，flex 属性和对应的值特别多，当时就很想做个可以随时变属性值看效果的 playground。

但想了下传统的实现方式，貌似没有优雅的方法。

* CSS+JS 实现：写一批 classname，option切换时，通过JS 修改 classname 改变样式；
* 纯JS 实现，根据 option 的 value 用 JS 改写元素的 inline style（一直修改 dom）
哎哟，换 CSS Variables 之后，一切就不一样了，可继承、可复用、易维护，目前实现比较简单，可能跟以上的传统方式差别不太大，不过后续要修改或者做更多优化，我相信优势就会凸显出来了。

demo 传送门：[wuyuying.com/flexbox-css-var](http://wuyuying.com/flexbox-css-var/)

[github 传送门](https://github.com/YuyingWu/blog-modern/blob/master/pages/flexbox-css-var.js)

## 小结
哈哈，没想到小结写什么，如果大家有好玩的 CSS Variables 的应用，欢迎分享给我：）
