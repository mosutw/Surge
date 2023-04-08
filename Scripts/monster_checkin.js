const monsterHeaders = JSON.parse($persistentStore.read('monsterHeaders'));
const monsterBody = JSON.parse($persistentStore.read('monsterBody'));
console.log(monsterHeaders);

// const monsterHeaders = {
//   'Content-Type': 'application/json;charset=utf-8',
// };
function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍑 發票怪獸 每日簽到', subtitle, message, { 'url': 'InvoiceMonster.app://' });
};

// const mainPageRequest = {
//   url: 'https://monsterapi.qscan.me/v1/member/drawCarrierInvBonus',
//   headers: monsterHeaders,
//   body: {
//     'member_id': '',
//   }
// }

const luckyDrawBonusRequest = {
  url: 'https://monsterapi.qscan.me/v1/member/drawCarrierInvBonus',
  headers: monsterHeaders,
  body: monsterBody,
}


let eventPageRequest = {
  url: '',
  headers: monsterHeaders,
}

let jsCodeRequest = {
  url: '',
  headers: monsterHeaders,
}

let checkinRequest = {
  url: 'https://monsterapi.qscan.me/v1/member/drawCarrierInvBonus',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'User-Agent': 'monster',
    'Referer': '',
  },
  body: $persistentStore.read('monsterBody'),
};

function getEventPageUrl() {
  $httpClient.post(luckyDrawBonusRequest, function (error, response, data) {
    if (error) {
      surgeNotify(
        '取得活動頁面失敗 ‼️',
        '連線錯誤'
      );
      $done();
    } else {
      if (response.status === 200) {
        console.log(data);
        try {
          const obj = JSON.parse(data);
          if (obj.success === true) {
            const mainInfo = obj.mainInfo;
            let found = false;
            for (const info of mainInfo) {
              if (info.adInfo && info.columnType === "3") {
                const adInfo = info.adInfo[0];
                const actionUrl = adInfo.action.actionValue;
                console.log('發票怪獸 簽到活動頁面 👉' + actionUrl);
                found = true;
                checkinRequest.headers.Referer = actionUrl;
                eventPageRequest.url = actionUrl;
                eventPageRequest.headers.cookie = '';
              }
            }
            if (!found) {
              console.log('找不到簽到活動頁面');
              $done();
            }
          } else {
            surgeNotify(
              '取得活動頁面失敗 ‼️',
              obj.resultMessage
            );
            $done();
          }
        }
        catch (error) {
          surgeNotify(
            '取得活動頁面失敗 ‼️',
            error
          );
          $done();
        }
      } else {
        surgeNotify(
          'Cookie 已過期 ‼️',
          '請重新登入'
        );
        $done();
      }
    }
  });
}

function getJavascriptUrl() {
  $httpClient.get(eventPageRequest, function (error, response, data) {
    if (error) {
      surgeNotify(
        '取得 JS URL 失敗 ‼️',
        '連線錯誤'
      );
      $done();
    } else {
      if (response.status === 200) {
        try {
          const re = /https:\/\/(.*)\/promo-cloud-setPunch-v006\.js\?t=[0-9]{13}/i;
          const found = data.match(re);
          const url = found[0];
          jsCodeRequest.url = url;
          console.log('活動 JS URL 👉' + url);
          getPromoCloudConfig();
        }
        catch (error) {
          surgeNotify(
            '取得 JS URL 失敗 ‼️',
            error
          );
          $done();
        }
      } else {
        surgeNotify(
          '取得 JS URL 失敗 ‼️',
          response.status
        );
        $done();
      }
    }
  });
}

function getluckyDrawBonud() {
  $httpClient.get(jsCodeRequest, function (error, response, data) {
    if (error) {
      surgeNotify(
        '取得活動 ID 失敗 ‼️',
        '連線錯誤'
      );
      $done();
    } else {
      if (response.status === 200) {
        try {
          const pNoRe = /punchConfig\.pNo(.*)"(.*)"/i;
          const pNo = data.match(pNoRe)[2];
          console.log('發票怪獸 活動 ID 👉' + pNo);
          let body = JSON.parse(checkinRequest.body);
          body.pNo = pNo;
          checkinRequest.body = body;
          checkIn();
        }
        catch (error) {
          surgeNotify(
            '取得活動 ID 失敗 ‼️',
            error
          );
          $done();
        }
      } else {
        surgeNotify(
          'Cookie 已過期 ‼️',
          '請重新登入'
        );
        $done();
      }
    }
  });
}

function checkIn() {
  $httpClient.post(checkinRequest, function (error, response, data) {
    if (error) {
      surgeNotify(
        '簽到失敗 ‼️',
        '連線錯誤'
      );
    } else {
      if (response.status === 200) {
        const obj = JSON.parse(data);
        if (obj.data.status === 'OK') {
          surgeNotify(
            '今日簽到成功 ✅',
            ''
          );
        } else if (obj.data.status === 'RA') {
          console.log('本日已簽到');
          // surgeNotify(
          //   '簽到失敗 ‼️',
          //   '本日已簽到'
          // );
        } else if (obj.data.status === 'D') {
          surgeNotify(
            '簽到失敗 ‼️',
            '活動已到期'
          );
        } else if (obj.data.status === 'MAX') {
          surgeNotify(
            '簽到失敗 ‼️',
            '簽到人數達到上限'
          );
        } else if (obj.data.status === 'EPN2') {
          surgeNotify(
            '簽到失敗 ‼️',
            '活動不存在'
          );
        } else {
          surgeNotify(
            '簽到失敗 ‼️',
            obj.data.status
          );
        }
      } else {
        surgeNotify(
          'Cookie 已過期 ‼️',
          '請重新登入'
        );
      }
    }
    $done();
  });
}

getEventPageUrl();