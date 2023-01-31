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

let shopeeGetDeviceIdRequest = {
  url: 'https://shopee.tw/sw.js',
  headers: shopeeHeaders,
};

// 取得DeviceID
function shopeeGetDeviceId() {
  $httpClient.get(shopeeGetDeviceIdRequest, function (error, response, data) {
    console.log(response.status);
    if (error) {
      console.log(error);
      shopeeNotify(
        'DeviceId取得失敗 ‼️',
        '連線錯誤'
      );
      $done();
    } else {
      if (response.status === 200) {
        const cookie = response.headers['Set-Cookie'] || response.headers['set-cookie'];
        if (cookie) {
          console.log('1.............');
          console.log(cookie);
          const filteredCookie = cookie.replaceAll('HttpOnly;', '').replaceAll('Secure,', '');
          const cookieObject = parseCookie(filteredCookie);

          // 舊方法，2/1 之後廢棄
          const spcClientId = cookieObject.SPC_CLIENTID;
          const saveSpcClientId = $persistentStore.write(spcClientId, 'SPC_ClientId');

          if (!(saveSpcClientId)) {
            shopeeNotify(
              'DeviceId取得失敗1 ‼️'
            );
            $done();
          } else {
            shopeeNotify(
              'DeviceId保存成功'
            );          }
            $done();
          } else {
          shopeeNotify(
            'DeviceId取得失敗2 ‼️'
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
  // 取得朋友列表
function shopeeGetFriendId() {
  const FriendsInfo_old = JSON.parse($persistentStore.read('ShopeeCropFriends'));
  $httpClient.get(shopeeGetFriendIdRequest, function (error, response, data) {
    if (error) {
      shopeeNotify(
        '朋友列表取得失敗 ‼️',
        '連線錯誤'
      );
      $done();
    } else {
      if (response.status === 200) {
        const obj = JSON.parse(data);
        try {
          if (obj.msg === 'success') {
            let uniqueData = obj.data.messages.filter(function(item, index, self) {
              return self.findIndex(function(i) {
                  //console.log(i.data.FriendID);
                return i.data.FriendID === item.data.FriendID;
              }) === index;
            });            
            const FriendsInfo_new = uniqueData.map(item =>({FriendId: item.data.FriendID, FriendName: item.data.name}));
            
            let FriendsInfo = [...FriendsInfo_old, ...FriendsInfo_new].reduce((acc, curr) => {
              const existing = acc.find(item => item.FriendId === curr.FriendId);
              if (!existing) {
                acc.push(curr);
              } else {
                Object.assign(existing, curr);
              }
              return acc;
            }, []);

            FriendsInfo = FriendsInfo.filter(item => Object.keys(item).length !== 0);
            const saveCronFriends = $persistentStore.write(JSON.stringify(FriendsInfo), 'ShopeeCropFriends');
            if (!saveCronFriends) {
              shopeeNotify(
                '朋友列表保存失敗 ‼️',
                saveCronFriends 
              );
            } else {
              shopeeNotify(
                '朋友列表保存成功'
              );
            }   
            console.log(FriendsInfo);                 
            console.log('朋友數目:' + FriendsInfo.length);
            $done();
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

// shopeeGetDeviceId();
shopeeGetFriendId();
