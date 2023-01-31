// 20230131-40
// const shopeeCookie = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') + ';SPC_F=61D8A54AC8FE46CFnexuighucearlvaz; SPC_CLIENTID=61D8A54AC8FE46CFnexuighucearlvaz'   ;
const shopeeCookie = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') ;
const shopeeCSRFToken = $persistentStore.read('CSRFTokenSP');
const shopeeFriendsInfo = $persistentStore.read('ShopeeCropFriends');
const shopeeCropToken = $persistentStore.read('ShopeeCropToken') || '';
// const shopeeInfo = $persistentStore.read('ShopeeInfo');
const shopeeHeaders = {
  'Cookie': shopeeCookie,
  'X-CSRFToken': shopeeCSRFToken,
};
function shopeeNotify(subtitle = '', message = '') {
  $notification.post('🍤 蝦皮果園幫朋友澆水', subtitle, message, { 'url': 'shopeetw://' });
};

let shopeeGetFriendCropIdRequest = {
  url: 'https://games.shopee.tw/farm/api/friend/orchard/context/get?friendId=103989402',
  headers: shopeeHeaders,
};

let shopeeHelpFriendWaterRequest = {
  url: 'https://games.shopee.tw/farm/api/friend/help',
  headers: shopeeHeaders  ,
  body: {
    friendId: '',
    cropId: '',
    //devicdId: '61D8A54AC8FE46CFnexuighucearlvaz',
    friendName: '',
    s: shopeeCropToken,
  },

};

function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍤 蝦蝦果園領取任務獎勵', subtitle, message, { 'url': 'shopeetw://' });
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

// 幫朋友澆水
async function GetFriendCropiId(Friend) {
  return new Promise((resolve, reject) => {
    try {
      console.log(Friend.FriendId + '-' + Friend.FriendName);
      shopeeHelpFriendWaterRequest.body.friendId = Friend.FriendId;
      shopeeHelpFriendWaterRequest.body.friendName = Friend.FriendName;
      // shopeeHelpFriendWaterRequest.body.deviceId = '';
      const request = {
        url: `https://games.shopee.tw/farm/api/friend/orchard/context/get?friendId=` + Friend.FriendId,
        headers: shopeeHeaders
      };
      // console.log(request);
      $httpClient.get(request, function (error, response, data) {
        if (error) {
          console.log('取得朋友CronId失敗1 ‼️');
          return reject(['取得朋友CronId失敗1 ‼️']);
        }
        else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            if (obj.msg === 'success') {
              shopeeHelpFriendWaterRequest.body.cropId = obj.data.crops[0].id;
              // console.log(shopeeHelpFriendWaterRequest.body);
              return resolve();
            } else {
              // CropFail += 1;
              console.log('取得朋友CronId失敗2');
              return reject('取得朋友CronId失敗2');    
            }   
          }
        }
      });   
    } catch(error) {
      console.log('取得朋友CronId失敗3');
      return reject(['取得列表失敗3 ‼️', error]);
    }
  });
}

// 幫朋友澆水
async function HelpFriendWater(shopeeHelpFriendWaterRequest) {
  return new Promise((resolve, reject) => {
    // console.log(shopeeHelpFriendWaterRequest);
    try {
      $httpClient.post(shopeeHelpFriendWaterRequest, function (error, response, data) {
        if (error) {
          // console.log(error);
          // $done();
          return resolve();
          // return reject(['幫朋友澆水失敗1 ‼️']);
        }
        else {
          if (response.status === 200) {
            const obj1 = JSON.parse(data);
            console.log(obj1.msg);
            if (obj1.msg === 'success') {
              console.log('幫朋友澆水成功');        
              return resolve();
              // $done();          
            }
            else {
              // CropFail += 1;
              console.log('幫朋友澆水失敗4');    
              // return reject(['幫朋友澆水失敗4 ‼️']);
              return resolve();              
            }
          }
        }
      });
      // $done();
    } 
    catch (error) {
      console.log('幫朋友澆水失敗5');
      shopeeNotify(
        '幫澆水失敗 ‼️',
        error
      );
      return resolve();
      // return reject(['幫朋友澆水失敗5 ‼️']);
      // $done();
    }
    // $done();
  })
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
    return resolve();
  });
}

async function delay(seconds) {
  console.log(`⏰ 等待 ${seconds} 秒`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

(async () => {
  console.log('ℹ️ 蝦蝦果園幫朋友澆水 v20230131');
  try {
    // await getRewardList();
    const Friends =  JSON.parse(shopeeFriendsInfo);
    console.log(Friends.length);
    console.log(Friends);
    let num = 0;
    // await preCheck();    
    for (let i = 0; i < Friends.length; i++) {
    // for (let i = 0; i < 2; i++) {
      await delay(0.5);
      await GetFriendCropiId(Friends[i]);

      // console.log(shopeeHelpFriendWaterRequest.body);
      await HelpFriendWater(shopeeHelpFriendWaterRequest);
      // $done();
    }
      console.log(i);
      console.log('✅ 完成澆水')
      surgeNotify('幫朋友澆水完成 ✅', '');

  } catch (error) {
    handleError(error);
  }
  $done();
})();



