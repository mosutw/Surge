function fetnetNotify(subtitle = '', message = '') {
  $notification.post('🍑 Fetnet token', subtitle, message, { 'url': 'superapp://' });
};

if ($request.method === 'POST') {
  // fetnetNotify('test1');
  fetnetNotify('u:' + $request.url);
  // const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
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
$done({})
