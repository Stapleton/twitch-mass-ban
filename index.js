require('dotenv').config({path: './auth.env'});
const _tmi = require('tmi.js');
const _fs = require('fs');

const globals = {
  script: process.argv[1],
  channel: process.argv[2],
  file: process.argv[3],
  twitch_client_id: 'p04q9em5dsuowcswv6wifxp7p9tgyb'
}

// Create option object. Contains configuration for _tmi.client()
const options = {
  options: { clientId: globals.twitch_client_id, debug: false },
  connection: { reconnect: true, secure: true },
  identity: { username: process.env.TWITCH_USERNAME, password: process.env.TWITCH_OAUTH },
  channels: [ globals.channel ]
}

// Construct new client with options [Object];
// Export client out of module as 'client'
const client = new _tmi.client(options);

// Connect previously constructed client
client.connect();

client.on('connected', () => {
  doIt();
});

function doIt() {
  _fs.readFile(globals.file, 'utf8', (error, fileData) => {
    if (error) throw error;

    let banList = fileData.replace(/\r\n/g, ' ').split(' ');
    let banQueue = banList;

    if (banQueue.length != 0) {
      let channel = globals.channel.toString();
      do {
        /*_twitch.client.ban(channel, banQueue[0].toString(), `PM ${process.env.TWITCH_USERNAME} about why this user was banned. Automated with Twitch Mass Ban by OscarXcore.`)
        .then((data) => {
          console.log(`${data[0]}: ${data[1]} is now banned. Reason: ${data[2]}`);
        }).catch((error) => {
          console.log(error);
        })*/
        client.say(channel, `/ban ${banQueue[0].toString()} "PM ${process.env.TWITCH_USERNAME} about why this user was banned. Automated with Twitch Mass Ban by OscarXcore."`)
        console.log(`#${channel}: User #${banQueue.length} | ${banQueue[0].toString()} has been banned from the channel.`);
        banQueue.shift();
      } while (banQueue.length != 0);
    }
	if (banQueue.length == 0) {
		console.log('\nFinished. Press CTRL+C to exit.');
	}
  });
}
