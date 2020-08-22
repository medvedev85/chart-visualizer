var http = require('http');
var static = require('node-static');
var file = new static.Server('.');
var fs = require('fs');
var index = fs.readFileSync('/motif_locations.html.html');

http.createServer(function(req, res) {
  file.serve(req, res);
}).listen(8080);

console.log('Server running on port 8080');