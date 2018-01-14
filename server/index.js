const express =    require("express")
const fs  =  require("fs")
const bodyParser  =  require("body-parser");
const CronJob = require('cron').CronJob;
const app =  new express()

let data =  require("./data/data.json")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/",(req,res)=>{

    res.json({
        message:"welcome to api"
    })
})




app.post("/send",(req,res)=>{

    /**
     * for handle if user not register
     */
     let sender  = data.users.find((_data)=>{
         return _data.userid  ==  req.body.sender
     })

     if(sender == null ){

        data.users  = data.users.concat({
            userid:req.body.sender,
            mypoint : 0,
            sharepoint :5
        })
     }
     
     let reciver  = data.users.find((_data)=>{
         return _data.userid  == req.body.reciver
     })

     if(reciver == null ){
        data.users  = data.users.concat({
            userid:req.body.reciver,
            mypoint : 0,
            sharepoint :5
        })
     }

    /**
     * for handle user send point 
     */
    data.users = data.users.map((_data)=>{
       if(_data.userid ==  req.body.sender && _data.sharepoint >= 0 ){
            _data.sharepoint  = _data.sharepoint -1
        }
        if(_data.userid == req.body.reciver){
            _data.mypoint = _data.mypoint + 1
        }
        return _data
    })

    fs.writeFileSync(__dirname +"/data/data.json", JSON.stringify(data));

    res.json(data)



})


app.get("/leaderboard",(req,res)=>{
   let sort  = {users:[]}
   sort.users = data.users.sort((_data1,_data2)=>{
        return _data2.mypoint -  _data1.mypoint
   }) 
   sort.users = (sort.users.length > 10 )? sort.users.slice(0,10):sort.users
   res.json(data)
})

app.get("/karma",(req,res)=>{
  let user  =  data.users.find((_data)=>{
      return _data.userid ==  req.query.userid
  })

  res.json(user)
})



app.listen(3000,()=>{
    console.log("server in port 3000")
})

/**
 * run cron job set 5 sharepoint to every user in 22:00 o'clock server time
 */
new CronJob('00 00 00 * * *', function() {
    console.log("update data ")
    data.users.map((_data)=>{
        _data.sharepoint = 5
    })
    fs.writeFileSync(__dirname +"/data/data.json", JSON.stringify(data));

}, null, true, 'Asia/Jakarta');