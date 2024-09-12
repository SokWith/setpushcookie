// functions/worker.js
export async function onRequest(context) {
  const { request, env } = context;
  const password = env.PASSWORD || '123456';

  function filterCookieValues(cookieValues, keepKeys) {
    let newCookieValues = "";
    let pairs = cookieValues.split(";");
    for (let pair of pairs) {
      let parts = pair.split("=");
      let key = parts[0].trim();
      let value = parts.slice(1).join("=");
      if (keepKeys.includes(key)) {
        newCookieValues += key + "=" + value + "; ";
      }
    }
    newCookieValues = newCookieValues.slice(0, -2);
    return newCookieValues;
  }

  const url = new URL(request.url);
  const pwd = url.searchParams.get('pwd');
  const path = url.pathname;

  if (path === '/SET') {
    if (!pwd || pwd !== password) {
      return new Response('Invalid password', { status: 401 });
    }
    const cookieValues = request.headers.get('Cookie-Values');
    const keepKeys = ["_U", "MUID", 'KievRPSSecAuth', 'cct', '_RwBf', 'SRCHHPGUSR', 'WLS'];
    const keepKeysU = ["_U", "WLS"];
    const setValue = filterCookieValues(cookieValues, keepKeys);
    const getUValue = filterCookieValues(cookieValues, keepKeysU);

    if (setValue) {
      await env.COOKIE_VALUES.put('values', setValue);
      if (getUValue) {
        let strUvalues = await env.COOKIE_VALUES.get('uvalues') || '';
        if (!strUvalues.includes(getUValue)) {
          strUvalues += ';' + getUValue;
          await env.COOKIE_VALUES.put('uvalues', strUvalues);
        }
      }
      return new Response('Set value successfully');
    } else {
      return new Response('No Cookie-Values in header', { status: 400 });
    }
  } else if (path === '/GET') {
    if (!pwd || pwd !== password) {
      return new Response('Invalid password', { status: 401 });
    }
    const values = await env.COOKIE_VALUES.get('values');
    const result = { result: { cookies: values } };
    return new Response(JSON.stringify(result));
  } else if (path === '/CLS') {
    if (!pwd || pwd !== password) {
      return new Response('Invalid password', { status: 401 });
    }
    let strUvalues = await env.COOKIE_VALUES.get('uvalues') || '';
    const replacedStr = strUvalues.replace(/;/g, "<br>");
    await env.COOKIE_VALUES.put('values', '');
    await env.COOKIE_VALUES.put('uvalues', '');
    return new Response('Clear value successfully' + "\n" + replacedStr);
  } else if (path === '/HisU') {
    if (!pwd || pwd !== password) {
      return new Response('Invalid password', { status: 401 });
    }
    let strUvalues = await env.COOKIE_VALUES.get('uvalues') || '';
    const replacedStr = strUvalues.replace(/;/g, "<br>");
    return new Response('Ukey History:' + "\n" + replacedStr);
  } else {
    return new Response('Please visit /SET /GET or /CLS with ?pwd=xxxxxx');
  }
}
