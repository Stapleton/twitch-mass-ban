const _fs_ = require('fs');
const _globals_ = require('./globals');
const _twitchConnect_ = require('./twitchConnect');

function banUsers() {
  _fs_.readFile(_globals_.globals.fileToParse, 'utf8', (error, logData) => {
    if (error) throw error;

    let banList = logData.replace(/\r\n/g, ' ').split(' ');
    let banQueue = banList;

    if (banQueue.length != 0) {
      let channelInProcessing = _globals_.globals.workingUser.toString();
      do {
        _twitchConnect_.ban(channelInProcessing, banQueue[0].toString()).then().catch((error) => { if (error) { error = null; } });
        banQueue.shift();

      } while (banQueue.length != 0);
    }
    if (banQueue[0] == undefined) {
      console.log('\nFinished. Please do CTRL+C to quit.\n');
    }
  });
}
banUsers();
