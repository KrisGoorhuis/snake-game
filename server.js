var express = require('express');
var app = express();
var path = require('path');
var sass = require('node-sass');

app.use(express.static(path.join(__dirname, '')));

app.get('/', function(request, response) {
   response.sendfile(path.resolve(__dirname, 'index.html'));
});

app.listen(process.env.PORT || 3000, function() {
   if (process.env.PORT) {
      console.log("App running on provided port.");
   } else {
      console.log("App running on port 3000.");
   }
});