---
title: GraphQL in Action
categories: [tech]
tags: [note]
published: 2018-08-15 23:11:24
updateDate: 2018-09-24 18:20:13
---
## GraphQL 解决什么问题
### REST-ful Routing
Given a collection of records on a server, there should be a uniform URL and HTTP request method to utilize that collection of records.  
### GraphQL 是如何解决问题的
在 REST-ful API 中，我们会一层一层地定义路由，但假如出现上图的多层结构，我们希望：  
* 查询“当前用户的所有朋友的公司名” 
  * 利用当前用户查询朋友的 userId，再用每个人的 userId 查询 company `users/currentUserID/friends` -> `users/friendUserID/company`
  * `users/currentUserID/friends/companies` 
* 获取”当前用户的所有朋友的公司名 + 位置“
  * `users/currentUserID/friends_with_position_and_company`
有可能需要提供 3 个或更多不同的路由。  
若是层级嵌套或组合更多，REST-ful 的路由规则会越来越多和复杂，GraphQL 就是解决这类问题的利器。  
Graph（图）表达了节点和节点间的 Edges（路径）。  
同样地要实现”获取当前用户的所有朋友的公司名 + 位置“，我们会这样告诉 GraphQL：  
1. 查询 `userID`为`N` 的当前用户`WYY`
2. 查询所有朋友为 `WYY` 的用户数组`X`
3. 查询每个 `X`下的`company` 和`position`
```
query{  
  user(id: "N") {  
    friends {  
      company {  
        name  
      }  
      position {  
        address  
      }  
    }  
  }  
}  
```
## GraphQL 服务器作为代理层
### 当数据库在自己的服务器
### 当我们使用第三方数据源
### 中间层：Express/GraphQL Server
当我们的服务需要结合本地数据源和第三方数据源时，可以通过 Express/GraphQL 服务器统一处理数据源的聚合和结构抹平，再把 api 提供给前端应用使用。  
## 什么情况下，我们需要 Resolver
如上图，当数据库的 model 设计的字段 `companyId`，和 GraphQL 的 query 需要获取的字段`companyName`不一致时，需要在 GraphQLType 定义字段`companyName`中添加对应的 resolver，以入参`companyId` 查询数据库中对应的项，再 return 对应`companyName`。  
也就是说，当数据库 model 和 GraphQL 对象的字段对应不上，返回数据和入参需要特别处理时，`resolver` 来完成这样的工作。  
```
const UserType = new GraphQLObjectType({  
  name: 'User',  
  fields: () => ({  
    id: { type: GraphQLID },  
    firstName: { type: GraphQLString },  
    age: { type: GraphQLInt },  
    company: {  
      type: new GraphQLList(CompanyType),  
      resolve(parent, args) {  
        // code to get data from db / other source  
        // args.id  
        return CompanyDBModel.find({  
          companyId: parent.companyId  
        });  
      }  
    }  
  })  
});  
```
## DB model 和 GraphQL 的设计差异
数据库中的表结构：    
`User`的属性 `companyId`，关联着`Company`的`id` 属性。  
Graph（图）结构：    
* 0 级：RootQueryType，属性 `user` 类型为`UserType`
* 1 级：`UserType`通过数据库中的 `companyId`查询到`company` 的数据，再返回到`UserType.company`
## Query 语法
### 别名
```
{  
  apple: company(id: "1") {  
    id  
  }  
  google: compnay(id: "2") {  
    id  
  }  
}  
```
请求了两次 company，入参 id 分别为 1 和 2，返回结果是：  
```
{  
  data: {  
    apple: {  
      id: "1"  
    },  
    google: {  
      id: "2"  
    }  
  }  
}  
```
### query fragment 查询片段
有时候多个 query 会共享一些查询属性，如：  
```
{  
  apple: company(id: "1") {  
    id  
    name  
    description  
  }  
  google: compnay(id: "2") {  
    id  
    name  
    description  
  }  
}  
```
两个 query 查询一致的字段（`id`、`name`、`desciption`），加入需要修改，需要多处修改。这个时候，我们可以声明一段 query fragment，维护这份公用的 query 字段。  
```
{  
  apple: company(id: "1") {  
    ...companyFields  
  }  
  google: compnay(id: "2") {  
    ...companyFields  
  }  
}  
fragment companyFields on Company {  
  id  
  name  
  description  
}  
```
划重点：  
1. 用关键字 `fragment` 声明查询片段`companyFields`；
2. 关键字 `on` 后是 GraphQLType`Company`，表明以下字段属于类型`Company`，GraphQL 也会对这些字段作类型和是否存在的检查；
3. 在 query 语句中，使用 `...companyFields`。
## 当 GraphQL 遇到前端
> DB -> Express/GraphQL Server -> GraphQL Client -> ReactJS

其中，GraphQL Client 担当了类似 GraphiQL 的角色，把 query 转化为 HTTP 请求。  
以下是几个 GraphQL Client 框架的介绍和对比。  
下面的 demo 以 Apollo 为例。  
### React 应用接入 Apollo
1. 创建一个`Apollo Client`对象（与 server 端相关 GraphQL 配置关联）；
2. 引入 `react-apollo`，类似 Redux，把从服务器端获取的 GraphQL 相关请求的返回数据打进 react 组件的 props 中。
```js
import React from 'react';  
import ReactDOM from 'react-dom';  
import ApolloClient from 'apollo-client';  
import { ApolloProvider } from 'react-apollo';  
import App from './compenents/App';  
const client = new ApolloClient({});  
const Root = () => {  
  return (  
    <ApolloProvider client={client}>  
      <App />  
    </ApolloProvider>  
  )  
};  
ReactDOM.render(  
  <Root />,  
  document.querySelector('#root')  
);  
```
### 在 React 组件中利用 GraphQL 查询数据
> #### [graphql-tag](https://www.npmjs.com/package/graphql-tag)
> 把 GraphQL 的 query 字符串转化成 GraphQL 的 AST。  
> #### [React Apollo](https://s3.amazonaws.com/apollo-docs-1.x/index.html)
> 基于 Apollo Client，在 react 应用中管理服务器端 GraphQL 的数据。

#### 数据请求
* 步骤一、引入了 `graphql-tag`和`react-apollo` 的`graphql`
* 步骤二、查询 songList 数据的 GraphQL query，在 GraphiQL 面板中调试 query
* 步骤三、给组件打入基于这段 query 的数据管理，`graphql(query)(SongList)`
#### 数据返回（query）
Apollo 帮我们做了请求和返回数据的事情，通过以上的连接，组件在加载时会基于那段 query 发一个请求，组件 props 的变化会有以下 2 个阶段。  
* 阶段一、请求发送开始。此时 `this.props`的`data`就是 Apollo 更新的状态，其中有个`loading` 字段，值为`true`，用于标记请求在发送中，但返回数据还没有回来。
* 阶段二、接收到请求数据。此时 `loading`的值是`false`，且多了`songs` 字段（我们在 query 中定义的结构），我们就可以根据返回值做我们想做的事情。
```js
import React, { Component } from 'react';  
import gql from 'graphql-tag';  
import { graphql } from 'react-apollo';  
class SongList extends Component {  
  render() {  
    const { data = {} } = this.props;  
    const { loading, songs } = data;  
    return (  
      <div>  
        <h1>song List</h1>  
        <ul className="collection">  
          { !loading && songs.length ? songs.map(song => (  
            <li className="collection-item" key={`song-${song.id}`}>{ song.title }</li>  
          )) : <li>Loading...</li> }  
        </ul>  
      </div>  
    );  
  }  
}  
const query = gql`  
  query {  
    songs {  
      title  
      id  
    }  
  }  
`;  
export default graphql(query)(SongList);  
```
若 query 需要接收动态传入的参数，Apollo Clien 支持对 `query`传入`options` 参数。  
```js
export default graphql(query, {  
  options: props => {  
    return {  
      variables: {  
        songId: props.params.songId,  
      }  
    }  
  }  
})(Song);  
```
### 当 React 遇上 GraphQL mutation
query 可以跟着组件的生命周期走，但是 mutation 很多时候是在用户跟页面有交互时才触发的，应该怎么在事件的回调函数中加入 GraphQL mutation 呢？  
```js
// 组件中的 click 提交函数  
onSubmit() {  
  const value = this.element.value;  
  const { mutate } = this.props;  
  mutate({  
    variables: { // 传给 mutation 的参数  
      title: value  
    }  
  }).then(() => {  
    // blah blah  
  });  
}  
const mutation = gql`  
  mutation addSong($title: String) {  
    addSong(title: $title) {  
      title  
    }  
  }  
`;  
```
同样的，Apollo 会在组件初始化时，把 mutation 函数传入 this.props，以供后续的调用。  
值得注意的是，mutation 一般是需要传入参数的，我们可以在声明 mutation 的字符串语句中，支持传入一个 String 类型的$  
> Warm Cache in Apollo
> 列表页中，query 执行一次后，返回了当前的数据（共 3 条）到 Apollo Store 存储在 `List` 中。
> 操作页中，当在别的 component 中对数据进行 mutation 后，服务器端的 list 数据多了一条（共 4 条）；
> 回到列表页，Apollo 不会 re-fetch，在 Apollo Store 的 `List` 绑定的是前 3 条数据（已经请求过了），并不会重新发请求把服务器中新增的第 4 条更新到列表中。
> 解决方式：在 mutation 后，refetch 希望更新到最新数据的 query。

```js
mutate({  
  variables: {  
    title: value  
  },  
  refetchQueries: [{  
    query: fetchSongQuery, // refetch 指定的 query  
  }]  
}).then(() => {  
  // callback  
});  
```
