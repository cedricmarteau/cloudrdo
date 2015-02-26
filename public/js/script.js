var socket = io.connect('https://cloudrdo.herokuapp.com/');
var client_id = "45543d60298a07d51ca66c31835dfa26",
    api = "https://api.soundcloud.com";

var currentSound = null;

init();
addPiste();
listener();

SC.initialize({
  client_id: client_id
});

function init(){
  socket.on("currentTrack",function(trackFromNode){
    console.log(trackFromNode)
    SC.get(api+"/tracks/"+trackFromNode, function(track){
      currentSound = {
        track : track,
        trackID : track.id,
        title : track.title,
        artist : track.user.username,
        duration : track.duration,
        url : "/tracks/"+trackFromNode
      };
      $("#player-title").html(currentSound.title);
      $("#player-artist").html(currentSound.artist);
      SC.stream(api+currentSound.url, function(sound){
        currentSound.sound = sound;
        handler();
      });
    });
  });
};

function addPiste(){
  $("#main").on("click",function(){
    $("#overlay").show();
  });
  $("#overlay-main").on("click",function(e){
    e.stopPropagation();
  });
  $("#overlay").on("click",function(){
    $("#overlay").hide();
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
          trackDuration : $(this).data("trackduration")
        };
        addTrackYo(trackClicked)
        addBubble(trackClicked);
        console.log(trackClicked);
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
  $("#main").append("<div class='bubble' data-trackID="+_this.trackID+" data-trackTitle="+_this.trackTitle+" data-trackArtist="+_this.trackArtist+" data-trackDuration="+_this.trackDuration+"><div class='bubble-container'><div class='bubble-artist'>"+_this.trackArtist+"</div><div class='bubble-title'>"+_this.trackTitle+"</div><div class='bubble-vote'>1</div><div class='bubble-vote-action'><em></em><em></em></div></div></div>");
  TweenMax.to($(".bubble"),0.5,{
    scale:1,
    ease:Quad.EaseIn
  });
  $("#overlay").hide();
  returnFalseBubble();
  clickBubble();
  $("#search-result").html("");
  $("#overlay-input").val("");
}

function clickBubble(){
  $(".bubble-vote-action").off().on("click",function(e){
    var $container = $(this).parent().parent();
    var countVote = $container.find(".bubble-vote").html();
    $container.find(".bubble-vote").html(countVote++);
    var trackUpdated = {
      trackID : $container.data("trackid"),
      trackArtist : $container.data("trackartist"),
      trackTitle : $container.data("tracktitle"),
      trackDuration : $container.data("trackduration")
    };
    voteTrackYo(trackUpdated);
  });
}

function handler(){
  $("#play").on("click",function(){
    if ($("#player").is(".playing")){
      $("#player").removeClass('playing');
      currentSound.sound.pause();
    }else{
      $("#player").addClass('playing');
      currentSound.sound.play();
    }
  });
}

function addTrackYo(sound){
  socket.emit("addTrack",sound);
}

function voteTrackYo(sound){
  socket.emit("vote",sound);
}

function listener(){
  socket.on('updateAdd',function(soundID){
    getFromSoundCloud(soundID);
  });
  socket.on('updateTracks',function(soundData){
    $("li[data-trackid="+soundData.id+"]").find(".bubble-vote").html(soundData.vote);
  });
};

function getFromSoundCloud(soundID){
  SC.get(api+"/tracks/"+soundID, function(track){
    var _this = {
      track : track,
      trackID : track.id,
      title : track.title,
      artist : track.user.username,
      duration : track.duration,
      url : "/tracks/"+soundID
    };
    $("#main").append("<div class='bubble' data-trackID="+_this.trackID+" data-trackTitle="+_this.trackTitle+" data-trackArtist="+_this.trackArtist+" data-trackDuration="+_this.trackDuration+"><div class='bubble-container'><div class='bubble-artist'>"+_this.trackArtist+"</div><div class='bubble-title'>"+_this.trackTitle+"</div><div class='bubble-vote'>1</div><div class='bubble-vote-action'><em></em><em></em></div></div></div>");
    TweenMax.to($(".bubble"),0.5,{
      scale:1,
      ease:Quad.EaseIn
    });
  });
};