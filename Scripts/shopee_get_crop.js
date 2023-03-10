function surgeNotify(subtitle = '', message = '') {
  $notification.post('π€ θ¦θ¦ζεδ½η©θ³ζ', subtitle, message, { 'url': 'shopeetw://' });
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

function isManualRun(checkRequest = false, checkResponse = false) {
  if (checkRequest) {
    return typeof $request === 'undefined' || ($request.body && JSON.parse($request.body).foo === 'bar');
  }
  if (checkResponse) {
    return typeof $response === 'undefined' || ($response.body && JSON.parse($response.body).foo === 'bar');
  }
  return false;
}

function getSaveObject(key) {
  const string = $persistentStore.read(key);
  return !string || string.length === 0 ? {} : JSON.parse(string);
}

async function getCropData() {
  return new Promise((resolve, reject) => {
    try {
      const body = JSON.parse($request.body);
      if (body && body.cropId && body.resourceId && body.s) {
        const saveCrop = $persistentStore.write($request.body, 'ShopeeCrop');
        if (saveCrop) {
          console.log('β οΈ θηδ½η©θ³ζε²ε­ζε')
        }

        let shopeeFarmInfo = getSaveObject('ShopeeFarmInfo');
        shopeeFarmInfo.currentCrop = body;
        const save = $persistentStore.write(JSON.stringify(shopeeFarmInfo, null, 4), 'ShopeeFarmInfo');
        if (!save) {
          return reject(['δΏε­ε€±ζ βΌοΈ', 'η‘ζ³ε²ε­δ½η©θ³ζ']);
        }
        return resolve();
      } else {
        return reject(['δ½η©θ³ζε²ε­ε€±ζ βΌοΈ', 'θ«ιζ°η²εΎ Cookie εΎεεθ©¦']);
      }
    } catch (error) {
      return reject(['δΏε­ε€±ζ βΌοΈ', error]);
    }
  });
}

(async () => {
  console.log('βΉοΈ θ¦θ¦ζεδ½η©θ³ζ v20230124.1');
  try {
    if (isManualRun(true, false)) {
      throw 'θ«εΏζεε·θ‘ζ­€θ³ζ¬';
    }
    await getCropData();
    console.log('β δ½η©θ³ζδΏε­ζε');
    surgeNotify(`δ½η©θ³ζδΏε­ζε π±`, '');

  } catch (error) {
    handleError(error);
  }
  $done({});
})();
