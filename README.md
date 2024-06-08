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
