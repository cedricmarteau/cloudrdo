var express = require('express');
var http = require('http');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 5000;
var io = require('socket.io').listen(server);

//Array of music ids and votes and duration
var tracks = [];
var currentTrack; //ID
// var currentTrack = 175762713;

app.use(express.bodyParser());

app.get('/', function(req, res){
  res.sendfile('public/index.html');
});

app.get(/^(.+)$/, function(req, res) {
  res.sendfile('public/' + req.params[0]);
});

io.sockets.on('connection', function(socket){
  console.log('a user connected');
  socket.emit("listTrack", tracks);
  socket.emit("currentTrack", currentTrack);
  
  socket.on('addTrack', function(data){
    console.log("addTrack")
    tracks.push({trackID: data.trackID, trackVotes: 1, trackDuration: data.trackDuration});
    io.sockets.emit("updateAdd", data.trackID);
    if (currentTrack === null) //C'est la première chanson ajoutée
    {
      currentTrack = data.trackID;
      setTimeout(chooseNewTrack() , data.trackDuration);
    }
  });

  socket.on('vote', function(id){
    console.log("vote")
    var tmp;
    for (var i = 0; i < tracks.length; i++)
      if (tracks[i].trackID == id)
      {
        tracks[i].trackVotes = tracks[i].trackVotes + 1;
        tmp = {id: id, vote: tracks[i].trackVotes};
      }
      io.sockets.emit("updateTracks", tmp);
  });
});

server.listen(port, function(){
  console.log('listening on *:'+port);
});

function chooseNewTrack()
{
  var max = 0;
  var id = 0;
  var time = 0;
  var iTmp = 0;
  for (var i = 0; i < tracks.length; i++)
  {
    if (tracks[i].trackVotes > max)
    {
      max = tracks[i].trackVotes;
      id = tracks[i].trackID;
      time = tracks[i].trackDuration;
      iTmp = i;
    }
  }
  currentTrack = id;
  tracks.splice(iTmp, 1);
  io.sockets.emit("updateCurrent", currentTrack);
  setTimeout(chooseNewTrack(), time);
}