const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./settings.json').token;
const bearer = require('./settings.json').bearer;
const ddiff = require('return-deep-diff');
const vtwitter = require('./vtwitter.js');
const twitreader = vtwitter.TwitterReader(bearer);

twitreader.setOnError(err =>{console.error(err);});

const prefix = "!";
const name = "socialbot";
const version = "0.0.1";

const staffname = "Staff"

let hasinit = false;


client.on('ready', () => {
  if(hasinit){
    return;
  }
  hasinit = true;
    console.log('I\'m Online\nI\'m Online');
    client.guilds.forEach(g => {

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
        g.members.forEach(mem => {
          let staffrole = g.roles.find("name", staffname);
          if(mem.roles.has(staffrole.id)){
              mem.sendMessage(err);
          }
        });
      });

      twitreader.tick();
      setInterval(() => {twitreader.tick();},60*10000);
    });
});

client.on('message', message => {

  let staffrole = message.guild.roles.find("name", staffname);

  if (!message.content.startsWith(prefix) || message.author.bot || !message.member.roles.has(staffrole.id)) return;


  if(message.content.startsWith(prefix + "status")){

    let users = ""

    twitreader.getUsers().forEach((u,i) => {
      users += u.user;
      if(twitreader.getUsers().length - i > 2){
        users += ", ";
      }

      if(twitreader.getUsers().length - i == 2){
        users += " and ";
      }

    });

      message.reply(name  + "is currently running verion " + version + "\n\n" +
      name + " is currently listening for tweets from " + users);
    }

  if(message.content.startsWith(prefix + "add twitter")){
    let parts = message.content.split(" ");
    try{
    twitreader.addUser(parts[parts.length - 1], mess => {
      message.reply(mess);
    });
  }catch(err){

  }
  }

});




client.login(token);
