// 寵物村餵食
let pet_version = '20230821-1';
let showNotification = true;
let config = null;
let RewardList = null;
let userId = null;

config = {
  shopeeInfo: null,
  shopeeHeaders: null,
}

let shopeePetsGetPetsInfoRequest = {
  url: 'https://games.shopee.tw/api-gateway/pet/home?activityCode=b711c6148c210f8f',
  headers: config.shopeeHeaders,
};

let shopeePetsFoodFeed = {
  url: `https://games.shopee.tw/api-gateway/pet/food/feed?activityCode=b711c6148c210f8f&eventCode`,
  headers: null,
  body: {
    request_id: null,
  }
}  

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

  redeemRewardRequest = {
    url: `https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/397/item'/item_id?appid=LcqcAMvwNcX8MR63xX&activity=b711c6148c210f8f`,

    headers: config.shopeeHeaders,
    body: {
      // request_id: `${userId}_397_${rewrardId}_${new Date().getTime()}`,
      request_id: `${userId}_397_rewardId_${new Date().getTime()}`,
    }
  }  
}

// // ---------------------------


  // 取得寵物村PetId 和eventCode
async function shopeePetsGetPetsInfo() {
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
            if (obj.msg === 'success') {
              eventCode = obj.data.eventCode;
              console.log(envCode);
              PetsList = obj.data.pets;
              for (let i = 0; i < PetsList.length; i++) {
                PetsId.push(PetsList[i].petID);
              }

              console.log('寵物數:' + PetsId.length);
              // $done();
              return resolve();
  
            } else {
              surgeNotify(
                '服役寵物列表取得失敗1 ‼️',
                obj.msg
              );
              // $done();
              return reject('服役寵物列表取得失敗1 ‼️');
            }
          } catch (error) {
            surgeNotify(
              '服役寵物列表取得失敗2 ‼️',
              error
            );
            // $done();
            return reject('獎勵兌換列表取得失敗2 ‼️');
  
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
    // console.log(RewardList);
    // for (let i = 0; i < RewardList.length; i++) {      
    //   // console.log(RewardList[i]);
    //   console.log(RewardList[i].name);
    //   // console.log(`https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/397/item/${RewardList[i].id}?appid=LcqcAMvwNcX8MR63xX&activity=b711c6148c210f8f`);
    //   redeemRewardRequest = {
    //     url: `https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/397/item/${RewardList[i].id}?appid=LcqcAMvwNcX8MR63xX&activity=b711c6148c210f8f`,
    //     headers: config.shopeeHeaders,
    //     body: {
    //       request_id: `${userId}_397_${RewardList[i].id}_${new Date().getTime()}`,
    //     }
    //   }              

    //   // for (let i = 0; i < 2; i++) {
    //     console.log(i);
    //     await delay(0.2);
    //     console.log(RewardList[i].redeem_limit);
    //     for (let j = 0; j < RewardList[i].redeem_limit; j++) {
    //       const result = await redeemReward();
    //       console.log(result);  
    //     }
    //   }

  } catch (error) {
    handleError(error);
  }
  $done();
})();

