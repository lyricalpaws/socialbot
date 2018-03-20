const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./settings.json').token;
const bearer = require('./settings.json').bearer;
const ddiff = require('return-deep-diff');
const vtwitter = require('./vtwitter.js');
const twitreader = vtwitter.TwitterReader(bearer);

twitreader.setOnError(err =>{console.error(err);});

const prefix = "!";
const name = "Socialbot";
const version = "0.0.5";

const staffname = "Staff"

let hasinit = false;
let channels = new Array();

client.on('ready', () => {
  if(hasinit){
    return;
  }
  hasinit = true;
    console.log('I\'m Functional');
    client.guilds.forEach(g => {

      g.channels.forEach( gc => {
        if(gc.name == "social"){
          channels.push(gc);
        }
      });

      twitreader.setOnTweet(t =>{

        try{

        let re = new Discord.RichEmbed();
        re.setThumbnail(t.user.profile_image_url);
        re.setTitle(t.user.name);
        re.addField("Tweeted: " , t.text);
        re.setColor('#16b1ff');
        re.setURL("https://twitter.com/statuses/" + t.id_str);
        channels.forEach(gc => {
          gc.sendEmbed(re);
        });



        if(t.extended_entities){
        t.extended_entities.media.forEach(m => {
          let re = new Discord.RichEmbed();
          re.setColor(0x0084b4);
          re.setImage(m.media_url);
          channels.forEach(gc => {

            gc.sendEmbed(re);

          });
        });

      }
      }catch(err){
        console.error(err);
      }

      });


      twitreader.setOnError(err =>{
        try{
        g.members.forEach(mem => {
          let staffrole = g.roles.find("name", staffname);
          if(mem.roles.has(staffrole.id)){
              mem.sendMessage(err);
          }
        });
      }catch(err){
        console.error(err);
      }
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
      try{
      users += u.user;
      if(twitreader.getUsers().length - i > 2){
        users += ", ";
      }

      if(twitreader.getUsers().length - i == 2){
        users += " and ";
      }
    }catch(err){
      console.error(err);
    }

    });

      message.reply(name  + " is currently running verion " + version + "\n\n" +
      name + " is currently listening for tweets from " + users);
    }

  if(message.content.startsWith(prefix + "add")){
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
