function surgeNotify(subtitle = '', message = '') {
  $notification.post('🍑 MonsterInvoice token', subtitle, message, { 'url': 'monster.app://' });
};

if ($request.method === 'POST') {
  const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
  console.log($request);
  if (cookie && $request.body) {
    try {
      let body = JSON.parse($request.body);
      if (body.doAction === 'list') {
        body.pNo = '';
        body.doAction = 'reg';
        const saveCookie = $persistentStore.write(cookie, 'monsterCookie');
        const saveBody = $persistentStore.write(JSON.stringify(body), 'monsterBody');
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