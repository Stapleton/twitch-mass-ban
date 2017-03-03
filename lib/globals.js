const globals = {
  modListFile: `./cache/Modded Channels - ${process.env.TWITCH_USERNAME}.txt`,
  modListUsernames: `./cache/Modded Channels - Usernames - ${process.env.TWITCH_USERNAME}.txt`,
  user: process.env.TWITCH_USERNAME,
  workingUser: process.argv[2],
  fileToParse: process.argv[3],
  twitch_client_id: 'p04q9em5dsuowcswv6wifxp7p9tgyb'
}
module.exports.globals = globals;
