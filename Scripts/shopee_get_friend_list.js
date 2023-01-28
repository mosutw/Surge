const shopeeCookie = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') + ';';
const shopeeCSRFToken = $persistentStore.read('CSRFTokenSP');
const shopeeHeaders = {
  'Cookie': shopeeCookie,
  'X-CSRFToken': shopeeCSRFToken,
};
function shopeeNotify(subtitle = '', message = '') {
  $notification.post('🍤 蝦皮果園朋友列表', subtitle, message, { 'url': 'shopeetw://' });
};

let shopeeGetFriendIdRequest = {
  url: 'https://games.shopee.tw/farm/api/message/get?page=1&pageSize=100',
  headers: shopeeHeaders,
};


// 取得朋友列表
function shopeeGetFriendId() {
  $httpClient.get(shopeeGetFriendIdRequest, function (error, response, data) {
    if (error) {
      shopeeNotify(
        '朋友列表取得失敗 ‼️',
        '連線錯誤'
      );
      $done();
    } else {
      if (response.status === 200) {
        try {
          const obj = JSON.parse(data);
//          console.log(data);
          console.log(obj.msg);
          if (obj.msg === 'success') {
            console.log('1111');
            const eventUrl = obj.data.basic.event_code;
            let module_id = 0;
            let found = false;
            for (const item of obj.data.modules) {
              if (item.module_name === 'Service.LUCKY_DRAW_COMPONENT') {
                module_id = item.module_id;
                found = true;
                break;
              }
            }
          } else {
            shopeeNotify(
              '朋友列表取得失敗1 ‼️',
              obj.msg
            );
            $done();
          }
        } catch (error) {
          shopeeNotify(
            '朋友列表取得失敗2 ‼️',
            error
          );
          $done();
        }
      } else {
        shopeeNotify(
          'Cookie 已過期 ‼️',
          '請重新登入'
        );
        $done();
      }
    }
  });
}

shopeeGetFriendId();
