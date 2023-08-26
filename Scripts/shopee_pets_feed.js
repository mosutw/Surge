// 寵物村餵食
let pet_version = '20230826-2352';
let showNotification = true;
let config = null;
let petsId = [];
let eventCode = null;

config = {
  shopeeInfo: null,
  shopeeHeaders: null,
}

let shopeePetsGetPetsInfoRequest = {
  url: 'https://games.shopee.tw/api-gateway/pet/home?activityCode=b711c6148c210f8f',
  headers: config.shopeeHeaders,
};

function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍤 蝦皮寵物村餵食', subtitle, message, { 'url': 'shopeetw://' });
};

function handleError(error) {
  if (Array.isArray(error)) {
    console.log(`❌ ${error[0]} ${error[1]}`);
    if (showNotification) {
      surgeNotify(error[0], error[1]);
    }
  } else {
    console.log(`❌ ${error}`);
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

async function delay(seconds) {
  console.log(`⏰ 等待 ${seconds} 秒`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

async function preCheck() {
  return new Promise((resolve, reject) => {
    const shopeeInfo = getSaveObject('ShopeeInfo');
    if (isEmptyObject(shopeeInfo)) {
      return reject(['檢查失敗 ‼️', '沒有新版 token']);
    }
    const shopeeHeaders = {
      'Cookie': cookieToString(shopeeInfo.token),
      'Content-Type': 'application/json',
    }
    config = {
      shopeeInfo: shopeeInfo,
      shopeeHeaders: shopeeHeaders,
    }
    userId = shopeeInfo.token.SPC_U;    
    return resolve();
  });

}

// // ---------------------------


// 取得寵物村PetId 和eventCode
async function shopeePetsGetPetsInfo() {
  return new Promise((resolve, reject) => {
    shopeePetsGetPetsInfoRequest = {
      url: 'https://games.shopee.tw/api-gateway/pet/home?activityCode=b711c6148c210f8f&event=',
      headers: config.shopeeHeaders
    }         
    $httpClient.get(shopeePetsGetPetsInfoRequest, function (error, response, data) {
      if (error) {
        surgeNotify(
          '寵物列表取得失敗 ‼️',
          '連線錯誤'
        );
        // $done();
        return reject('寵物列表取得失敗');
      } else {
        if (response.status === 200) {
          const obj = JSON.parse(data);          
          try {
            if (obj.code === 0) {
              eventCode = obj.data.eventCode;
              console.log(eventCode);
              PetsList = obj.data.pets;
              for (let i = 0; i < PetsList.length; i++) {
                petsId.push(PetsList[i].petID);
              }

              // console.log('寵物數:' + petsId.length);
              // $done();
              return resolve();
  
            } else {
              surgeNotify(
                '寵物列表取得失敗1 ‼️',
                obj.msg
              );
              // $done();
              return reject('寵物列表取得失敗1-1 ‼️');
            }
          } catch (error) {
            surgeNotify(
              '寵物列表取得失敗2 ‼️',
              error
            );
            // $done();
            return reject('服役寵物列表取得失敗2-1 ‼️');
  
          }
        } else {
          surgeNotify(
            '取得寵物列表失敗',
          );
          // $done();
          return reject('兌取得寵物列表失敗');
  
        }
      }
    });
  });
}

// 餵食寵物
async function petFoodFeed() {
  return new Promise((resolve, reject) => {
    $httpClient.post(petFoodFeedRequest, function (error, response, data) {
      if (error) {
        return reject(['餵食失敗-1 ‼️', '連線錯誤']);
      } else {
        if (response.status === 200) {
          const obj = JSON.parse(data);
          if (obj.code === 0) {
            console.log(`✅ 餵食成功`);
            return resolve();
          } else if (obj.code === 601041) {
            console.log('餵食失敗 ‼️飼料還沒吃完');
            return resolve();
            // return reject(['餵食失敗 ‼️', `飼料還沒吃完`]);
          }
          else {
            console.log('餵食失敗 ‼️' + obj.code.toString() + obj.msg) ;
            return resolve();
            // return reject(['餵食失敗 ‼️', `飼料還沒吃完`]);

          }
        } else {
          return reject(['餵食失敗-2 ‼️', response.status]);
        }
      }
    });
  });
}

  // 取得寵物村餵食
  async function shopeePetsFoodFeed() {
    return new Promise((resolve, reject) => {
      $httpClient.get(shopeePetsGetPetsInfoRequest, function (error, response, data) {
        if (error) {
          surgeNotify(
            '寵物列表取得失敗 ‼️',
            '連線錯誤'
          );
          // $done();
          return reject('寵物列表取得失敗');
        } else {
          if (response.status === 200) {
            const obj = JSON.parse(data);          
            try {
              if (obj.code === 0) {
                eventCode = obj.data.eventCode;
                console.log(eventCode);
                PetsList = obj.data.pets;
                for (let i = 0; i < PetsList.length; i++) {
                  petsId.push(PetsList[i].petID);
                }
  
                console.log('寵物數:' + petsId.length);
                // $done();
                return resolve();
    
              } else {
                surgeNotify(
                  '服役寵物列表取得失敗1 ‼️',
                  obj.msg
                );
                // $done();
                return reject('服役寵物列表取得失敗1-1 ‼️');
              }
            } catch (error) {
              surgeNotify(
                '服役寵物列表取得失敗2 ‼️',
                error
              );
              // $done();
              return reject('服役寵物列表取得失敗2-1 ‼️');
    
            }
          } else {
            surgeNotify(
              '取得寵物列表失敗',
            );
            // $done();
            return reject('兌取得寵物列表失敗');
    
          }
        }
      });
    });
  }

(async () => {
  console.log('🍤 蝦皮寵物村餵食寵物' + pet_version);
  try {
    await preCheck();
    console.log('✅ 檢查token成功');
    await shopeePetsGetPetsInfo();
    console.log(petsId);
    // console.log(Date.now());
    for (let i = 0; i < petsId.length; i++) {      
    //   // console.log(`https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/397/item/${RewardList[i].id}?appid=LcqcAMvwNcX8MR63xX&activity=b711c6148c210f8f`);
      petFoodFeedRequest = {
        url: `https://games.shopee.tw/api-gateway/pet/food/feed?activityCode=b711c6148c210f8f&eventCode=${eventCode}`,
        headers: config.shopeeHeaders,
        body: {
          token: Date.now().toString(),
          petID: petsId[i] ,
          foodID : 11001

        }
      }      
      // console.log(petFoodFeedRequest);  
      // console.log(Date.now().toString());
      await petFoodFeed(petFoodFeedRequest);      
      await delay(0.5);      
    }
    console.log('✅ 完成餵食')
    surgeNotify('已餵食寵物 ✅', '');

  } catch (error) {
    handleError(error);
  }
  $done();
})();

