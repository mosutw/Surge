//20230201-12

let showNotification = true;
let config = null;
let FriendsInfo = 0;

function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍤 蝦皮果園朋友列表', subtitle, message, { 'url': 'shopeetw://' });
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


// 取得朋友列表
async function shopeeGetFriendId() {
  return new Promise((resolve, reject) => {
    const shopeeGetFriendIdRequest = {
      url: `https://games.shopee.tw/farm/api/message/get?page=1&pageSize=100`,
      headers: config.shopeeHeaders,
    };    
    const FriendsInfo_old = JSON.parse($persistentStore.read('ShopeeCropFriends'));
    $httpClient.get(shopeeGetFriendIdRequest, function (error, response, data) {
      if (error) {
        surgeNotify(
          '朋友列表取得失敗 ‼️',
          '連線錯誤'
        );
        return reject('朋友列表取得失敗1 ‼️');
        // $done();
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
              
              FriendsInfo = [...FriendsInfo_old, ...FriendsInfo_new].reduce((acc, curr) => {
                const existing = acc.find(item => item.FriendId === curr.FriendId);
                if (!existing) {
                  acc.push(curr);
                } else {
                  Object.assign(existing, curr);
                }
                return acc;
              }, []);
  
              FriendsInfo = FriendsInfo.filter(item => item.FriendId !== undefined);
              const saveCronFriends = $persistentStore.write(JSON.stringify(FriendsInfo), 'ShopeeCropFriends');
              if (!saveCronFriends) {
                surgeNotify(
                  '朋友列表保存失敗 ‼️',
                  saveCronFriends 
                );
                return reject('朋友列表取得失敗2 ‼️');
              } else {
                surgeNotify(
                  '朋友列表保存成功'
                );
                console.log('朋友數目:' + FriendsInfo.length);
                return resolve('朋友數目:' + FriendsInfo.length);
                }   
              // console.log(FriendsInfo);                 
  
            } else {
              surgeNotify(
                '朋友列表取得失敗3 ‼️',
                obj.msg
              );
              return reject('朋友列表取得失敗3 ‼️');
              // $done();
            }
          } catch (error) {
            surgeNotify(
              '朋友列表取得失敗4 ‼️',
              error
            );
            // $done();
            return reject('朋友列表取得失敗4 ‼️');
  
          }
        } else {
          surgeNotify(
            'Cookie 已過期 ‼️',
            '請重新登入'
          );
          return reject(['Cookie 已過期 ‼️','請重新登入']);
        }
      }
    });    
  });

}

(async () => {
  console.log('🍤 蝦皮果園朋友列表 v20230128.1');
  try {
    await preCheck();
    // console.log(config);
    console.log('✅ 檢查token成功');
    const itemName = await shopeeGetFriendId();
    console.log(`✅ 取得蝦皮果園朋友列表成功: ${FriendsInfo.length}` );

  } catch (error) {
    handleError(error);
  }
  $done();
})();
