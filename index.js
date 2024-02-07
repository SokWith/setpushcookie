
// 引入 express 模块
const express = require('express');
// 创建 express 应用
const app = express();
// 定义全局字符串变量
let strValues = '';
// 设置端口号
const port = 7860;
// 从环境变量中获取密码
const password = process.env.PASSWORD || '123456' ;

// 处理 POST 请求
app.post('/SET', (req, res) => {
  // 获取请求的方法
  let method = req.method;
  // 获取 pwd 参数的值
  let pwd = req.query.pwd;
  // 如果没有 pwd 参数，或者 pwd 参数的值不等于密码变量的值，返回错误信息
  if (!pwd || pwd !== password) {
    res.status(401).send('Invalid password');
    return;
  }
  // 获取请求头中的 set-Values 值
  let setValue = req.header('Cookie-Values');
  // 如果有值，就存入全局变量
  if (setValue) {
    strValues = setValue;
    // 返回成功信息
    res.send('Set value successfully');
  } else {
    // 返回错误信息
    res.status(400).send('No Cookie-Values in header');
  }
});

// 处理 GET 请求
app.all('/GET', (req, res) => {
  // 获取请求的方法
  let method = req.method;
  // 获取 pwd 参数的值
  let pwd = req.query.pwd;
  // 如果没有 pwd 参数，或者 pwd 参数的值不等于密码变量的值，返回错误信息
  if (!pwd || pwd !== password) {
    res.status(401).send('Invalid password');
    return;
  }
  // 将全局变量添加到 JSON 数据中
  let result = { result: { cookies: strValues } };
  // 返回 JSON 数据
  res.json(result);
});

// 处理 CLS 请求
app.all('/CLS', (req, res) => {
  // 获取请求的方法
  let method = req.method;
  // 获取 pwd 参数的值
  let pwd = req.query.pwd;
  // 如果没有 pwd 参数，或者 pwd 参数的值不等于密码变量的值，返回错误信息
  if (!pwd || pwd !== password) {
    res.status(401).send('Invalid password');
    return;
  }
  // 清除全局变量的值
  strValues = '';
  // 返回成功信息
  res.send('Clear value successfully');
});

// 处理 / 请求
app.all('/', (req, res) => {
  // 返回提示信息
  res.send('Please visit /SET /GET or /CLS with ?pwd=xxxxxx');
});


// 监听端口
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

