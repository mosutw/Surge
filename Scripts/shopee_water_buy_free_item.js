let showNotification = true;
let config = null;
let buyFreeItemRequest = null;

function surgeNotify(subtitle = '', message = '') {
  $notification.post('π€ θ¦θ¦ζεεθ²»ιε·', subtitle, message, { 'url': 'shopeetw://' });
};

function handleError(error) {
  if (Array.isArray(error)) {
    console.log(`β ${error[0]} ${error[1]}`);
    if (showNotification) {
      surgeNotify(error[0], error[1]);
    }
  } else {
    console.log(`β ${error}`);
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

function cookieToString(cookieObject) {
  let string = '';
  for (const [key, value] of Object.entries(cookieObject)) {
    string += `${key}=${value};`
  }
  return string;
}

async function preCheck() {
  return new Promise((resolve, reject) => {
    const shopeeInfo = getSaveObject('ShopeeInfo');
    if (isEmptyObject(shopeeInfo)) {
      return reject(['ζͺ’ζ₯ε€±ζ βΌοΈ', 'ζ²ζζ°η token']);
    }
    const shopeeHeaders = {
      'Cookie': cookieToString(shopeeInfo.token),
      'Content-Type': 'application/json',
    }
    config = {
      shopeeInfo: shopeeInfo,
      shopeeHeaders: shopeeHeaders,
    }
    return resolve();
  });
}

async function getWaterStoreItem() {
  return new Promise((resolve, reject) => {
    try {
      const waterStoreItemListRequest = {
        url: `https://games.shopee.tw/farm/api/prop/list?storeType=2&typeId=&isShowRevivalPotion=true&t=${new Date().getTime()}`,
        headers: config.shopeeHeaders,
      };
      $httpClient.get(waterStoreItemListRequest, function (error, response, data) {
        if (error) {
          return reject(['εεΎιε·εθ‘¨ε€±ζ βΌοΈ', 'ι£η·ι―θͺ€']);
        } else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            if (obj.msg === 'success') {
              const props = obj.data.props;
              let found = false;
              for (const prop of props) {
                if (prop.price === 0) {
                  found = true;
                  if (prop.buyNum < prop.buyLimit) {
                    buyFreeItemRequest = {
                      url: `https://games.shopee.tw/farm/api/prop/buy/v2?t=${new Date().getTime()}`,
                      headers: config.shopeeHeaders,
                      body: {
                        propMetaId: prop.propMetaId,
                      }
                    };
                    return resolve(prop.name);
                  }
                  else {
                    showNotification = false;
                    return reject(['ζ²ζε―θ³Όθ²·ηεθ²»ιε· βΌοΈ', `ζ¬ζ₯ε·²θ³Όθ²·εθ²»${prop.name}`]);
                  }
                }
              }
              if (!found) {
                showNotification = false;
                return reject(['εεΎιε·εθ‘¨ε€±ζ βΌοΈ', 'ζ¬ζ₯η‘εθ²»ιε·']);
              }
            } else {
              return reject(['εεΎιε·εθ‘¨ε€±ζ βΌοΈ', `ι―θͺ€δ»£θοΌ${obj.code}οΌθ¨ζ―οΌ${obj.msg}`]);
            }
          } else {
            return reject(['εεΎιε·εθ‘¨ε€±ζ βΌοΈ', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['εεΎιε·εθ‘¨ε€±ζ βΌοΈ', error]);
    }
  });
}

async function buyFreeItem() {
  return new Promise((resolve, reject) => {
    try {
      $httpClient.post(buyFreeItemRequest, function (error, response, data) {
        if (error) {
          return reject(['θ³Όθ²·ιε·ε€±ζ βΌοΈ', 'ι£η·ι―θͺ€']);
        } else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            if (obj.msg === 'success') {
              return resolve();
            }
            else {
              return reject(['θ³Όθ²·ιε·ε€±ζ βΌοΈ', `ι―θͺ€δ»£θοΌ${obj.code}οΌθ¨ζ―οΌ${obj.msg}`]);
            }
          } else {
            return reject(['θ³Όθ²·ιε·ε€±ζ βΌοΈ', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['θ³Όθ²·ιε·ε€±ζ βΌοΈ', error]);
    }
  });
}

(async () => {
  console.log('βΉοΈ θ¦θ¦ζεεθ²»ιε· v20230128.1');
  try {
    await preCheck();
    console.log('β ζͺ’ζ₯ζε');
    const itemName = await getWaterStoreItem();
    console.log('β εεΎηΉεΉεεΊιε·εθ‘¨ζε');
    await buyFreeItem();
    console.log('β θ³Όθ²·εθ²»ιε·ζε');
    console.log(`βΉοΈ η²εΎ ${itemName}`);
    surgeNotify(
      'θ³Όθ²·εθ²»ιε·ζε β',
      `η²εΎ π ${itemName} π`
    );
  } catch (error) {
    handleError(error);
  }
  $done();
})();
