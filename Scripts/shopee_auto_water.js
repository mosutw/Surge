let showNotification = true;
let config = null;

function surgeNotify(subtitle = '', message = '') {
  $notification.post('π€ θ¦θ¦ζεθͺεζΎζ°΄', subtitle, message, { 'url': 'shopeetw://' });
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

    let currentCrop = null;
    const shopeeFarmInfo = getSaveObject('ShopeeFarmInfo');
    if (isEmptyObject(shopeeFarmInfo)) {
      console.log('β οΈ ζ²ζζ°ηθ¦θ¦ζεθ³θ¨οΌδ½Ώη¨θη');
      currentCrop = JSON.parse($persistentStore.read('ShopeeCrop')) || {};
      // return reject(['ζͺ’ζ₯ε€±ζ βΌοΈ', 'ζ²ζζ°η token']);
    } else {
      currentCrop = shopeeFarmInfo.currentCrop;
      console.log('βΉοΈ ζΎε°ζ°ηθ¦θ¦ζεθ³θ¨');
    }

    const shopeeHeaders = {
      'Cookie': cookieToString(shopeeInfo.token),
      'Content-Type': 'application/json',
    }
    config = {
      shopeeInfo: shopeeInfo,
      shopeeHeaders: shopeeHeaders,
      currentCrop: currentCrop,
    }
    return resolve();
  });
}

async function updatePersistentStore() {
  return new Promise((resolve, reject) => {
    try {
      let shopeeFarmInfo = getSaveObject('ShopeeFarmInfo');
      const currentCrop = JSON.parse($persistentStore.read('ShopeeCrop')) || {};
      const autoCropSeedName = $persistentStore.read('ShopeeCropName') || '';
      const groceryStoreToken = $persistentStore.read('ShopeeGroceryStoreToken') || '';

      if (!shopeeFarmInfo.currentCrop) {
        shopeeFarmInfo.currentCrop = currentCrop;
      }
      if (!shopeeFarmInfo.autoCropSeedName) {
        shopeeFarmInfo.autoCropSeedName = autoCropSeedName;
      }
      if (!shopeeFarmInfo.groceryStoreToken) {
        shopeeFarmInfo.groceryStoreToken = groceryStoreToken;
      }

      const save = $persistentStore.write(JSON.stringify(shopeeFarmInfo, null, 4), 'ShopeeFarmInfo');
      if (!save) {
        return reject(['δΏε­ε€±ζ βΌοΈ', 'η‘ζ³ζ΄ζ°δ½η©θ³ζ']);
      } else {
        return resolve();
      }
    } catch (error) {
      return reject(['ζ΄ζ°ε²ε­θ³ζε€±ζ βΌοΈ', error]);
    }
  });
}

async function water() {
  return new Promise((resolve, reject) => {
    try {
      const waterRequest = {
        url: 'https://games.shopee.tw/farm/api/orchard/crop/water?t=' + new Date().getTime(),
        headers: config.shopeeHeaders,
        body: config.currentCrop,
      };

      $httpClient.post(waterRequest, function (error, response, data) {
        if (error) {
          return reject(['ζΎζ°΄ε€±ζ βΌοΈ', 'ι£η·ι―θͺ€']);
        } else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            if (obj.code === 0) {
              const useNumber = obj.data.useNumber;
              const state = obj.data.crop.state;
              const exp = obj.data.crop.exp;
              const levelExp = obj.data.crop.meta.config.levelConfig[state.toString()].exp;
              const remain = levelExp - exp;
              return resolve({
                state: state,
                useNumber: useNumber,
                remain: remain,
              });
            } else if (obj.code === 409000) {
              showNotification = false;
              return reject(['ζΎζ°΄ε€±ζ βΌοΈ', 'ζ°΄ε£Ίη?εζ²ζ°΄']);
            } else if (obj.code === 403005) {
              return reject(['ζΎζ°΄ε€±ζ βΌοΈ', 'δ½η©ηζι―θͺ€οΌθ«εζεζΎζ°΄δΈζ¬‘']);
            } else if (obj.code === 409004) {
              return reject(['ζΎζ°΄ε€±ζ βΌοΈ', 'δ½η©ηζι―θͺ€οΌθ«ζͺ’ζ₯ζ―ε¦ε·²ζΆζ']);
              // εΊι―δΈζ¬‘δΉεΎζθ·³θ­¦ε
              // const cropState = parseInt($persistentStore.read('ShopeeCropState'));
              // if (cropState < 3) {
              //   $persistentStore.write((cropState + 1).toString(), 'ShopeeCropState');
              //   surgeNotify(
              //     'ζΎζ°΄ε€±ζ βΌοΈ',
              //     'δ½η©ηζι―θͺ€οΌθ«ζͺ’ζ₯ζ―ε¦ε·²ζΆζ'
              //   );
              // }
            } else {
              return reject(['ζΎζ°΄ε€±ζ βΌοΈ', `ι―θͺ€δ»£θοΌ${obj.code}οΌθ¨ζ―οΌ${obj.msg}`]);
            }
          } else {
            return reject(['ζΎζ°΄ε€±ζ βΌοΈ', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['ζΎζ°΄ε€±ζ βΌοΈ', error]);
    }
  });
}

(async () => {
  console.log('βΉοΈ θ¦θ¦ζεθͺεζΎζ°΄ v20230131.2');
  try {
    await preCheck();
    console.log('β ζͺ’ζ₯ζε');
    await updatePersistentStore();
    console.log('β ζ΄ζ°ε²ε­θ³ζζε');
    const result = await water();
    console.log('β ζΎζ°΄ζε');

    if (result.state === 3) {
      console.log(`ζ¬ζ¬‘ζΎδΊοΌ ${result.useNumber} ζ»΄ζ°΄ π§οΌε©ι€ ${result.remain} ζ»΄ζ°΄ζΆζ`);
    } else {
      console.log(`ζ¬ζ¬‘ζΎδΊοΌ ${result.useNumber} ζ»΄ζ°΄ π§οΌε©ι€ ${result.remain} ζ»΄ζ°΄ζι·θ³δΈδΈιζ?΅`);
    }

    if (result.remain === 0) {
      surgeNotify(
        'ζΎζ°΄ζε β',
        'η¨?ζ€ε?η’οΌδ½η©ε―δ»₯ζΆζε¦ π³'
      );
    }
  } catch (error) {
    handleError(error);
  }
  $done();
})();
