var express = require('express');
var fs = require('fs');

var bufString = fs.readFileSync("index.html");
var helloString = new Buffer(bufString);
 
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(helloString.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
