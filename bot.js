const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./settings.json').token;
const bearer = require('./settings.json').bearer;
const ddiff = require('return-deep-diff');
const vtwitter = require('./vtwitter.js');
const twitreader = vtwitter.TwitterReader(bearer);

let json = null;

let re = new Discord.RichEmbed();

twitreader.addUser("Vatril_Debug");

let hasinit = false;


client.on('ready', () => {
  if(hasinit){
    return;
  }
  hasinit = true;
    console.log('I\'m Online\nI\'m Online');
    client.guilds.forEach(g => {
      g.defaultChannel.sendMessage(`hello`);

      twitreader.setOnTweet(t =>{
        //todo add OnTweet
      });

      twitreader.setOnError(t =>{
        //todo add OnError
      });

      twitreader.tick();
      setInterval(() => {twitreader.tick();},60*1000);
    });
});




client.login(token);
