require('dotenv').config();
const _globals_ = require('./lib/globals');

let initPromise1 = new Promise((resolve, reject) => {
  require('./lib/modStatus');
  resolve();
});
initPromise1.catch(() => { console.log(); });
initPromise1.then(() => {
  let initPromise2 = new Promise((resolve, reject) => {
    require('./lib/twitchConnect');
    require('./lib/twitchConnect').on('disconnected', (reason) => {
      reject(reason);
    });
    require('./lib/twitchConnect').on('connected', () => {
      resolve();
    })
  });
  initPromise2.catch((reason) => { console.log(reason); });
  initPromise2.then(() => {
    let initPromise3 = new Promise((resolve, reject) => {
      console.log('\nStarting.');
      require('./lib/fileParsing');
      resolve();
    });
    initPromise3.catch((error) => { console.log(error); });
    initPromise3.then(() => {
      if (_globals_.globals.finished == true) {
        console.log('Done. Exiting.');
        process.exit(0);
      }
    });
  });
});
