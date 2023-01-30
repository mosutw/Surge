const shopeeCookie = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') + ';';
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
  headers: shopeeHeaders,
  body: {
    friendId: '',
    cropId: '',
    devicdId: '',
    friendName: '',
    s: shopeeCropToken,
  },

};


// 幫朋友澆水
function shopeeHelpFriendWater() {
  Friend = JSON.parse(shopeeFriendsInfo)[1];
  shopeeHelpFriendWaterRequest.body.friendId = Friend.FriendId;
  shopeeHelpFriendWaterRequest.body.name = Friend.FriendName;
  // shopeeHelpFriendWaterRequest.body.deviceId = '';
  const request = {
    url: `https://games.shopee.tw/farm/api/friend/orchard/context/get?friendId=` + Friend.FriendId,
    headers: shopeeHeaders
  };
  // console.log(request);
  $httpClient.get(request, function (error, response, data) {
    if (error) {
      console.log(error);
      // $done();
      // return reject(['取得朋友CronId失敗1 ‼️', '請重新登入']);
    }
    else {
      if (response.status === 200) {
        const obj = JSON.parse(data);
        if (obj.msg === 'success') {
          shopeeHelpFriendWaterRequest.body.cropId = obj.data.crops.id;
          console.log(obj.data.crops.id);
          // $httpClient.post(shopeeHelpFriendWaterRequest, function (error, response, data) {
          //   if (error) {
          //     console.log(error);
          //     $done();
          //     // return reject(['取得朋友CronId失敗1 ‼️', '請重新登入']);
          //   }
          //   else {
          //     if (response.status === 200) {
          //       const obj = JSON.parse(data);
          //       console.log(obj);
          //       $done();
          //     }
          //   }
          // });
          $done();

        } else {
          console.log('aaaaaaa');
          }
      } else {
        console.log('bbbbbbbbb');
          
      }          
      // $done();
    }
  });


  // for (const Friend of shopeeFriendsInfo) {
  //   try {
  //     // shopeeHelpFriendWaterRequest.body.friendId = Friend.FriendId;
  //     // shopeeHelpFriendWaterRequest.body.name = Friend.FriendName;
  //     // shopeeHelpFriendWaterRequest.body.deviceId = '';
  //     const request = {
  //       url: `https://games.shopee.tw/farm/api/friend/orchard/context/get?friendId=` + Friend.FriendId,
  //       headers: shopeeHeaders
  //     };
  //     $httpClient.get(request, function (error, response, data) {
  //       if (error) {
  //         return reject(['取得朋友CronId失敗1 ‼️', '請重新登入']);
  //       }
  //       else {
  //         if (response.status === 200) {
  //           const obj = JSON.parse(data);
  //           if (obj.msg === 'success') {
  //             console.log(obj);
  //             // const cropMetas = obj.data.cropMetas;
  //             // let found = false;
  //             // let haveSeed = true;

  //             // if (found === false) {
  //             //   return reject(['取得種子失敗 ‼️', `今天沒有「${shopeeCropName}」的種子`]);
  //             // }
  //           } else {
  //             return reject(['取得朋友CronId失敗2 ‼️', `錯誤代號：${obj.code}，訊息：${obj.msg}`]);
  //           }
  //         } else {
  //           return reject(['取得朋友CronId失敗3 ‼️', response.status]);
  //         }          
  //       }
  //     });
  //   } 
  //   catch (error) {
  //     shopeeNotify(
  //       '幫澆水失敗 ‼️',
  //       error
  //     );
  //     $done();
  //   }
  // }
  console.log('fffffffffff');
  // $done();
}

shopeeHelpFriendWater();
