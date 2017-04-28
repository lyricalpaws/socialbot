const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./settings.json').token;
const bearer = require('./settings.json').bearer;
const ddiff = require('return-deep-diff');
const vtwitter = require('./vtwitter.js');
const twitreader = vtwitter.TwitterReader(bearer);

let json = null;



twitreader.addUser("Vatril_Debug");
twitreader.addUser("lyricalpaws");

let hasinit = false;


client.on('ready', () => {
  if(hasinit){
    return;
  }
  hasinit = true;
    console.log('I\'m Online\nI\'m Online');
    client.guilds.forEach(g => {
      g.defaultChannel.send(`hello`);

      twitreader.setOnTweet(t =>{
        let re = new Discord.RichEmbed();
        re.setThumbnail(t.user.profile_image_url);
        re.setTitle(t.user.name);
        re.addField("Tweeted: " , t.text);
        re.setColor(0x0084b4);
        re.setURL("https://twitter.com/statuses/" + t.id_str);
        g.defaultChannel.sendEmbed(re);

  

        t.extended_entities.media.forEach(m => {
          let re = new Discord.RichEmbed();
          re.setColor(0x0084b4);
          re.setImage(m.media_url);
          g.defaultChannel.sendEmbed(re);
        });


      });

      twitreader.setOnError(err =>{
        g.defaultChannel.send(err);
      });

      twitreader.tick();
      setInterval(() => {twitreader.tick();},60*1000);
    });
});




client.login(token);
