// 20230207-4
const shopeeFriendsInfo = $persistentStore.read('ShopeeCropFriends');
const shopeeCropToken = $persistentStore.read('ShopeeCropToken') || '';

let showNotification = true;
let config = null;

let CropOK = 0;
let CropFail = 0;
let CropId = '';

config = {
  shopeeInfo: null,
  shopeeFarmInfo: null,
  shopeeHeaders: null,
}
function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍤 蝦皮果園幫朋友澆水', subtitle, message, { 'url': 'shopeetw://' });

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
      return reject(['檢查失敗 ‼️', '沒有新版 token']);
    }
    let shopeeFarmInfo = getSaveObject('ShopeeFarmInfo');
    
    const shopeeHeaders = {
      'Cookie': cookieToString(shopeeInfo.token),
      'Content-Type': 'application/json',
    }
    config = {
      shopeeInfo: shopeeInfo,
      shopeeFarmInfo: shopeeFarmInfo,
      shopeeHeaders: shopeeHeaders,
    }
    return resolve();
  });
}


let shopeeHelpFriendWaterRequest = {
  url: 'https://games.shopee.tw/farm/api/friend/help',
  headers: config.shopeeHeaders  ,
  body: {
    friendId: '',
    cropId: '',
    //devicdId: '61D8A54AC8FE46CFnexuighucearlvaz',
    friendName: '',
    s: '',
  },
};



// 取CropId
async function GetFriendCropiId(Friend) {
  CropId = '';
  return new Promise((resolve, reject) => {
    try {
      console.log(Friend.FriendId + '-' + Friend.FriendName);
      
      shopeeHelpFriendWaterRequest.body.friendId = Friend.FriendId;
      shopeeHelpFriendWaterRequest.body.friendName = Friend.FriendName;
      shopeeHelpFriendWaterRequest.body.deviceId = '';
      shopeeHelpFriendWaterRequest.body.s = config.shopeeFarmInfo.currentCrop.s;
      const request = {
        url: `https://games.shopee.tw/farm/api/friend/orchard/context/get?friendId=` + Friend.FriendId,
        headers: config.shopeeHeaders
      };
      // console.log(request);
      $httpClient.get(request, function (error, response, data) {
        // console.log(data);
        // console.log(error);
        if (error) {
          console.log('取得朋友CronId失敗1 ‼️');
          // return reject(['取得朋友CronId失敗1 ‼️']);
          return resolve();
        }
        else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            if (obj.msg === 'success') {
              // console.log( obj.data);
              shopeeHelpFriendWaterRequest.body.cropId = obj.data.crops[0].id;
              // console.log(shopeeHelpFriendWaterRequest.body);
              CropId = obj.data.crops[0].id;
              return resolve();
            } else {
              // CropFail += 1;
              console.log('取得朋友CronId失敗2');
              // return reject('取得朋友CronId失敗2');    
              return resolve();              
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
          CropFail += 1;
          return resolve();
          // return reject(['幫朋友澆水失敗1 ‼️']);
        }
        else {
          if (response.status === 200) {
            const obj1 = JSON.parse(data);
            console.log(obj1.msg);
            if (obj1.msg === 'success') {
              console.log('幫朋友澆水成功');        
              CropOK += 1;
              return resolve();
              // $done();          
            }
            else {
              // CropFail += 1;
              console.log('幫朋友澆水失敗4');    
              // return reject(['幫朋友澆水失敗4 ‼️']);
              CropFail += 1;
              return resolve();              
            }
          }
        }
      });
      // $done();
    } 
    catch (error) {
      console.log('幫朋友澆水失敗5');
      surgeNotify(
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

// async function preCheck() {
//   return new Promise((resolve, reject) => {
//     const shopeeInfo = getSaveObject('ShopeeInfo');
    
//     if (isEmptyObject(shopeeInfo)) {
//       return reject(['檢查失敗 ‼️', '沒有新版 token']);
//     }
//     const shopeeHeaders = {
//       'Cookie': cookieToString(shopeeInfo.token),
//       'Content-Type': 'application/json',
//     }
//     config = {
//       shopeeInfo: shopeeInfo,
//       shopeeHeaders: shopeeHeaders,
//     }
//     return resolve();
//   });
// }

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
    // console.log(Friends);
    let num = 0;
    await preCheck();    
    for (let i = 0; i < Friends.length; i++) {
    // for (let i = 0; i < 2; i++) {
      console.log(i);
      await delay(0.2);
      await GetFriendCropiId(Friends[i]);
      if (CropId !== undefined || CropId !== '') {
        // console.log(shopeeHelpFriendWaterRequest.body);

        await HelpFriendWater(shopeeHelpFriendWaterRequest);
        // $done();
      }
    }
      console.log('✅ 完成澆水, OK:' + CropOK + ',Fail:' + CropFail );
      surgeNotify(['幫朋友澆水完成 ✅', 'OK:' + CropOK + ',Fail:' + CropFail]);

  } catch (error) {
    handleError(error);
  }
  $done();
})();



