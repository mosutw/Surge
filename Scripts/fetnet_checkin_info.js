function fetnetNotify(subtitle = '', message = '') {
  $notification.post('🍑 Fetnet token', subtitle, message, { 'url': 'superapp://' });
};

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec($request.url);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
//3

if ($request.method === 'GET') {
  fetnetNotify('test1');
  var client_id = getUrlParameter("client_id")
  // console.log('client_id:' + client_id)

  const saveClientId = $persistentStore.write(client_id, 'fetnetClientId');
  if (!(saveClientId)) {
    fetnetNotify(
      '保存ClientId 失敗 ‼️',
      '請稍後嘗試'
    );
  } else {
    fetnetNotify(
      '保存Client Id成功',
      ''
    );
  }

  // if (cookie && $request.body) {
  //   try {
  //     let body = JSON.parse($request.body);
  //     if (body.doAction === 'list') {
  //       body.pNo = '';
  //       body.doAction = 'reg';
  //       const saveCookie = $persistentStore.write(cookie, 'fetnetCookie');
  //       const saveBody = $persistentStore.write(JSON.stringify(body), 'fetnetBody');
  //       if (!(saveCookie && saveBody)) {
  //         fetnetNotify(
  //           '保存失敗 ‼️',
  //           '請稍後嘗試'
  //         );
  //       } else {
  //         fetnetNotify(
  //           '保存成功 🍪',
  //           ''
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     fetnetNotify(
  //       '保存失敗 ‼️',
  //       error
  //     );
  //   }
  // } else {
  //   fetnetNotify(
  //     '保存失敗 ‼️',
  //     '請重新登入'
  //   );
  // }
}

// if ($request.method === 'POST') {
//   // fetnetNotify('test1');
//   const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
//   fetnetNotify($request.url);
//   console.log('url:' + $request.url)
//   // if (cookie && $request.body) {
//   //   try {
//   //     let body = JSON.parse($request.body);
//   //     if (body.doAction === 'list') {
//   //       body.pNo = '';
//   //       body.doAction = 'reg';
//   //       const saveCookie = $persistentStore.write(cookie, 'fetnetCookie');
//   //       const saveBody = $persistentStore.write(JSON.stringify(body), 'fetnetBody');
//   //       if (!(saveCookie && saveBody)) {
//   //         fetnetNotify(
//   //           '保存失敗 ‼️',
//   //           '請稍後嘗試'
//   //         );
//   //       } else {
//   //         fetnetNotify(
//   //           '保存成功 🍪',
//   //           ''
//   //         );
//   //       }
//   //     }
//   //   } catch (error) {
//   //     fetnetNotify(
//   //       '保存失敗 ‼️',
//   //       error
//   //     );
//   //   }
//   // } else {
//   //   fetnetNotify(
//   //     '保存失敗 ‼️',
//   //     '請重新登入'
//   //   );
//   // }
// }
$done({})
