// src/template/worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    // 从环境变量中获取密码
    const password = env.PASSWORD || '123456';

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

    // 获取请求的方法
    let method = request.method;
    // 获取 pwd 参数的值
    let url = new URL(request.url);
    let pwd = url.searchParams.get('pwd');
    
    // 根据请求路径进行不同的处理
    let path = url.pathname;
    if (path === '/SET') {
      // 处理 SET 请求
      // 如果没有 pwd 参数，或者 pwd 参数的值不等于密码变量的值，返回错误信息
    if (!pwd || pwd !== password) {
      return new Response('Invalid password', {status: 401});
    }
      // 获取请求头中的 set-Values 值
      let cookieValues = request.headers.get('Cookie-Values');

      // 定义一个数组，包含要保留的键
      let keepKeys = ["_U", "MUID", 'KievRPSSecAuth', 'cct', '_RwBf', 'SRCHHPGUSR', 'WLS'];
      let keepKeysU = ["_U", "WLS"];
      // 调用函数，传入 Cookie-Values 和要保留的键的数组，得到新的 Cookie-Values 值
      let setValue = filterCookieValues(cookieValues, keepKeys);
      let getUValue = filterCookieValues(cookieValues, keepKeysU);

      // 如果有值，就存入 KV
      if (setValue) {
        await env.COOKIE_VALUES.put('values', setValue);
        if (getUValue){
          // 如果 getUValue 不在 strUvalues 中，将其添加到 strUvalues 中
          let strUvalues = await env.COOKIE_VALUES.get('uvalues') || '';
          if (!strUvalues.includes(getUValue)) {
            strUvalues += ';' + getUValue;
            await env.COOKIE_VALUES.put('uvalues', strUvalues);
          }
        }
        // 返回成功信息
        return new Response('Set value successfully');
      } else {
        // 返回错误信息
        return new Response('No Cookie-Values in header', {status: 400});
      }
    } else if (path === '/GET') {
      // 处理 GET 请求
      // 如果没有 pwd 参数，或者 pwd 参数的值不等于密码变量的值，返回错误信息
    if (!pwd || pwd !== password) {
      return new Response('Invalid password', {status: 401});
    }
      // 从 KV 中获取值
      let values = await env.COOKIE_VALUES.get('values');
      // 将值添加到 JSON 数据中
      let result = { result: { cookies: values } };
      // 返回 JSON 数据
      return new Response(JSON.stringify(result));
    } else if (path === '/CLS') {
      // 处理 CLS 请求
      // 如果没有 pwd 参数，或者 pwd 参数的值不等于密码变量的值，返回错误信息
    if (!pwd || pwd !== password) {
      return new Response('Invalid password', {status: 401});
    }
      //显示历史值
      let strUvalues = await env.COOKIE_VALUES.get('uvalues') || '';
      const replacedStr = strUvalues.replace(/;/g, "<br>");
      // 清除 KV 中的值
      await env.COOKIE_VALUES.put('values', '');
      await env.COOKIE_VALUES.put('uvalues', '');
      // 返回成功信息
      return new Response('Clear value successfully'+ "\n" + replacedStr);
    } else if (path === '/HisU') {
      // 处理 HisU 请求
      // 如果没有 pwd 参数，或者 pwd 参数的值不等于密码变量的值，返回错误信息
    if (!pwd || pwd !== password) {
      return new Response('Invalid password', {status: 401});
    }
      //显示历史值
      let strUvalues = await env.COOKIE_VALUES.get('uvalues') || '';
      const replacedStr = strUvalues.replace(/;/g, "<br>");
      // 返回成功信息
      return new Response('Ukey History:'+ "\n" + replacedStr);
    } else {
      // 处理 / 请求
      // 返回提示信息
      return new Response('Please visit /SET /GET or /CLS with ?pwd=xxxxxx');
    }
  }
};

export default worker_default;
