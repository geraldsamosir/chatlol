const Botkit = require('botkit');
const axios = require('axios');


let controller = Botkit.slackbot({
  debug: false,
  json_file_store: '../data'
});

// connect the bot to a stream of messages
controller.spawn({
  token: 'xoxb-299674182759-hjq3N9KuiganlBTVWHr8Jhhn',
}).startRTM();


// give the bot something to listen for.
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {
  bot.reply(message,'Hello yourself.');
});



controller.hears(['thanks'],'direct_message,direct_mention  ,ambient', function(bot, message) {
    let coming =  message
    let sender =  coming.raw_message.user
    let resiver = coming.raw_message.text.match(/\@(.*)\>/)[1]
    if(resiver != "U8TKU5CNB" && sender!= resiver){
      axios.get("http://localhost:3000/karma?userid="+sender)
      .then((_response)=>{
        console.log(_response.data)
          if(_response.data.sharepoint > 0 || _response.data == ""){
            axios.post('http://localhost:3000/send',{
                sender : sender,
                reciver : resiver
              })
              .then(function (response) {
              
                  let resiverdata  =   response.data.users.find((data)=> data.userid ==  resiver)
                  bot.reply(message,'<@'+sender+'> send 1 karma point to <@' +resiver+'>');   
                  bot.reply(message ,"<@"+resiver+"> has "+resiverdata.mypoint+" karma point")
              })
          }
          else{
           bot.reply(message,"you canot send karma point to  <@"+resiver+"> because your karma point to share today only  0 karma point")
          }
      })
  }
  else if(resiver == sender){
    bot.reply(message,"you must send karma point to another user")
  }
  else{
     bot.reply(message,"cannot send karma to <@"+resiver+">")
  }


});


/** 
 *  show leader boards
*/
controller.hears(["^leaderboard$"],'direct_message,direct_mention',(bot,message)=>{        
  axios.get("http://localhost:3000/leaderboard")
  .then((response)=>{
    
     let text =  ""
     response.data.users.map((_data,index)=>{
        
        text +="\n "+ (index +1 )+"  <@"+_data.userid+"> , "+_data.mypoint+ " karma point"
     })
   
    bot.reply(message,"list of leader board \n ==================== \n  "+text)
    
  })
    
})

 /**
  * show your point and how many you can give 
 */    
  controller.hears(["^karma$"],'direct_message,direct_mention ',(bot,message)=>{
    axios.get("http://localhost:3000/karma?userid="+message.raw_message.user)
    .then(function (response){
      if(response.data != ""){
        bot.reply(message,"you have "+response.data.mypoint+" karma point , and can give "+response.data.sharepoint+" karmas today")
      }
      else{
        bot.reply(message,"you have  0 karma point , and can give 5 karmas today")
      }
    })
    
  })

console.log("my bot run using rtm")

