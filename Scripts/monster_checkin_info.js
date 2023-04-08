function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍑 MonsterInvoice token', subtitle, message, { 'url': 'InvoiceMonster.app://' });
};

if ($request.method === 'POST') {
  console.log($request);
  // const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
  if ($request.body) {
    try {
      // let headers = JSON.parse($request.headers);
      // let headers1 = $request.headers;
      const headers1 = '{"accept":"*\/*","content-type":"application\/json","accept-encoding":"gzip, deflate, br","user-agent":"InvoiceMonster\/3.30.4 (iPhone; iOS 16.3.1; Scale\/3.00)","content-length":"52","accept-language":"zh-Hant-TW;q=1, en-TW;q=0.9, zh-Hans-TW;q=0.8","authorization":"yfDEN17pEB5TO5aPgfJx5LsRBEL06DvR"}'
      let headers = JSON.parse(headers1);
      let body = JSON.parse($request.body);
      console.log("----------------");
      console.log(body);
      console.log("----------------");
      console.log(headers);
      // const saveCookie = $persistentStore.write(headers, 'monsterHeaders');
      const saveBody = $persistentStore.write(JSON.stringify(body), 'monsterBody');
      console.log(saveBody);
      if (!(saveBody)) {
        surgeNotify(
          '保存失敗 ‼️',
          '請稍後嘗試'
        );
      } else {
        surgeNotify(
          '保存成功 🍪',
          ''
        );
      }
    } catch (error) {
      surgeNotify(
        '保存失敗 ‼️',
        error
      );
    }
  } else {
    surgeNotify(
      '保存失敗 ‼️',
      '請重新登入'
    );
  }
}
$done({})