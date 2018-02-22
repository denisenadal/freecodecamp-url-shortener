var dotenv = require('dotenv').config();
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var validUrl = require('valid-url');
var app = new express();

mongoose.connect('mongodb://' + process.env.DB_USER + ':'+ process.env.DB_PASS + '@' + process.env.DB_HOST);
var dbconnection = mongoose.connection;
dbconnection.on('error',console.error.bind(console,'connection error') );
dbconnection.once('open',function(){
	console.log('connected to db at mlabs');
});

var urlObjSchema = mongoose.Schema({
	originalUrl:{
		type: String,
		required: true,
		default:"http://glitch.com"
	},
	shortUrl: String
});
urlObjSchema.statics.findUrlObj = function(shortUrl,success,fail){
	UrlObj.findOne({"shortUrl":shortUrl},
		function(err,urlObj){
			if(err){
				console.log(err);
				fail();
			}
			else{
				console.log(urlObj);
				success(urlObj);
			}
		});
};
urlObjSchema.statics.makeUrlObj = function(submittedUrl,random, success, fail){
	//console.log('called makeUrlObj');
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
var UrlObj = mongoose.model('UrlObj',urlObjSchema);



app.get('/',function(req,res){
	res.status(200).end('home');
});

app.get('/new/:url',function(req,res){
	if(!validUrl.isUri(req.params.url) ){
		res.status(400).json({err:"that doesn't look like a url"});
	}
	var random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	UrlObj.makeUrlObj(req.params.url,random, function(urlObj){
		//success
		res.status(200).json( urlObj);
	},function(err){
		//fail
		res.status(500).json( {'err':err});
	})

});

app.get('/*',function(req,res){
	if(req._parsedUrl.path.substr(1).length !== 5 ){
		res.status(400).json({err:"that's not the right length. Sure you have the right url?'"});
	}
	else{
		UrlObj.findUrlObj(req._parsedUrl.path.substr(1), function(urlObj){
			res.status(200).json( urlObj);
		},function(err){
			res.status(500).json( {'err':err});
		});
	}

});

app.listen(process.env.PORT,function(){
	console.log("listening on ",process.env.PORT);
});
