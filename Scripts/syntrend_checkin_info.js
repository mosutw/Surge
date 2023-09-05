function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍑 三創天天瘋簽到 token', subtitle, message, { 'url': 'Syntrendapp://' });
};

if ($request.method === 'POST') {
  surgeNotify('syntrend cookie');
  const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
  console.log(cookie);
  console.log('-----------------');
  console.log(request.bogy);
  console.log('--------------------')
  if (cookie && $request.body) {
    try {
      let body = JSON.parse($request.body);
      if (body.doAction === 'list') {
        body.pNo = '';
        body.doAction = 'reg';
        const saveCookie = $persistentStore.write(cookie, 'surgeCookie');
        const saveBody = $persistentStore.write(JSON.stringify(body), 'surgeBody');
        if (!(saveCookie && saveBody)) {
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
      }
    } catch (error) {
      momoNotify(
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