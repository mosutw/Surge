//20230202-13
// const shopeeCookie = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') + ';';
// const shopeeCSRFToken = $persistentStore.read('CSRFTokenSP');
// const shopeeHeaders = {
//   'Cookie': shopeeCookie,
//   'X-CSRFToken': shopeeCSRFToken,
// };

let showNotification = true;
let config = null;
let RewardList = null;
let userId = null;

config = {
  shopeeInfo: null,
  shopeeHeaders: null,
}

let shopeeCandyGetRewardListRequest = {
  url: 'https://games.shopee.tw/gameplatform/api/v2/redeem_store/item_list/store/115?guest=1&limit=50&offset=0&appid=AxJMo8pm7cs5ca7OM8&activity=1731357eb13431cb',
  headers: config.shopeeHeaders,
};

let redeemRewardRequest = {
  // url: `https://games.shopee.tw/farm/api/orchard/crop/create?t=${new Date().getTime()}`,
  url: `https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/115/item/26165?appid=AxJMo8pm7cs5ca7OM8&activity=1731357eb13431cb`,
  headers: null,
  body: {
    request_id: null,
  }
}  

function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍤 蝦皮消消樂獎勵兌換列表', subtitle, message, { 'url': 'shopeetw://' });
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
    // url: `https://games.shopee.tw/farm/api/orchard/crop/create?t=${new Date().getTime()}`,
    url: `https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/115/item/item=id?appid=AxJMo8pm7cs5ca7OM8&activity=1731357eb13431cb`,
    headers: config.shopeeHeaders,
    body: {
      // request_id: `${userId}_115_${rewrardId}_${new Date().getTime()}`,
      request_id: `${userId}_115_rewrardId_${new Date().getTime()}`,
    }
  }  
}

// // ---------------------------


  // 取得獎勵兌換列表
async function shopeeCandyGetRewardList() {
  return new Promise((resolve, reject) => {
    $httpClient.get(shopeeCandyGetRewardListRequest, function (error, response, data) {
      if (error) {
        surgeNotify(
          '獎勵兌換列表取得失敗 ‼️',
          '連線錯誤'
        );
        // $done();
        return reject('獎勵兌換列表取得失敗1');
      } else {
        if (response.status === 200) {
          const obj = JSON.parse(data);
          try {
            if (obj.msg === 'success') {
              // RewardList = obj.data.item_list.filter(item => item.name.includes("3 蝦幣"));
              // RewardList = obj.data.item_list.filter(item => item.name.includes("蝦幣") || item.name.includes("免運寶箱"));
              // RewardList = obj.data.item_list.filter(item => item.name.includes("蝦幣"))
              RewardList = obj.data.item_list.filter(item => item.name.includes("3 蝦幣"))
              .sort((a, b) => parseFloat(b.name.split(' ')[0]) - parseFloat(a.name.split(' ')[0]));

              console.log('可兌換項目數:' + RewardList.length);
              // $done();
              return resolve();
  
            } else {
              surgeNotify(
                '獎勵兌換列表取得失敗1 ‼️',
                obj.msg
              );
              // $done();
              return reject('獎勵兌換列表取得失敗1 ‼️');
            }
          } catch (error) {
            surgeNotify(
              '獎勵兌換列表取得失敗2 ‼️',
              error
            );
            // $done();
            return reject('獎勵兌換列表取得失敗2 ‼️');
  
          }
        } else {
          surgeNotify(
            '兌換失敗',
          );
          // $done();
          return reject('C兌換失敗');
  
        }
      }
    });
  });
}

async function redeemReward() {
  return new Promise((resolve, reject) => {
    $httpClient.post(redeemRewardRequest, function (error, response, data) {
      if (error) {
        surgeNotify(
          '獎勵兌換失敗 ‼️',
          '連線錯誤'
        );
        console.log('獎勵兌換失敗1');
        return resolve('Err');
        // $done();
  
      } else {
        if (response.status === 200) {
          const obj = JSON.parse(data);
          try {
            if (obj.msg === 'success') {
              console.log(obj);
              return resolve('OK');  
              // $done();
            }
            else {
              console.log(obj);
              return resolve('Err');  
              // $done();
            }
          } catch (error) {
            surgeNotify(
              '獎勵兌換失敗2 ‼️',
              error
            );
            return resolve('Err');
  
          }
        } else {
          console.log(data);
          surgeNotify(
            '兌換失敗',
            '請重新登入'
          );
          // $done();
          return resolve('兌換失敗');
  
        }
      }
    });
  });
}

(async () => {
  console.log('🍤 蝦皮消消樂獎勵兌換列表 v20230201.1');
  try {
    await preCheck();
    console.log('✅ 檢查token成功');
    await shopeeCandyGetRewardList();
    // await shopeeCandyGetRewardList
    // .then
    for (let i = 0; i < RewardList.length; i++) {
      console.log(RewardList[i].name);
      redeemRewardRequest = {
        url: `https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/115/item/${RewardList[i].id}?appid=AxJMo8pm7cs5ca7OM8&activity=1731357eb13431cb`,
        // url: `https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/115/item/26165?appid=AxJMo8pm7cs5ca7OM8&activity=1731357eb13431cb`,
        headers: config.shopeeHeaders,
        body: {
          request_id: `${userId}_115_${RewardList[i].id}_${new Date().getTime()}`,
        }
      }              

      // for (let i = 0; i < 2; i++) {
        console.log(i);
        await delay(0.2);
        const result = await redeemReward();
        console.log(result);
      }

    // console.log(`✅ 蝦皮消消樂獎勵兌換列表成功: ${JSON.stringify(RewardList[0])}` );
    // console.log(redeemRewardRequest);

  } catch (error) {
    handleError(error);
  }
  $done();
})();

// let shopeeInfo = JSON.parse($persistentStore.read('ShopeeInfo'));
// // console.log(shopeeInfo);
// shopeeInfo.token.userid = shopeeInfo.token.SPC_U;
// const shopeeHeaders = {
//   'Cookie': cookieToString(shopeeInfo.token),
//   'Content-Type': 'application/json',
// }
// config = {
//   shopeeInfo: shopeeInfo,
//   shopeeHeaders: shopeeHeaders,
// }
// console.log(shopeeInfo.token);


// let redeemRewardRequest = {
//   // url: `https://games.shopee.tw/farm/api/orchard/crop/create?t=${new Date().getTime()}`,
//   url: `https://games.shopee.tw/gameplatform/api/v2/redeem_store/redeem_item/store/115/item/261?appid=AxJMo8pm7cs5ca7OM8&activity=1731357eb13431cb`,
//   headers: config.shopeeHeaders,
//   body: {
//     "request_id":"userId_115_26170_1675256652051",
//   }
// }  
// $httpClient.post(redeemRewardRequest, function (error, response, data) {
//   if (error) {
//     surgeNotify(
//       '獎勵兌換失敗 ‼️',
//       '連線錯誤'
//     );
//     console.log('獎勵兌換失敗1');
//     // return reject('獎勵兌換失敗1');
//     $done();

//   } else {
//     if (response.status === 200) {
//       const obj = JSON.parse(data);
//       try {
//         if (obj.msg === 'success') {
//           console.log(obj);
//           // return resolve();  
//           $done();
//         }
//         else {
//           console.log(obj);
//           // return resolve();  
//           $done();
//         }
//       } catch (error) {
//         surgeNotify(
//           '獎勵兌換失敗2 ‼️',
//           error
//         );
//         console.log('獎勵兌換失敗2');
//         // return reject('獎勵兌換失敗2 ‼️');
//         $done();
//       }
//     } else {
//       surgeNotify(
//         '兌換失敗 ‼️',
//       );
//       console.log(data);
//       $done();
//       // return reject('Cookie 已過期 ‼️');
//     }
//   }  
// });
