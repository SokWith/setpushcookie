
// 引入 express 模块
const express = require('express');
// 创建 express 应用
const app = express();
// 定义全局字符串变量
let strValues = '';
let strUvalues = '';
// 设置端口号
const port = 7860;
// 从环境变量中获取密码
const password = process.env.PASSWORD || '123456' ;

// 定义一个函数，接受 Cookie-Values 和要保留的键的数组作为参数
function filterCookieValues(cookieValues, keepKeys) {
  // 定义一个空字符串，用于存储新的 Cookie-Values 值
  let newCookieValues = "";
  // 用分号分割 Cookie-Values，得到一个键值对的数组
  let pairs = cookieValues.split(";");
  // 遍历每个键值对
  for (let pair of pairs) {
    // 用第一个等号分割键和值，得到一个数组
    let parts = pair.split("=");
    // 取出数组的第一个元素作为键，去除前后空格
    let key = parts[0].trim();
    // 把数组的剩余元素用等号连接起来，得到完整的值
    let value = parts.slice(1).join("=");
    // 如果键在要保留的键的数组中，就把键值对添加到新的 Cookie-Values 值中，用分号和空格分隔
    if (keepKeys.includes(key)) {
      newCookieValues += key + "=" + value + "; ";
    }
  }
  // 去除新的 Cookie-Values 值的最后一个分号和空格
  newCookieValues = newCookieValues.slice(0, -2);
  // 返回新的 Cookie-Values 值
  return newCookieValues;
}


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
  //let setValue = req.header('Cookie-Values');

  // 定义一个数组，包含要保留的键
let keepKeys = ["_U", 
                "MUID",
                'KievRPSSecAuth',
                'cct',
               '_RwBf',
               'SRCHHPGUSR'];
    // 定义一个数组，包含要保留的键
let keepKeysU = ["_U"];
// 从请求头中获取 Cookie-Values 字段的值
let cookieValues = req.header('Cookie-Values');
// 调用函数，传入 Cookie-Values 和要保留的键的数组，得到新的 Cookie-Values 值
let setValue = filterCookieValues(cookieValues, keepKeys);
  let getUValue = filterCookieValues(cookieValues, keepKeysU);

  // 如果有值，就存入全局变量
  if (setValue) {
    strValues = setValue;
    if (getUValue){
  // 如果 getUValue 不在 strUvalues 中，将其添加到 strUvalues 中
     if (!strUvalues.includes(getUValue)) {
        strUvalues += ';' + getUValue;
      }
    }
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
  //显示历史值
  const replacedStr = strUvalues.replace(/;/g, "<br>");
  // 分割字符串并构建 JSON 对象
const valuesArray = strUvalues.split(";");
const jsonObject = {};
valuesArray.forEach((value, index) => {
  jsonObject[`No${index + 1}`] = value; // 使用数字作为键，加上前缀 "No"
});

// 将 JSON 对象转换为字符串，并指定缩进格式
const jsonString = JSON.stringify(jsonObject, null, 2); // 使用 null 和 2 来指定缩进格式
  
  // 清除全局变量的值
  strValues = '';
  strUvalues = '';

  // 返回成功信息
  res.send('Clear value successfully'+ "\n" + replacedStr);
  // 返回 JSON 数据
  //res.json(jsonString);
  
});


// 处理 HisU 请求
app.all('/HisU', (req, res) => {
  // 获取请求的方法
  let method = req.method;
  // 获取 pwd 参数的值
  let pwd = req.query.pwd;
  // 如果没有 pwd 参数，或者 pwd 参数的值不等于密码变量的值，返回错误信息
  if (!pwd || pwd !== password) {
    res.status(401).send('Invalid password');
    return;
  }
  
  //显示历史值
  const replacedStr = strUvalues.replace(/;/g, "<br>");

  // 返回成功信息
  res.send('Ukey History:'+ "\n" + replacedStr);
  
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
