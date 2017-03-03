const _globals_ = require('./globals');
const _fs_ = require('fs');
const _tmi_ = require('tmi.js');

const tmiOptions = {
  options: { clientId: _globals_.globals.twitch_client_id, debug: false },
  connection: { reconnect: true, secure: true },
  identity: { username: process.env.TWITCH_USERNAME, password: process.env.TWITCH_OAUTH },
  channels: []
}

const tmiClient = new _tmi_.client(tmiOptions);
module.exports = tmiClient;
tmiClient.connect();
tmiClient.on('ban', (channel, user, reason) => {
	console.log(user + ' was banned in ' + channel + 'for reason: ' + reason);
});

function replaceMSGID(msgid) {
	if (msgid == 'already_banned') {
		return 'User is already banned.';
	}
}

tmiClient.on('notice', (channel, msgid, message) => {
	console.log(channel + ': ' + replaceMSGID(msgid));
});