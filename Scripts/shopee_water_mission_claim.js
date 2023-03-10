let showNotification = true;
let config = null;
let rewards = [];

function surgeNotify(subtitle = '', message = '') {
  $notification.post('π€ θ¦θ¦ζει εδ»»εηε΅', subtitle, message, { 'url': 'shopeetw://' });
};

function handleError(error) {
  if (Array.isArray(error)) {
    console.log(`β ${error[0]} ${error[1]}`);
    if (showNotification) {
      surgeNotify(error[0], error[1]);
    }
  } else {
    console.log(`β ${error}`);
    if (showNotification) {
      surgeNotify(error);
    }
  }
}

function getSaveObject(key) {
  const string = $persistentStore.read(key);
  return !string || string.length === 0 ? {} : JSON.parse(string);
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object ? true : false;
}

function cookieToString(cookieObject) {
  let string = '';
  for (const [key, value] of Object.entries(cookieObject)) {
    string += `${key}=${value};`
  }
  return string;
}

async function delay(seconds) {
  console.log(`β° η­εΎ ${seconds} η§`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

async function preCheck() {
  return new Promise((resolve, reject) => {
    const shopeeInfo = getSaveObject('ShopeeInfo');
    if (isEmptyObject(shopeeInfo)) {
      return reject(['ζͺ’ζ₯ε€±ζ βΌοΈ', 'ζ²ζζ°η token']);
    }
    const shopeeHeaders = {
      'Cookie': cookieToString(shopeeInfo.token),
      'Content-Type': 'application/json',
    }
    config = {
      shopeeInfo: shopeeInfo,
      shopeeHeaders: shopeeHeaders,
    }
    return resolve();
  });
}

async function getRewardList() {
  return new Promise((resolve, reject) => {
    try {
      const getListRequest = {
        url: `https://games.shopee.tw/farm/api/task/listV2?t=${new Date().getTime()}`,
        headers: config.shopeeHeaders,
      };
      $httpClient.get(getListRequest, function (error, response, data) {
        if (error) {
          return reject(['εεΎεθ‘¨ε€±ζ βΌοΈ', 'ι£η·ι―θͺ€']);
        } else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            const taskGroups = obj.data.userTasks;
            for (let i = 0; i < taskGroups.length; i++) {
              const taskList = taskGroups[i];
              for (let j = 0; j < taskList.length; j++) {
                const task = taskList[j];
                const taskId = task.taskInfo.Id;
                const taskName = task.taskInfo.taskName;
                if (task.canReward === true) {
                  rewards.push({
                    taskId: taskId,
                    taskName: taskName
                  });
                }
              }
            }
            if (rewards.length) {
              console.log(`β εεΎεθ‘¨ζεοΌηΈ½ε±ζ ${rewards.length} εδ»»εε―ι εηε΅`);
              return resolve();
            }
            else {
              return reject(['εεΎεθ‘¨ε€±ζ βΌοΈ', 'ζ²ζε―ι εηηε΅']);
            }
          } else {
            return reject(['εεΎεθ‘¨ε€±ζ βΌοΈ', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['εεΎεθ‘¨ε€±ζ βΌοΈ', error]);
    }
  });
}

async function claimReward(reward) {
  return new Promise((resolve, reject) => {
    try {
      const taskId = reward.taskId;
      const taskName = reward.taskName;

      const claimRewardRequest = {
        url: `https://games.shopee.tw/farm/api/task/reward/claim?t=${new Date().getTime()}`,
        headers: config.shopeeHeaders,
        body: {
          taskId: taskId,
          taskFinishNum: 1,
          isNewUserTask: false,
          forceClaim: false,
        },
      };

      $httpClient.post(claimRewardRequest, function (error, response, data) {
        if (error) {
          return reject(['ι εε€±ζ βΌοΈ', 'ι£η·ι―θͺ€']);
        } else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            if (obj.code === 0) {
              console.log(`β ι εγ${taskName}γζε`);
              return resolve();
            } else if (obj.code === 409004) {
              return reject(['ι εε€±ζ βΌοΈ', `η‘ζ³ι εγ${taskName}γγδ½η©ηζι―θͺ€οΌθ«ζͺ’ζ₯ζ―ε¦ε·²ζΆζ`]);
            } else {
              return reject(['ι εε€±ζ βΌοΈ', `η‘ζ³ι εγ${taskName}γοΌι―θͺ€δ»£θοΌ${obj.code}οΌθ¨ζ―οΌ${obj.msg}`]);
            }
          } else {
            return reject(['ι εε€±ζ βΌοΈ', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['ι εε€±ζ βΌοΈ', error]);
    }
  });
}

(async () => {
  console.log('βΉοΈ θ¦θ¦ζει εδ»»εηε΅ v20230119.1');
  try {
    await preCheck();
    await getRewardList();

    for (let i = 0; i < rewards.length; i++) {
      await delay(0.5);
      await claimReward(rewards[i]);
    }
    console.log('β ι εζζηε΅')
    surgeNotify('ε·²ι εζζηε΅ β', '');
  } catch (error) {
    handleError(error);
  }
  $done();
})();
