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

// 幫朋友澆水
async function shopeeGetFriendCrop(Friend) {
  console.log('2------');

  // console.log(JSON.parse(shopeeFriendsInfo));
  // $done();
  // let CropOK = 0;
  // let CropFail = 0;
  // for (const Friend of JSON.parse(shopeeFriendsInfo)) {
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
      $httpClient.get(request, async function (error, response, data) {
        if (error) {
          console.log('取得朋友CronId失敗1 ‼️', '請重新登入');
          $done();
          // return reject(['取得朋友CronId失敗1 ‼️', '請重新登入']);
        }
        else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            if (obj.msg === 'success') {
              shopeeHelpFriendWaterRequest.body.cropId = obj.data.crops[0].id;
              // console.log(shopeeHelpFriendWaterRequest.headers);
              console.log(shopeeHelpFriendWaterRequest.body);
              console.log('-----------------');
              // $done();
              await shopeeHelpFriendWater(shopeeHelpFriendWaterRequest);
              // $done();

            } else {
              CropFail += 1;
              console.log('幫朋友澆水失敗1');    
              $done();          
              }
          } else {
            CropFail += 1;
            console.log('幫朋友澆水失敗2');
            $done();
          }          
          // $done();
        }
      });
    } 
    catch (error) {
      console.log('幫朋友澆水失敗3');
      shopeeNotify(
        '幫澆水失敗 ‼️',
        error
      );
      $done();
    }
    // $done();
  // }
  // console.log('OK:' + CropOK + 'Fail:' + CropFail);
  // // $done();
}

// 幫朋友澆水
async function shopeeHelpFriendWater(shopeeHelpFriendWaterRequest) {
  try {
    $httpClient.post(shopeeHelpFriendWaterRequest, function (error, response, data) {
      if (error) {
        console.log(error);
        // $done();
        // return reject(['取得朋友CronId失敗1 ‼️', '請重新登入']);
      }
      else {
        if (response.status === 200) {
          const obj1 = JSON.parse(data);
          if (obj1.msg === 'success') {
            // console.log('ok------------');                      
            // console.log(obj);
            // CropOK += 1;
            console.log('幫朋友澆水成功');        
            $done();          
          }
          else {
            // CropFail += 1;
            console.log('幫朋友澆水失敗4');    
            $done();    
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
    $done();
  }
  // $done();
}

async function loopGetRequest() {
  let CropOK = 0;
  let CropFail = 0;
  // Friend = JSON.parse(shopeeFriendsInfo)[0];
  for (const Friend of JSON.parse(shopeeFriendsInfo)) {
    console.log('1------');
    await shopeeGetFriendCrop(Friend)
  }
  // console.log('OK:' + CropOK + 'Fail:' + CropFail);
  // $done();
}
// shopeeGetFriendCrop();
loopGetRequest();