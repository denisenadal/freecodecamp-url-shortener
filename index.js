var dotenv = require('dotenv').config();
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var validUrl = require('valid-url');
var app = new express();

app.use(express.static('public') );

mongoose.connect('mongodb://' + process.env.DB_USER + ':'+ process.env.DB_PASS + '@' + process.env.DB_HOST);
var dbconnection = mongoose.connection;
dbconnection.on('error',console.error.bind(console,'connection error') );
dbconnection.once('open',function(){
	console.log('connected to db at mlabs');
});

//define schema of datbase object
var urlObjSchema = mongoose.Schema({
	originalUrl:{
		type: String,
		required: true,
		default:"https://den-url-shortener.glitch.me"
	},
	shortUrl: String
});

//define methods for the Schema Type
urlObjSchema.statics.findUrlObj = function(shortUrl,success,fail){
	UrlObj.findOne({"shortUrl":shortUrl},
		function(err,urlObj){
			if(err){
				fail();
			}
			else{
				success(urlObj);
			}
		});
};
urlObjSchema.statics.makeUrlObj = function(submittedUrl,random, success, fail){
	var newUrlObj = new UrlObj({
		originalUrl: submittedUrl,
		shortUrl: random
	});
	newUrlObj.save(function(err){
		if(err){
			//console.log('failed to save new doc');
			fail();
		}
		else{
			//console.log('saved new doc');
			success(newUrlObj);
		}
	});
};

//make the schema an active model to be used
var UrlObj = mongoose.model('UrlObj',urlObjSchema);


//home page should show intro
app.get('/',function(req,res){
	res.status(200).end('home');
});

app.get(/\/new\/https?(:\/\/)?.*/,function(req,res){
	var requestedURL = req.url.replace('/new/','');
	requestedURL = decodeURIComponent(requestedURL);
	if(!validUrl.isWebUri(requestedURL) ){
		res.status(400).json({err:"that doesn't look like a url"}).end();
	}
	var random = "/"+Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	UrlObj.makeUrlObj(requestedURL,random, function(urlObj){
		//success
		urlObj.shortUrl = req.protocol + '://'+req.hostname+urlObj.shortUrl;
		res.status(200).json( urlObj);
	},function(err){
		//fail
		res.status(500).json( {'err':err});
	})
});

//any other url
app.get('/*',function(req,res){
	//if it's not the right size for a shortened url, reject it
	if(req._parsedUrl.path.length !== 6 ){
		res.status(400).json({err:"that's not the right length. Sure you have the right url?'"});
	}
	else{
		//else look for it in the database, if found, redirect user
		UrlObj.findUrlObj(req.originalUrl, function(urlObj){
			res.redirect(302,urlObj.originalUrl);
		},function(err){
			res.status(500).json( {'err':err});
		});
	}

});

app.listen(process.env.PORT,function(){
	console.log("listening on ",process.env.PORT);
});
