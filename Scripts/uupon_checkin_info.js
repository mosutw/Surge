function uuponNotify(subtitle = '', message = '') {
  $notification.post('UUPON cookie', subtitle, message, { 'url': 'uupon://' });
};

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec($request.url);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
//3

if ($request.method === 'GET') {
  const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
  // if (cookie && $request.body) {
  if (cookie) {
    try {
      console.log('cookie:' + cookie)
      const saveCookie = $persistentStore.write(cookie, 'uuponCookie');
      if (!saveCookie) {
        uuponNotify(
          '保存失敗 ‼️',
          '請稍後嘗試'
        );
      } else {
        uuponNotify(
          '保存成功 🍪',
          ''
        );
      }
    } catch (error) {
      uuponNotify(
        '保存失敗 ‼️',
        error
      );
    }
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
