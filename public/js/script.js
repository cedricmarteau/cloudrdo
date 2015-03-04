// var socket = io.connect('https://cloudrdo.herokuapp.com/');
var socket = io.connect('http://localhost');
var client_id = "45543d60298a07d51ca66c31835dfa26",
    api = "https://api.soundcloud.com";

var currentSound = {};
var currentSoundPosition = {percentPosition:0,positionMS:0};
var alreadyVoted = [];
var noCurrentSound = true;

init();
addPiste();
listener();

SC.initialize({
  client_id: client_id
});

function init(){
  socket.on("currentTrack",function(trackFromNode){
    console.log("currentTrack",trackFromNode)
    if (trackFromNode != null){
      streamFromSoundCloud(trackFromNode);
      $("footer").addClass('show');
    }else{
      $("#clickToAdd").fadeIn();
    }
  });
  socket.on("listTrack",function(array){
    console.log("listTrack",array)
    if (array.length > 1){
      for (var i = 1; i < array.length; i++) {
        var self = array[i];
        console.log(self)
        SC.get(api+"/tracks/"+self.trackID, function(track){
          var sound = {
            trackID : track.id,
            trackArtist : track.user.username,
            trackTitle : track.title,
            trackDuration : track.duration,
            trackVotes : self.trackVotes
          };
          addBubble(sound);
        });
      };  
    }else{
      $("#clickToAdd").fadeIn();
    }
  });
};

function addPiste(){
  $("#main").on("click",function(){
    $("#overlay").fadeIn();
  });
  $("#overlay-main").on("click",function(e){
    e.stopPropagation();
  });
  $("#overlay").on("click",function(){
    $("#overlay").fadeOut();
  });
  $("#overlay-submit").on("click",function(){
    $.ajax({
      url: 'https://api.soundcloud.com/tracks.json?client_id='+client_id+'&q='+$("#overlay-input").val()+'&limit=20'
    })
    .done(function(data) {
      console.log("success",data);
      $.each(data,function(){
        $("#search-result").append("<li><span class='result-artist'>"+this.user.username+"</span><span class='result-title'>"+this.title+"</span><div class='add_track' data-trackid="+this.id+" data-tracktitle="+this.title+" data-trackartist="+this.user.username+" data-trackduration="+this.duration+"><em></em><em></em></div></li>");
      });
      $(".add_track").on("click",function(){
        var trackClicked = {
          trackID : $(this).data("trackid"),
          trackArtist : $(this).data("trackartist"),
          trackTitle : $(this).data("tracktitle"),
          trackDuration : $(this).data("trackduration"),
          trackVotes : 1
        };
        $("#overlay").fadeOut();
        addTrackYo(trackClicked);
        alreadyVoted.push(trackClicked.trackID);
      });
    })
    .fail(function() {
      console.log("error",data);
    })
  });
};

function returnFalseBubble(){
  $(".bubble").on("click",function(e){
    e.stopPropagation();
  });
}

function addBubble(track){
  var _this = track;
  $("#main").append("<div class='bubble' data-trackID="+_this.trackID+" data-trackTitle="+_this.trackTitle+" data-trackArtist="+_this.trackArtist+" data-trackDuration="+_this.trackDuration+"><div class='bubble-container'><div class='bubble-artist'>"+_this.trackArtist+"</div><div class='bubble-title'>"+_this.trackTitle+"</div><div class='bubble-vote'>"+_this.trackVotes+"</div><div class='bubble-vote-action'><em></em><em></em></div></div></div>");
  TweenMax.to($(".bubble"),0.5,{
    scale:1,
    ease:Quad.EaseIn
  });
  returnFalseBubble();
  clickBubble();
  $("#search-result").html("");
  $("#overlay-input").val("");
}

function clickBubble(){
  $(".bubble-vote-action").off().on("click",function(e){
    var $container = $(this).parent().parent();
    var test = $.inArray($container.data("trackid"),alreadyVoted);
    if (test == -1){
      alreadyVoted.push($container.data("trackid"));
      // var countVote = $container.find(".bubble-vote").html();
      // countVote++;
      // $container.find(".bubble-vote").html(countVote);
      var trackUpdated = {
        trackID : $container.data("trackid"),
        trackArtist : $container.data("trackartist"),
        trackTitle : $container.data("tracktitle"),
        trackDuration : $container.data("trackduration")
      };
      voteTrackYo(trackUpdated);
    }else{
      alert("You've already voted!");
    }
  });
}

function handler(){
  $("#play").on("click",function(){
    if ($("#player").is(".playing")){
      triggerPause();
    }else{
      triggerPlay();
    }
  });
}

function triggerPlay(){
  $("#player").addClass('playing');
  currentSound.sound.setPosition(currentSoundPosition.positionMS);
  // currentSound.sound._onload(function(){
    console.log(currentSoundPosition.positionMS)
    currentSound.sound.play();
  // })
}

function triggerPause(){
  $("#player").removeClass('playing');
  currentSound.sound.pause();
}

function addTrackYo(sound){
  console.log("addTrackYo",sound)
  socket.emit("addTrack",sound);
}

function voteTrackYo(sound){
  console.log("voteTrackYo",sound)
  socket.emit("vote",sound);
}

function listener(){
  socket.on('updateAdd',function(soundID){
    console.log("updateAdd_FROM_SERVER",soundID)
    getFromSoundCloud(soundID);
  });
  socket.on('updateTracks',function(soundData){
    console.log("updateTracks_FROM_SERVER",soundData)
    $("div[data-trackid="+soundData.id+"]").find(".bubble-vote").html(soundData.trackVotes);
  });
  socket.on('currentTiming',function(soundPos){
    // console.log(soundPos)
    currentSoundPosition = soundPos;
    $("#waveform_progress").css({
      width:100-currentSoundPosition.percentPosition+"%"
    });
  });
  socket.on('nextSound',function(nextSoundID){
    console.log("nextSound",nextSoundID)
    if (nextSoundID != "noID"){
      streamFromSoundCloud(nextSoundID);
      TweenMax.to($("div[data-trackid="+nextSoundID+"]"),0.5,{
        scale:0,
        ease:Quad.EaseIn,
        onComplete:function(){
          $("div[data-trackid="+nextSoundID+"]").remove();
          if ($(".bubble").length == 0){
              $("#clickToAdd").fadeIn();
          }
        }
      });
    }else{
      $("#waveform").find("canvas").fadeOut();
      $("#player-title").html("");
      $("#player-artist").html("");
      $("#player").removeClass('playing');
      $("#player").addClass('noSound');
      $("footer").removeClass('show');
    }
  });
};

function streamFromSoundCloud(soundID){
  var myStreamOptions = {
    onload : function() {
      triggerPlay();
    }
  };
  SC.get(api+"/tracks/"+soundID, function(_track){
    console.log(_track)
    if (currentSound.track != null){
      triggerPause();
    }
    currentSound = {
      track : _track,
      trackID : _track.id,
      title : _track.title,
      artist : _track.user.username,
      duration : _track.duration,
      url : "/tracks/"+soundID
    };
    $("#player-title").html(currentSound.title);
    $("#player-artist").html(currentSound.artist);
    noCurrentSound = false;
    SC.stream(api+currentSound.url,myStreamOptions, function(sound){
      sound.load();
      $("footer").addClass('show');
      $("#player").removeClass('noSound');
      currentSound.sound = sound;
      handler();
      currentSound.waveform = new Waveform({
        container: document.getElementById("waveform"),
        innerColor: "#333"
      });
      currentSound.waveform.dataFromSoundCloudTrack(currentSound.track);
    });
  });
};

function getFromSoundCloud(soundID){
  SC.get(api+"/tracks/"+soundID, function(sound){
    // console.log(sound)
    var _this = {
      track : sound,
      trackID : sound.id,
      title : sound.title,
      artist : sound.user.username,
      duration : sound.duration,
      url : "/tracks/"+soundID
    };
    console.log("sound",_this,_this.trackID)
    if (noCurrentSound){
      streamFromSoundCloud(_this.trackID);
      $("#clickToAdd").fadeIn();
    }else{
      $("#clickToAdd").fadeOut();
      $("#main").append("<div class='bubble' data-trackID="+_this.trackID+" data-trackTitle="+_this.title+" data-trackArtist="+_this.artist+" data-trackDuration="+_this.duration+"><div class='bubble-container'><div class='bubble-artist'>"+_this.artist+"</div><div class='bubble-title'>"+_this.title+"</div><div class='bubble-vote'>1</div><div class='bubble-vote-action'><em></em><em></em></div></div></div>");
      TweenMax.to($(".bubble"),0.5,{
        scale:1,
        ease:Quad.EaseIn
      });
      returnFalseBubble();
      clickBubble();
    }
  });
};

function bubblePosition(){

};