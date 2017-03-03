const _fs_ = require('fs');
const _https_ = require('https');
const _globals_ = require('./globals');

function getModdedChannels() {
  let moddedChannels = [];
  let optionsMOD = {
    hostname: 'twitchstuff.3v.fi',
    port: 443,
    path: `/modlookup/api/user/${_globals_.globals.user}`,
    method: 'GET'
  }
  let req = _https_.get(optionsMOD, (response) => {
    response.on('data', (data) => {
      data = data.toString();
      try {
        data = JSON.parse(data);
      } catch (error) {
        error = null;
      }
      for (let i = 0; i < data.channels.length; i++) {
        moddedChannels[i] = data.channels[i].name;
      }
      let optionsUID = {
        hostname: 'api.twitch.tv',
        path: `/kraken/users?login=${moddedChannels}`,
        headers: {
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Client-ID': _globals_.globals.twitch_client_id
        }
      }
      let xhr = _https_.request(optionsUID, (response) => {
        response.on('data', (data) => {
          let userIDs = [];
          data = JSON.parse(data);
          for (let i = 0; i < data.users.length; i++) {
            userIDs[i] = data.users[i]._id;
          }
          _fs_.writeFile(_globals_.globals.modListFile, userIDs, (error) => {
            if (error) throw error;
          });
          _fs_.writeFile(_globals_.globals.modListUsernames, moddedChannels, (error) => {
            if (error) throw error;
          });
        });
      });
      xhr.end();
      _globals_.globals.updateMods = true;
    });
  });
}

function modFileDateCheck() {
  _fs_.stat(_globals_.globals.modListFile, (error, stats) => {
    const currentTimeMS = Date.now();
    const fileModDate = Date.parse(stats.mtime);
    if (currentTimeMS != fileModDate) {
      getModdedChannels();
      console.log('\nMod List has been updated.');
    } else {
      console.log('\nMod List is up to date.');
    }
  });
  _fs_.stat(_globals_.globals.modListUsernames, (error, stats) => {
    const currentTimeMS = Date.now();
    const fileModDate = Date.parse(stats.mtime);
    if (currentTimeMS != fileModDate) {
      getModdedChannels();
    }
  })
}
modFileDateCheck();
