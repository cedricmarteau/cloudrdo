// PISTE 6 SECONDES
// https://soundcloud.com/pro-sound-effects/musical-element-02
var express = require('express');
var http = require('http');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 5000;
var io = require('socket.io').listen(server, { log: false });

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
  socket.emit("listTrack", tracks);
  socket.emit("currentTrack", currentTrack);

  socket.on('addTrack', function(data){
    console.log("addTrack")
    tracks.push({trackID: data.trackID, trackVotes: 1, trackDuration: data.trackDuration});
    io.sockets.emit("updateAdd", data.trackID);
    if (currentTrack == null){ //C'est la première chanson ajoutée
      console.log("currentTrack",data.trackID)
      console.log(data.trackDuration);
      playingTimer(data.trackDuration)
      currentTrack = data.trackID;
    }
  });

  socket.on('vote', function(sound){
    console.log("vote",tracks,sound)
    var tmp;
    for (var i = 0; i < tracks.length; i++){
      if (tracks[i].trackID == sound.trackID){
        tracks[i].trackVotes = tracks[i].trackVotes + 1;
        tmp = {id: sound.trackID, trackVotes: tracks[i].trackVotes};
        console.log("tmp",tmp)
        io.sockets.emit("updateTracks", tmp);
      }
    }
  });
});

var timerInterval;
var initialTiming;
var currentTiming = 0;

function playingTimer(timing){
 var tempDuration = 0;
 initialTiming = timing;
 timerInterval = setInterval(function(){
   tempDuration+=1000;
   if (currentTiming >= 0){
     currentTiming = timing - tempDuration;
     console.log("currentTiming",currentTiming+" "+(currentTiming*100)/initialTiming);
     io.sockets.emit("currentTiming", {percentPosition:(currentTiming*100)/initialTiming,positionMS:tempDuration});
   }else{
     clearInterval(timerInterval);
     nextSound();
   }
 },1000);
}

function nextSound(){
  var max = 0;
  var id = 0;
  var time = 0;
  var iTmp = 0;
  console.log("TRACKS : ");
  for (var i = 0; i < tracks.length; i++)
  {
    console.log(tracks[i].trackID);
    if (tracks[i].trackVotes > max){
      max = tracks[i].trackVotes;
      id = tracks[i].trackID;
      time = tracks[i].trackDuration;
      iTmp = i;
   }
 }
 tracks.splice(iTmp, 1);
 if (tracks.length > 0){
   currentTrack = id;
   io.sockets.emit("nextSound", id);
   playingTimer(time);
 }
}

server.listen(port, function(){
  console.log('listening on *:'+port);
});