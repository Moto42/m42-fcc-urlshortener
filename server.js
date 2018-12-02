'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});



const urlSchema = new mongoose.Schema({
  original_url : String,
  short_code   : Number,
  })
const URL = mongoose.model('URL',urlSchema);



function serveShortUrl(req,res) {
  const {url: original_url} = req.body;
  let   short_url           = 'not implimented';
  let   server_msg          = 'nothing to say';
  
  //check to see if the url is already in the database
  const conditions = {
    original_url : original_url,
  };
  URL.find( conditions,(err,urlData)=>{
    if(urlData.length === 0){
      URL.find().sort('-short_code').limit(1).exec( (err,highURL)=>{
        const short_code = highURL[0] ? highURL[0].short_code+1 : 1;
        const newURL = URL({
          original_url: original_url,
          short_code  : short_code,
        });
        newURL.save((err,urlData)=>{
          short_url = urlData.short_code;
          res.send( { 
            "original_url" : original_url,
            "short_url"    : short_url,
          } )  
        });  
      } );
    } else {
      console.log(urlData[0].short_code);
      short_url = urlData[0].short_code;
      res.send( { 
        "original_url" : original_url,
        "short_url"    : short_url,
      } )
    }
  } );
  
  
}
app.post('/api/shorturl/:url',serveShortUrl);

app.get('/:short_code',(req,res)=>{
  URL.find({short_code:req.params.short_code}, (err,document) =>{
    if(!err) {
      if(document.length===0){
        res.send({"Error":"URL Not Found"});
      } else {
        const sendTo = document[0].original_url;
        res.redirect(sendTo);
      }
    } else {
      res.send({"error" : "Error Contacting Database"});
    }
  } );
})

























app.listen(port, function () {
  console.log('Node.js listening ...');
});