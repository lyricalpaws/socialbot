const fs = require('fs');
const https = require('https');


module.exports = {
  TwitterReader: function (bearerID) {
    return new TwitterReader(bearerID);
  }
};

class TwitterReader{

  constructor(bearerID){
    this.bearerID = bearerID;
    this.twitterlist = null;
    this.users = new Array();
    this.tick();


    fs.readFile("/twitterIds", "utf8", (err,data) => {
      if(data){
          twitterlist = JSON.parse(data);
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

  addUser(user){
    this.users.push({"user":user,"last":-1});
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
