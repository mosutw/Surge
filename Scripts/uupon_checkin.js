const uuponHeaders = {
  'Cookie': $persistentStore.read('uuponCookie'),
  'Content-Type': 'application/json;charset=utf-8',
};
function uuponNotify(subtitle = '', message = '') {
  $notification.post('uupon 每日簽到', subtitle, message, { 'url': 'uupon://' });
};

const mainPageRequest = {
  url: 'https://appevts.uupon.com/dailysignin2/page',
  headers: uuponHeaders,
  body: {

  }
}

let eventPageRequest = {
  url: '',
  headers: uuponHeaders,
}

let jsCodeRequest = {
  url: '',
  headers: uuponHeaders,
}

let checkinRequest = {
  url: 'https://appevts.uupon.com/dailysignin2/api/doSignin',
  headers: {
    'Cookie': $persistentStore.read('uuponCookie'),
    'Content-Type': 'application/json;charset=utf-8',
    'User-Agent': 'uupon',
    'Referer': '',
  },
  body: $persistentStore.read('uuponbody'),
};

function getEventPageUrl() {
  $httpClient.post(mainPageRequest, function (error, response, data) {
    // console.log(response);
    // console.log(data);
    // console.log(typeof(data))
    const doc = new DOMParser().parseFromString(data, 'text/html');
    const arr = [...doc.body.children].map(child => child.outerHTML);
    console.log(arr);
    // if (error) {
    //   console.log(error)
    //   uuponNotify(
    //     '取得活動頁面失敗 ‼️',
    //     '連線錯誤'
    //   );
    //   $done();
    // } else {
    //   if (response.status === 200) {
    //     try {
    //       const obj = JSON.parse(data);
    //       console.log(data)
    //       // if (obj.success === true) {
    //       //   const mainInfo = obj.mainInfo;
    //       //   let found = false;
    //       //   for (const info of mainInfo) {
    //       //     if (info.adInfo && info.columnType === "3") {
    //       //       const adInfo = info.adInfo[0];
    //       //       const actionUrl = adInfo.action.actionValue;
    //       //       console.log('uupon 簽到活動頁面 👉' + actionUrl);
    //       //       found = true;
    //       //       checkinRequest.headers.Referer = actionUrl;
    //       //       eventPageRequest.url = actionUrl;
    //       //       eventPageRequest.headers.cookie = '';
    //       //       getJavascriptUrl();
    //       //     }
    //       //   }
    //       //   if (!found) {
    //       //     console.log('找不到簽到活動頁面');
    //       //     $done();
    //       //   }
    //       // } else {
    //       //   uuponNotify(
    //       //     '取得活動頁面失敗 ‼️',
    //       //     obj.resultMessage
    //       //   );
    //       //   $done();
    //       // }
    //     }
    //     catch (error) {
    //       uuponNotify(
    //         '取得活動頁面失敗 ‼️',
    //         error
    //       );
    //       $done();
    //     }
    //   } else {
    //     uuponNotify(
    //       'Cookie 已過期 ‼️',
    //       '請重新登入'
    //     );
    //     $done();
    //   }
    // }
  });
}

function getJavascriptUrl() {
  $httpClient.get(eventPageRequest, function (error, response, data) {
    if (error) {
      uuponNotify(
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
          uuponNotify(
            '取得 JS URL 失敗 ‼️',
            error
          );
          $done();
        }
      } else {
        uuponNotify(
          '取得 JS URL 失敗 ‼️',
          response.status
        );
        $done();
      }
    }
  });
}

function getPromoCloudConfig() {
  $httpClient.get(jsCodeRequest, function (error, response, data) {
    if (error) {
      uuponNotify(
        '取得活動 ID 失敗 ‼️',
        '連線錯誤'
      );
      $done();
    } else {
      if (response.status === 200) {
        try {
          const pNoRe = /punchConfig\.pNo(.*)"(.*)"/i;
          const pNo = data.match(pNoRe)[2];
          console.log('uupon 活動 ID 👉' + pNo);
          let body = JSON.parse(checkinRequest.body);
          body.pNo = pNo;
          checkinRequest.body = body;
          checkIn();
        }
        catch (error) {
          uuponNotify(
            '取得活動 ID 失敗 ‼️',
            error
          );
          $done();
        }
      } else {
        uuponNotify(
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
      uuponNotify(
        '簽到失敗 ‼️',
        '連線錯誤'
      );
    } else {
      if (response.status === 200) {
        const obj = JSON.parse(data);
        if (obj.data.status === 'OK') {
          uuponNotify(
            '今日簽到成功 ✅',
            ''
          );
        } else if (obj.data.status === 'RA') {
          console.log('本日已簽到');
          // uuponNotify(
          //   '簽到失敗 ‼️',
          //   '本日已簽到'
          // );
        } else if (obj.data.status === 'D') {
          uuponNotify(
            '簽到失敗 ‼️',
            '活動已到期'
          );
        } else if (obj.data.status === 'MAX') {
          uuponNotify(
            '簽到失敗 ‼️',
            '簽到人數達到上限'
          );
        } else if (obj.data.status === 'EPN2') {
          uuponNotify(
            '簽到失敗 ‼️',
            '活動不存在'
          );
        } else {
          uuponNotify(
            '簽到失敗 ‼️',
            obj.data.status
          );
        }
      } else {
        uuponNotify(
          'Cookie 已過期 ‼️',
          '請重新登入'
        );
      }
    }
    $done();
  });
}

getEventPageUrl();