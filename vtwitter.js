const fs = require('fs');
const https = require('https');


module.exports = {
  TwitterReader: function (bearerID) {
    return new TwitterReader(bearerID);
  }
};

let twitterlist = null;

class TwitterReader{

  constructor(bearerID){
    this.bearerID = bearerID;
    this.users = new Array();
    this.tick();


    fs.readFile("twitterIds.json", "utf8", (err,data) => {
      if(data){
          twitterlist = JSON.parse(data);
          try{twitterlist.forEach(u => {
            this.addUser(u, (mess) => {console.log(mess);});
          });
        }catch(err){
          if(this.errorcallback){
            this.errorcallback(err);
          }
        }
      }
    });

  }

  tick(){
      this.users.forEach(u => {
        this.getTweets(u.user, json =>{
            if(json.errors && this.errorcallback){
              json.errors.forEach( err => {
                this.errorcallback("error " + err.code + " : " + err.message);
              });
            }else{
              try{
                if(u.last < 0){
                  if(json[0]){
                    u.last = json[0].id;
                  }
                }else{
                  json.reverse().forEach(t => {
                    let id = t.id;
                    if(id > u.last){
                      this.tweetcallback(t);
                      u.last = id;
                    }

                  });

                }
              }catch(err){
                if(this.errorcallback){
                  this.errorcallback(err);
                }
              }
            }
        })
      });
  }

  setOnTweet(callback){
    this.tweetcallback = callback;
  }

setOnError(callback){
  this.errorcallback = callback;
}

  addUser(user, callback){
    let exists = false;
    this.users.forEach(u => {
      if(u.user == user){
        if(callback){
          callback(user +" is already on my list!");
        }
        exists = true;
      }
    });
    if(!exists){
    this.users.push({"user":user,"last":-1});
    let tusers = new Array();
    for(let us of this.users){
    tusers.push(us.user);
  }
    fs.writeFile("twitterIds.json",JSON.stringify(tusers),"utf8",() => {callback("added " + user)});
  }
  }

  getUsers(){
    return this.users;
  }

  getTweets(user, callback){
    https.request({
      host: "api.twitter.com",
      path : "/1.1/statuses/user_timeline.json?screen_name=" + user + "&count=20",
      headers: {
         "Content-Type": "application/x-www-form-urlencoded" ,
         "Authorization": "Bearer " + this.bearerID
      }
    },res =>{
      let str = '';

      res.on('data', function (chunk) {
          str += chunk;
        });
        res.on('end', function () {
          callback(JSON.parse(str));
        });
    }).end();
  }

}
