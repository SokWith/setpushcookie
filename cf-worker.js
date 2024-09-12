import {
  parse,
  serialize
} from "./cookie.js";

//import { Buffer } from 'buffer';


/**
 * 生成随机字符串
 
/**
 * 随机整数 [min,max)
 * @param {number} min
 * @param {number} max
 * @returns
 */
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

/* @param {number} e
 * @returns
 */
const randomString = (e) => {
  e = e || 32;
  const t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678_-+";
  var n = "";
  for (let i = 0; i < e; i++) n += t.charAt(getRandomInt(0, t.length));
  return n;
}


const WEB_CONFIG = {
  COOKIE_PWD: '123456', // 用于更新cookies的管理密码，建议使用数字密码。
};

const removeSCPHeaders = (res) => {
  res.headers.delete('content-security-policy');
  res.headers.delete('X-Frame-Options');
  return res;
}

const removeCORSHeaders = (res) => {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Headers', '*');
  return res;
}

const removeCacheHeaders = (res) => {
  res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  return res;
}

const withoutCCSHeaders = (res) => {
  removeCORSHeaders(res);
  removeCacheHeaders(res);
  removeSCPHeaders(res);
  return res;
}

const clearKVCookies = async (request, env) => {
  await env.CookieStore.delete('KievRPSSecAuth');
  await env.CookieStore.delete('_U');
  await env.CookieStore.delete('MUID');
  await env.CookieStore.delete('cct');
  await env.CookieStore.delete('_RwBf');
  await env.CookieStore.delete('SRCHHPGUSR');
  await env.CookieStore.delete('Cookie-Values');
  await env.CookieStore.delete('lastUpdated');
  return withoutCCSHeaders(new Response('已清理KV-Cookies!', { status: 200 }));
}

const setKVCookies = async (request, env) => {
  const cookies = parse(request.headers.get('Cookie-Values') || '');
  await env.CookieStore.put('KievRPSSecAuth', cookies['KievRPSSecAuth']);
  await env.CookieStore.put('_U', cookies['_U']);
  await env.CookieStore.put('MUID', cookies['MUID']);
  await env.CookieStore.put('cct', cookies['cct']);
  await env.CookieStore.put('_RwBf', cookies['_RwBf']);
  await env.CookieStore.put('SRCHHPGUSR', cookies['SRCHHPGUSR']);
  await env.CookieStore.put('lastUpdated', new Date().toGMTString());
const cookieValues = request.headers.get('Cookie-Values');
  // 如果header存在，转换为Buffer对象
 //   const buffer = Buffer.from(cookieValues, 'utf8');
    // 使用KV的put方法将Buffer对象存入KV，键名为'Cookie-Values'
    await env.CookieStore.put('Cookie-Values', cookieValues);
  return withoutCCSHeaders(new Response('已更新KV-Cookies!', { status: 200 }));
}

const getKVCookies = async (request, env) => {
  const KV_KievRPSSecAuth = await env.CookieStore.get('KievRPSSecAuth');
  //const KV_KievRPSSecAuth = randomString(16);
  const KV_RwBf = await env.CookieStore.get('_RwBf');
  const KV_U = await env.CookieStore.get('_U');
  //const KV_U = randomString(16);
  const KV_MUID = await env.CookieStore.get('MUID');
  const KV_cct = await env.CookieStore.get('cct');
  const KV_SRCHHPGUSR = await env.CookieStore.get('SRCHHPGUSR');
  const KV_CookieValues = await env.CookieStore.get('Cookie-Values');
  const toInject = (KV_U && KV_KievRPSSecAuth && KV_RwBf) != null;
  const script = `
    function get_cookie(name) {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
    }
    function set_cookie(name, value, minutes = 0, path = '/', domain = '') {
      let cookie = name + '=' + value + ';path=' + path;
      if (domain) {
          cookie += ';domain=' + domain;
      }
      if (minutes > 0) {
          const d = new Date();
          d.setTime(d.getTime() + minutes * 60 * 1000);
          cookie += ';expires=' + d.toUTCString();
      }
      document.cookie = cookie;
    }
    if (${toInject}) {
      set_cookie('KievRPSSecAuth', '${KV_KievRPSSecAuth}', 7 * 24 * 60, '/');
      set_cookie('_RwBf', '${KV_RwBf}', 7 * 24 * 60, '/');
      set_cookie('_U', '${KV_U}', 7 * 24 * 60, '/');
  //    set_cookie('_U', 'ASDFGHJKLWDVGUHN', 7 * 24 * 60, '/');
  //    set_cookie('MUID', '${KV_MUID}', 7 * 24 * 60, '/');
      set_cookie('cct', '${KV_cct}', 7 * 24 * 60, '/');
      set_cookie('SRCHHPGUSR', '${KV_SRCHHPGUSR}', 7 * 24 * 60, '/');
  //   set_cookie('SRCHHPGUSR', 'SRCHLANG=zh-Hans&BRW=NOTP&BRH=S&CW=422&CH=506&SCW=405&SCH=506&PV=0.1.0&PRVCW=1094&PRVCH=506&DPR=1.3&UTC=480&DM=0&IG=1B353B2BF840444FB2C0C32E33876CA9&HV=1700559405&WTS=63836156180&BZA=0&CIBV=1.1359.4', 7 * 24 * 60, '/');
    
  //  req.headers.set('CookiesValues', '${KV_CookieValues}');

  }
  `;
  const res = new Response(script, { status: 200 });
  res.headers.set('content-type', 'application/javascript');
  return withoutCCSHeaders(res);
}


const BeFluent = async (request, env) => {
  const script = `

  (function (workerScript) {
    if (!/MSIE 10/i.test (navigator.userAgent)) {
      try {
        var blob = new Blob (["  var fakeIdToId = {};  onmessage = function (event) {    var data = event.data,      name = data.name,      fakeId = data.fakeId,      time;    if(data.hasOwnProperty('time')) {      time = data.time;    }    switch (name) {      case 'setInterval':        fakeIdToId[fakeId] = setInterval(function () {          postMessage({fakeId: fakeId});        }, time);        break;      case 'clearInterval':        if (fakeIdToId.hasOwnProperty (fakeId)) {          clearInterval(fakeIdToId[fakeId]);          delete fakeIdToId[fakeId];        }        break;      case 'setTimeout':        fakeIdToId[fakeId] = setTimeout(function () {          postMessage({fakeId: fakeId});          if (fakeIdToId.hasOwnProperty (fakeId)) {            delete fakeIdToId[fakeId];          }        }, time);        break;      case 'clearTimeout':        if (fakeIdToId.hasOwnProperty (fakeId)) {          clearTimeout(fakeIdToId[fakeId]);          delete fakeIdToId[fakeId];        }        break;    }  }  "]);
        // Obtain a blob URL reference to our worker 'file'.
        workerScript = window.URL.createObjectURL(blob);
      } catch (error) {
        /* Blob is not supported, use external script instead */
      }
    }
    var worker,
      fakeIdToCallback = {},
      lastFakeId = 0,
      maxFakeId = 0x7FFFFFFF, // 2 ^ 31 - 1, 31 bit, positive values of signed 32 bit integer
      logPrefix = 'HackTimer.js by turuslan: ';
    if (typeof (Worker) !== 'undefined') {
      function getFakeId () {
        do {
          if (lastFakeId == maxFakeId) {
            lastFakeId = 0;
          } else {
            lastFakeId ++;
          }
        } while (fakeIdToCallback.hasOwnProperty (lastFakeId));
        return lastFakeId;
      }
      try {
        worker = new Worker (workerScript);
        window.setInterval = function (callback, time /* , parameters */) {
          var fakeId = getFakeId ();
          fakeIdToCallback[fakeId] = {
            callback: callback,
            parameters: Array.prototype.slice.call(arguments, 2)
          };
          worker.postMessage ({
            name: 'setInterval',
            fakeId: fakeId,
            time: time
          });
          return fakeId;
        };
        window.clearInterval = function (fakeId) {
          if (fakeIdToCallback.hasOwnProperty(fakeId)) {
            delete fakeIdToCallback[fakeId];
            worker.postMessage ({
              name: 'clearInterval',
              fakeId: fakeId
            });
          }
        };
        window.setTimeout = function (callback, time /* , parameters */) {
          var fakeId = getFakeId ();
          fakeIdToCallback[fakeId] = {
            callback: callback,
            parameters: Array.prototype.slice.call(arguments, 2),
            isTimeout: true
          };
          worker.postMessage ({
            name: 'setTimeout',
            fakeId: fakeId,
            time: time
          });
          return fakeId;
        };
        window.clearTimeout = function (fakeId) {
          if (fakeIdToCallback.hasOwnProperty(fakeId)) {
            delete fakeIdToCallback[fakeId];
            worker.postMessage ({
              name: 'clearTimeout',
              fakeId: fakeId
            });
          }
        };
        worker.onmessage = function (event) {
          var data = event.data,
            fakeId = data.fakeId,
            request,
            parameters,
            callback;
          if (fakeIdToCallback.hasOwnProperty(fakeId)) {
            request = fakeIdToCallback[fakeId];
            callback = request.callback;
            parameters = request.parameters;
            if (request.hasOwnProperty ('isTimeout') && request.isTimeout) {
              delete fakeIdToCallback[fakeId];
            }
          }
          if (typeof (callback) === 'string') {
            try {
              callback = new Function (callback);
            } catch (error) {
              console.log (logPrefix + 'Error parsing callback code string: ', error);
            }
          }
          if (typeof (callback) === 'function') {
            callback.apply (window, parameters);
          }
        };
        worker.onerror = function (event) {
          console.log (event);
        };
      } catch (error) {
        console.log (logPrefix + 'Initialisation failed');
        console.error (error);
      }
    } else {
      console.log (logPrefix + 'Initialisation failed - HTML5 Web Worker is not supported');
    }
  }) ('beFluent.js');
  
  `;
  const res = new Response(script, { status: 200 });
  res.headers.set('content-type', 'application/javascript');
  return withoutCCSHeaders(res);
}

export default {
  async fetch(request, env, ctx) {
    const currentUrl = new URL(request.url);
    if (['/setKVCookies', '/clearKVCookies'].includes(currentUrl.pathname)) {
      const urlParams = new URL(request.url).searchParams;
      if ((WEB_CONFIG.COOKIE_PWD || '') != (urlParams.get('pwd') || '')) {
        return new Response('Cookie管理密码错误!', { status: 400 });
      }
      if (!env.CookieStore) {
        return new Response('KV命名空间未配置!', { status: 500 });
      }
      if (currentUrl.pathname === '/setKVCookies') {
        return setKVCookies(request, env);
      } else if (currentUrl.pathname === '/clearKVCookies') {
        return clearKVCookies(request, env);
      } 
    } else if (currentUrl.pathname === '/KVCookies.js') {
      return getKVCookies(request, env);
    }
    else if (currentUrl.pathname === '/BeFluent.js') {
      return BeFluent(request, env);
    }
     else if (currentUrl.pathname.includes('/push') && (request.method === 'POST' || request.method === 'GET')) {
      let KVCookieValues = await env.CookieStore.get('Cookie-Values');
    //let KVCookieValues = (await env.CookieStore.get('Cookie-Values')).replace(/;/g, '; ');
      const result = { cookies: KVCookieValues };
      return new Response(JSON.stringify({ result }), { status: 200 });
    }

    return withoutCCSHeaders(new Response('null', { status: 404 }));
  },
};
