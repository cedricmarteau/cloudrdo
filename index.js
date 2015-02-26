var express = require('express');
var http = require('http');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 5000;
var io = require('socket.io').listen(server);

app.use(express.bodyParser());

app.get('/', function(req, res){
  res.sendfile('public/index.html');
});

app.get(/^(.+)$/, function(req, res) {
  res.sendfile('public/' + req.params[0]);
});

io.sockets.on('connection', function(socket){
  console.log('a user connected');
  socket.on('HandPosition', function(data){
    console.log('HandPosition: ' + JSON.stringify(data));
    io.sockets.emit('HandPosition', JSON.stringify(data));
  });
  socket.on('Circle', function(data){
    console.log('Circle: ' + JSON.stringify(data));
    io.sockets.emit('Circle', JSON.stringify(data));
  });
});

server.listen(port, function(){
  console.log('listening on *:'+port);
});