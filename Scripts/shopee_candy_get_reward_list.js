//20230201-2
// const shopeeCookie = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') + ';';
// const shopeeCSRFToken = $persistentStore.read('CSRFTokenSP');
// const shopeeHeaders = {
//   'Cookie': shopeeCookie,
//   'X-CSRFToken': shopeeCSRFToken,
// };

let showNotification = true;
let config = null;
let FriendsInfo = 0;

config = {
  shopeeInfo: null,
  shopeeHeaders: null,
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

// ---------------------------

let shopeeCandyGetRewardListRequest = {
  url: 'https://games.shopee.tw/gameplatform/api/v2/redeem_store/item_list/store/115?guest=1&limit=50&offset=0&appid=AxJMo8pm7cs5ca7OM8&activity=1731357eb13431cb',
  headers: config.shopeeHeaders,
};


  // 取得獎勵兌換列表
function shopeeCandyGetRewardList() {
  const RewardList = $httpClient.get(shopeeCandyGetRewardListRequest, function (error, response, data) {
    if (error) {
      surgeNotify(
        '獎勵兌換列表取得失敗 ‼️',
        '連線錯誤'
      );
      $done();
    } else {
      if (response.status === 200) {
        const obj = JSON.parse(data);
        try {
          if (obj.msg === 'success') {
            const ItemList = obj.data.item_list;
            console.log('可兌換項目數:' + ItemList.length);
            $done();
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
          'Cookie 已過期 ‼️',
          '請重新登入'
        );
        // $done();
        return reject('Cookie 已過期 ‼️');

      }
    }
  });
}

// shopeeCandyGetRewardList();

(async () => {
  console.log('🍤 蝦皮消消樂獎勵兌換列表 v20230201.1');
  try {
    await preCheck();
    console.log('✅ 檢查token成功');
    const itemName = await shopeeCandyGetRewardList();
    console.log(`✅ 蝦皮消消樂獎勵兌換列表成功: ${FriendsInfo.length}` );

  } catch (error) {
    handleError(error);
  }
  $done();
})();

