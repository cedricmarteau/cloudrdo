var express = require('express');
var http = require('http');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 5000;
var io = require('socket.io').listen(server);

//Array of music ids and votes and duration
var tracks = [];
var currentTrack; //ID

app.use(express.bodyParser());

app.get('/', function(req, res){
  res.sendfile('public/index.html');
});

app.get(/^(.+)$/, function(req, res) {
  res.sendfile('public/' + req.params[0]);
});

io.sockets.on('connection', function(socket){
  console.log('a user connected');
  socket.emit("currentTrack", currentTrack);
});

io.sockets.on('addTrack', function(data){
  tracks.push([data[0], 1, data[1]]);
  io.sockets.emit("updateTracks", tracks);
  if (currentTrack === null) //C'est la première chanson ajoutée
  {
    currentTrack = data[0];
    setTimeout(chooseNewTrack() , data[1]);
  }
});

io.sockets.on('vote', function(id){
  for (var i = 0; i < tracks.length; i++)
    if (tracks[i][0] == id)
      tracks[i][1] = tracks[i][1] + 1;
    io.sockets.emit("updateTracks", tracks);
});

server.listen(port, function(){
  console.log('listening on *:'+port);
});

function chooseNewTrack()
{
  var max = 0;
  var id = 0;
  var time = 0;
  for (var i = 0; i < tracks.length; i++)
  {
    if (tracks[i][1] > max)
    {
      max = tracks[i][1];
      id = tracks[i][0];
      time = tracks[i][2];
    }
  }
  currentTrack = id;
  io.sockets.emit("updateCurrent", currentTrack);
  setTimeout(chooseNewTrack(), time);
}