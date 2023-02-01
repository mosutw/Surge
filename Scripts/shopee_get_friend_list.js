//20230201-6
// const shopeeCookie = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') + ';';
// const shopeeCSRFToken = $persistentStore.read('CSRFTokenSP');
// const shopeeHeaders = {
//   'Cookie': shopeeCookie,
//   'X-CSRFToken': shopeeCSRFToken,
// };

let showNotification = true;
let config = null;

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

let shopeeGetFriendIdRequest = {
  url: 'https://games.shopee.tw/farm/api/message/get?page=1&pageSize=100',
  headers: config.shopeeHeaders,
};

// let shopeeGetDeviceIdRequest = {
//   url: 'https://shopee.tw/sw.js',
//   headers: shopeeHeaders,
// };

// // 取得DeviceID
// function shopeeGetDeviceId() {
//   $httpClient.get(shopeeGetDeviceIdRequest, function (error, response, data) {
//     console.log(response.status);
//     if (error) {
//       console.log(error);
//       surgeNotify(
//         'DeviceId取得失敗 ‼️',
//         '連線錯誤'
//       );
//       $done();
//     } else {
//       if (response.status === 200) {
//         const cookie = response.headers['Set-Cookie'] || response.headers['set-cookie'];
//         if (cookie) {
//           console.log('1.............');
//           console.log(cookie);
//           const filteredCookie = cookie.replaceAll('HttpOnly;', '').replaceAll('Secure,', '');
//           const cookieObject = parseCookie(filteredCookie);

//           // 舊方法，2/1 之後廢棄
//           const spcClientId = cookieObject.SPC_CLIENTID;
//           const saveSpcClientId = $persistentStore.write(spcClientId, 'SPC_ClientId');

//           if (!(saveSpcClientId)) {
//             surgeNotify(
//               'DeviceId取得失敗1 ‼️'
//             );
//             $done();
//           } else {
//             surgeNotify(
//               'DeviceId保存成功'
//             );          }
//             $done();
//           } else {
//           surgeNotify(
//             'DeviceId取得失敗2 ‼️'
//           );
//           $done();
//       }        
//       } else {
//         surgeNotify(
//           'Cookie 已過期 ‼️',
//           '請重新登入'
//         );
//         $done();
//       }
//     }
//   });
// }
  // 取得朋友列表
async function shopeeGetFriendId() {
  return new Promise((resolve, reject) => {
    const FriendsInfo_old = JSON.parse($persistentStore.read('ShopeeCropFriends'));
    console.log(shopeeGetFriendIdRequest);
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
              
              let FriendsInfo = [...FriendsInfo_old, ...FriendsInfo_new].reduce((acc, curr) => {
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

// shopeeGetDeviceId();
// shopeeGetFriendId();

(async () => {
  console.log('🍤 蝦皮果園朋友列表 v20230128.1');
  try {
    await preCheck();
    console.log('✅ 檢查token成功');
    const itemName = await shopeeGetFriendId();
    console.log(`✅ 取得蝦皮果園朋友列表成功: + ${result}` );

  } catch (error) {
    handleError(error);
  }
  $done();
})();
