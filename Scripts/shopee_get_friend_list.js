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
          if (obj.msg === 'success') {
            // console.log(obj.data);
            let uniqueData = obj.data.messages.filter(function(item, index, self) {
              return self.findIndex(function(i) {
                  //console.log(i.data.FriendID);
                return i.data.FriendID === item.data.FriendID;
              }) === index;
            });            
            FriendsInfo = uniqueData.map(item =>({FriendId: item.data.FriendID, FriendName: item.data.name}));
            const saveCronFriends = $persistentStore.write(FriendsInfo, 'ShopeeCropFriends');
            if (!saveCronFriends) {
              shopeeNotify(
                '保存失敗 ‼️',
                saveCronFriends
              );
            } else {
              shopeeNotify(
                '保存成功'
              );
            }
                      
            // console.log('朋友數目:' + fi.length);
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
