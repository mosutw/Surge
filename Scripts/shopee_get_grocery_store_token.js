let showNotification = true;

function surgeNotify(subtitle = '', message = '') {
  $notification.post('π€ θ¦θ¦ζειε·εεΊ token', subtitle, message, { 'url': 'shopeetw://' });
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

function isManualRun(checkRequest = false, checkResponse = false) {
  if (checkRequest) {
    return typeof $request === 'undefined' || ($request.body && JSON.parse($request.body).foo === 'bar');
  }
  if (checkResponse) {
    return typeof $response === 'undefined' || ($response.body && JSON.parse($response.body).foo === 'bar');
  }
  return false;
}

async function getToken() {
  return new Promise((resolve, reject) => {
    try {
      const body = JSON.parse($request.body);
      if (body && body.s) {
        let shopeeFarmInfo = getSaveObject('ShopeeFarmInfo');
        shopeeFarmInfo.groceryStoreToken = body.s;
        const save = $persistentStore.write(JSON.stringify(shopeeFarmInfo, null, 4), 'ShopeeFarmInfo');
        if (!save) {
          return reject(['δΏε­ε€±ζ βΌοΈ', 'η‘ζ³ε²ε­ token']);
        } else {
          return resolve();
        }
      } else {
        return reject(['δ½η©θ³ζε²ε­ε€±ζ βΌοΈ', 'θ«ιζ°η²εΎ Cookie εΎεεθ©¦']);
      }
    } catch (error) {
      return reject(['δΏε­ε€±ζ βΌοΈ', error]);
    }
  });
}

(async () => {
  console.log('βΉοΈ θ¦θ¦ζεεεΎιε·εεΊ token v20230125.1');
  try {
    if (isManualRun(true, false)) {
      throw 'θ«εΏζεε·θ‘ζ­€θ³ζ¬';
    }
    await getToken();
    console.log(`β ιε·εεΊ token δΏε­ζε`);
    surgeNotify('δΏε­ζε β', '');
  } catch (error) {
    handleError(error);
  }
  $done({});
})();
