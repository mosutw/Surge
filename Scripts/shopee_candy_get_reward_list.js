const shopeeCookie = $persistentStore.read('CookieSP') + ';SPC_EC=' + $persistentStore.read('SPC_EC') + ';';
const shopeeCSRFToken = $persistentStore.read('CSRFTokenSP');
const shopeeHeaders = {
  'Cookie': shopeeCookie,
  'X-CSRFToken': shopeeCSRFToken,
};
function shopeeNotify(subtitle = '', message = '') {
  $notification.post('🍤 蝦皮消消樂獎勵兌換列表', subtitle, message, { 'url': 'shopeetw://' });
};

let shopeeCandyGetRewardListRequest = {
  url: 'https://games.shopee.tw/gameplatform/api/v2/redeem_store/item_list/store/115?guest=1&limit=50&offset=0&appid=AxJMo8pm7cs5ca7OM8&activity=1731357eb13431cb',
  headers: shopeeHeaders,
};


  // 取得獎勵兌換列表
function shopeeCandyGetRewardList() {
  const RewardList = $httpClient.get(shopeeCandyGetRewardListRequest, function (error, response, data) {
    if (error) {
      shopeeNotify(
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
            // let uniqueData = obj.data.item_list.filter(function(item, index, self) {
            //   return self.findIndex(function(i) {
            //       //console.log(i.data.FriendID);
            //     return i.data.FriendID === item.data.FriendID;
            //   }) === index;
            // });            
            // const ItemList = obj.data.item_list.map(item =>({id: item.id, name: item.name}));

            // const saveCronFriends = $persistentStore.write(JSON.stringify(FriendsInfo), 'ShopeeCropFriends');
            // if (!saveCronFriends) {
            //   shopeeNotify(
            //     '朋友列表保存失敗 ‼️',
            //     saveCronFriends 
            //   );
            // } else {
            //   shopeeNotify(
            //     '朋友列表保存成功'
            //   );
            // }   
            console.log('朋友數目:' + ItemList.length);
            $done();
          } else {
            shopeeNotify(
              '獎勵兌換列表取得失敗1 ‼️',
              obj.msg
            );
            $done();
          }
        } catch (error) {
          shopeeNotify(
            '獎勵兌換列表取得失敗2 ‼️',
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

shopeeCandyGetRewardList();
