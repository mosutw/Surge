function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍑 MonsterInvoice token', subtitle, message, { 'url': 'InvoiceMonster.app://' });
};

if ($request.method === 'POST') {
  console.log($request);
  // const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
  if ($request.body) {
    try {
      // let headers = JSON.parse($request.headers);
      let headers1 = $request.headers;
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