let showNotification = true;
let config = null;

function surgeNotify(subtitle = '', message = '') {
  $notification.post('ð¤ è¦ç®æ´æ° token2', subtitle, message, { 'url': 'shopeetw://' });
};

function handleError(error) {
  if (Array.isArray(error)) {
    console.log(`â ${error[0]} ${error[1]}`);
    if (showNotification) {
      surgeNotify(error[0], error[1]);
    }
  } else {
    console.log(`â ${error}`);
    if (showNotification) {
      surgeNotify(error);
    }
  }
}

function getSaveObject(key) {
  const string = $persistentStore.read(key);
  return !string || string.length === 0 ? {} : JSON.parse(string);
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object ? true : false;
}

function parseCookie(cookieString) {
  return cookieString
    .split(';')
    .map(v => v.split('='))
    .filter((v) => v.length > 1)
    .reduce((acc, v) => {
      let value = decodeURIComponent(v[1].trim());
      for (let index = 2; index < v.length; index++) {
        if (v[index] === '') {
          value += '=';
        }
      }
      acc[decodeURIComponent(v[0].trim())] = value;
      return acc;
    }, {});
}

function cookieToString(cookieObject) {
  let string = '';
  for (const [key, value] of Object.entries(cookieObject)) {
    // SPC_EC å¦å¤å å¥
    if (key !== 'SPC_EC') {
      string += `${key}=${value};`
    }
  }
  return string;
}

async function updateSpcEc() {
  return new Promise((resolve, reject) => {
    let shopeeInfo = getSaveObject('ShopeeInfo');
    let shopeeToken;
    if (isEmptyObject(shopeeInfo)) {
      // å¯è½æ²ææ°çè³æï¼ç¨èçè©¦è©¦
      shopeeToken = $persistentStore.read('ShopeeToken');
      console.log('â ï¸ æ¾ä¸å°æ°ç tokenï¼ä½¿ç¨èç token');
      // return reject(['åå¾ token å¤±æ â¼ï¸', 'æ¾ä¸å°å²å­ç token']);
    } else {
      shopeeToken = shopeeInfo.shopeeToken;
      console.log('â æ¾å°æ°ç tokenï¼ä½¿ç¨æ°ç token');
    }

    const request = {
      url: 'https://mall.shopee.tw/api/v4/client/refresh',
      headers: {
        'Cookie': `shopee_token=${shopeeToken};`,
        'Content-Type': 'application/json',
      },
    };

    try {
      $httpClient.get(request, function (error, response, data) {
        if (error) {
          return reject(['æ´æ° SPC_EC å¤±æ â¼ï¸', 'é£ç·é¯èª¤']);
        } else {
          if (response.status == 200) {
            const obj = JSON.parse(data);
            if (obj.error) {
              return reject(['æ´æ° SPC_EC å¤±æ â¼ï¸', 'è«éæ°åå¾ token']);
            }
            const cookie = response.headers['Set-Cookie'] || response.headers['set-cookie'];
            if (cookie) {
              console.log('1..........');
              console.log(cookie);
              const filteredCookie = cookie.replaceAll('HttpOnly;', '').replaceAll('Secure,', '');
              const cookieObject = parseCookie(filteredCookie);

              // èæ¹æ³ï¼2/1 ä¹å¾å»¢æ£
              const spcEc = cookieObject.SPC_EC;
              const saveSpcEc = $persistentStore.write(spcEc, 'SPC_EC');

              if (!(saveSpcEc)) {
                return reject(['æ´æ° SPC_EC å¤±æ â¼ï¸', 'ç¡æ³å²å­èç SPC_EC']);
              } else {
                console.log('â ï¸ å²å­èç SPC_EC æå');
              }
              return resolve(spcEc);
            } else {
              return reject(['æ´æ° SPC_EC å¤±æ â¼ï¸', 'æ¾ä¸å°åæç token']);
            }
          } else {
            return reject(['æ´æ° SPC_EC å¤±æ â¼ï¸', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['æ´æ° SPC_EC å¤±æ â¼ï¸', error]);
    }
  });
}

async function updateCookie(spcEc) {
  return new Promise((resolve, reject) => {
    try {
      let shopeeInfo = getSaveObject('ShopeeInfo');
      let shopeeToken;
      if (isEmptyObject(shopeeInfo)) {
        // å¯è½æ²ææ°çè³æï¼ç¨èçè©¦è©¦
        shopeeToken = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') + ';shopee_token=' + $persistentStore.read('ShopeeToken');
        console.log('â ï¸ æ¾ä¸å°æ°ç tokenï¼ä½¿ç¨èç token');
        // return reject(['åå¾ token å¤±æ â¼ï¸', 'æ¾ä¸å°å²å­ç token']);
      } else {
        shopeeToken = `${cookieToString(shopeeInfo.token)}SPC_EC=${spcEc};shopee_token=${shopeeInfo.shopeeToken};`;
        console.log('â æ¾å°æ°ç tokenï¼ä½¿ç¨æ°ç token');
      }

      const request = {
        url: 'https://shopee.tw/api/v2/user/account_info?from_wallet=false&skip_address=1&need_cart=1',
        headers: {
          'Cookie': shopeeToken,
        },
      };

      $httpClient.get(request, function (error, response, data) {
        if (error) {
          return reject(['æ´æ° token å¤±æ â¼ï¸', 'é£ç·é¯èª¤']);
        } else {
          if (response.status == 200) {
            const obj = JSON.parse(data);
            if (obj.error) {
              return reject(['æ´æ° token å¤±æ â¼ï¸', 'è«éæ°åå¾ token']);
            }
            const cookie = response.headers['Set-Cookie'] || response.headers['set-cookie'];
            if (cookie) {
              const filteredCookie = cookie.replaceAll('HttpOnly;', '').replaceAll('Secure,', '');
              const cookieObject = parseCookie(filteredCookie);

              // èæ¹æ³ï¼2/1 ä¹å¾å»¢æ£
              const saveCookie = $persistentStore.write(filteredCookie, 'CookieSP');
              if (!(saveCookie)) {
                return reject(['æ´æ° token å¤±æ â¼ï¸', 'ç¡æ³å²å­èç token']);
              } else {
                console.log('â ï¸ å²å­èç token æå');
              }

              const tokenInfo = {
                SPC_EC: spcEc,
                SPC_R_T_ID: cookieObject.SPC_R_T_ID,
                SPC_R_T_IV: cookieObject.SPC_R_T_IV,
                SPC_SI: cookieObject.SPC_SI,
                SPC_ST: cookieObject.SPC_ST,
                SPC_T_ID: cookieObject.SPC_T_ID,
                SPC_T_IV: cookieObject.SPC_T_IV,
                SPC_U: cookieObject.SPC_U,
                SPC_F: cookieObject.SPC_F,
                SPC_CLIENTID: cookieObject.SPC_CLIENTID,
              }
              console.log(tokenInfo);
              if (isEmptyObject(shopeeInfo)) {
                const oldShopeeToken = $persistentStore.read('ShopeeToken');
                if (!oldShopeeToken || oldShopeeToken.length === 0) {
                  return reject(['ä¿å­å¤±æ', 'ç¡æ³å²å­æ°ç tokenï¼è«éæ°åå¾ token']);
                }
                shopeeInfo.shopeeToken = oldShopeeToken;
                shopeeInfo.userName = obj.data.username;
                console.log('â å»ºç«æ°ç token');
              }
              console.log(tokenInfo);
              shopeeInfo.token = tokenInfo;
              const save = $persistentStore.write(JSON.stringify(shopeeInfo, null, 4), 'ShopeeInfo');
              if (!save) {
                return reject(['ä¿å­å¤±æ â¼ï¸', 'ç¡æ³å²å­ token']);
              } else {
                return resolve();
              }
            } else {
              return reject(['æ´æ° token å¤±æ â¼ï¸', 'æ¾ä¸å°åå³ç token']);
            }
          } else {
            return reject(['æ´æ° token å¤±æ â¼ï¸', response.status])
          }
        }
      });
    } catch (error) {
      return reject(['æ´æ° token å¤±æ â¼ï¸', error]);
    }
  });
}

(async () => {
  console.log('â¹ï¸ è¦ç®æ´æ° token v20230115.1');
  try {
    const spcEc = await updateSpcEc();
    console.log('â SPC_EC æ´æ°æå');
    await updateCookie(spcEc);
    console.log('â token æ´æ°æå');
    $done();
  } catch (error) {
    handleError(error);
  }
  $done();
})();
