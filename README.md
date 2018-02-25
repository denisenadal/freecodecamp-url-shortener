# freecodecamp-url-shortener #

## description ##
A simple api to create shortened urls. Based on the project found here: https://www.freecodecamp.org/challenges/url-shortener-microservice

The github for my version is found here: https://github.com/denisenadal/freecodecamp-url-shortener

## endpoints ##
### / ###
home/root contains an html version of the README.
### /new/:myURL ###
the path to create a new shortened url. It will response with the old and new url in json. It will accept both properly formatted urlencoded urls and plain text ones.

### /*****  ###
the new url will be  a 5 character string path. visiting the path will redirect your browser to the originalUrl.

## database structure ##
Database is a mongodb hosted by mLabs, and uses mongoose to handle asynchronization. The database Schema for each url object is simply:
```
urlObj ={
	_id : unique_id,
	originalUrl: a url string valided by validUrl,
	newUrl: a random 5 character string.
};
```

## dependencies ##
are listed in package.json. Requires node, express, mongodb, mongoose, and valid-url to run.
