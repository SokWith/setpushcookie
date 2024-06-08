配合 https://github.com/iszhouhua/cookie-push 推送cookie的服务器部署

## 使用方法：
### 安装
1. 部署本服务器，比如 https://github.com/Harry-zklcdc/go-proxy-bingai/issues/276#issuecomment-1961478066
2. 在本地浏览器安装上面这个推送cookie的插件；
3. 在插件选项上设置推送的cookie及服务器地址，比如 https://github.com/Harry-zklcdc/go-proxy-bingai/issues/267#issuecomment-1851871695
### 使用
1. JSON输出的服务器部署可以当做 https://github.com/Harry-zklcdc/go-proxy-bingai 项目的人机验证服务器，host/GET?pwd=xxxxxx返回的是推送进去的JSON cookie，将这个地址当做人机验证服务器地址填入，就会自动人机验证时读入cookie，节省手动输入的麻烦。
2. workers的部署还有一种直接set-cookie返回，按上面第3项；
3. 如果有隐私顾虑（建议用小号处理这些AI应用），不要设置自动推送cookie，并在拉取cookie后 /CLS 清除服务器上保存的cookie；
4. 一般使用最新的cn.bing.com的cookie（即注销后重新登录获取的），大都不再需要人机验证；若需要人机验证，则需要更新填写人机验证服务器，比如 https://cct.nbing.eu.org 来认证cookie；
5. 体验地址：https://mycfoo-bingai.hf.space/ 在设置里面选择 【拉取推送cookie】；
### 优点
 1次推送，处处拉取，方便移动终端登录；

 ## AI的代码解释：
 ## Copilot
这段代码是一个使用 Express.js 框架的 Node.js 服务器应用程序。它主要用于处理和管理 Cookie-Values。以下是代码的详细解释：
- 引入 express 模块：这行代码引入了 Express.js 模块，Express 是一个用于 Node.js 的 web 应用框架。
- 创建 express 应用：这行代码创建了一个 Express 应用实例。
- 定义全局字符串变量：这两行代码定义了两个全局字符串变量 strValues 和 strUvalues，用于存储 Cookie-Values。
- 设置端口号：这行代码设置了服务器监听的端口号为 7860。
- 从环境变量中获取密码：这行代码从环境变量中获取密码，如果环境变量中没有密码，则默认为 '123456'。
- 定义一个函数 filterCookieValues：这个函数接受 Cookie-Values 和一个数组作为参数，该数组包含了需要保留的键。函数会遍历 Cookie-Values 中的每个键值对，如果键在保留键的数组中，就将该键值对添加到新的 Cookie-Values 中。
- 处理 POST 请求：这部分代码定义了一个路由处理器，用于处理发送到 '/SET' 的 POST 请求。它首先检查请求中是否包含 pwd 参数，如果没有或者 pwd 参数的值不等于预设的密码，就返回错误信息。然后，它从请求头中获取 Cookie-Values，调用 filterCookieValues 函数过滤 Cookie-Values，然后将过滤后的值存入全局变量。
- 处理 GET 请求：这部分代码定义了一个路由处理器，用于处理发送到 '/GET' 的所有类型的请求。它的工作方式与处理 POST 请求的路由处理器类似，但是它返回的是全局变量的值。
- 处理 CLS 请求：这部分代码定义了一个路由处理器，用于处理发送到 '/CLS' 的所有类型的请求。它的工作方式与处理 POST 请求的路由处理器类似，但是它会清除全局变量的值，并返回成功信息。
- 处理 HisU 请求：这部分代码定义了一个路由处理器，用于处理发送到 '/HisU' 的所有类型的请求。它的工作方式与处理 POST 请求的路由处理器类似，但是它会返回全局变量 strUvalues 的历史值。
- 处理 / 请求：这部分代码定义了一个路由处理器，用于处理发送到 '/' 的所有类型的请求。它返回一个提示信息，指导用户访问 '/SET'、'/GET' 或 '/CLS'，并附带 pwd 参数。
总的来说，这个服务器应用程序的主要功能是接收、过滤和存储 Cookie-Values，然后在需要时返回这些值。它还提供了一个接口来清除存储的值。这可能对于管理和调试 Cookie 相关的问题非常有用。希望这个解释对你有所帮助！

