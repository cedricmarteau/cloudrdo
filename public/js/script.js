var socket = io.connect('https://cloudrdo.herokuapp.com/');
var client_id = "45543d60298a07d51ca66c31835dfa26",
    api = "https://api.soundcloud.com";

var currentSound = null;

addPiste();
listener();

SC.initialize({
  client_id: client_id
});

SC.get(api+"/tracks/175762713", function(track){
  currentSound = {
    track : track,
    trackID : track.id,
    title : track.title,
    artist : track.user.username,
    duration : track.duration,
    url : "/tracks/175762713"
  };
  console.log(currentSound)
  $("#player-title").html(currentSound.title);
  $("#player-artist").html(currentSound.artist);
  SC.stream(api+currentSound.url, function(sound){
    currentSound.sound = sound;
    handler();
  });
});

function addPiste(){
  $(".bubble").on("click",function(e){
    e.stopPropagation();
  });
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
      url: 'http://api.soundcloud.com/tracks.json?client_id='+client_id+'&q='+$("#overlay-input").val()+'&limit=20'
    })
    .done(function(data) {
      console.log("success",data);
      $.each(data,function(){
        $("#search-result").append("<li><span class='result-artist'>"+this.user.username+"</span><span class='result-title'>"+this.title+"</span><div class='add_track' data-trackID="+this.id+" data-trackTitle="+this.title+" data-trackArtist="+this.user.username+" data-trackDuration="+this.duration+"><em></em><em></em></div></li>");
      });
      $(".add_track").on("click",function(){
        var trackClicked = {
          trackID : $(this).data("trackID"),
          trackArtist : $(this).data("trackArtist"),
          trackTitle : $(this).data("trackTitle"),
          trackDuration : $(this).data("trackDuration")
        };
        addTrackYo(trackClicked)
        console.log(trackClicked);
      });
    })
    .fail(function() {
      console.log("error",data);
    })
  });
};

function addBubble(track){

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
  socket.on('updateTracks',function(soundData){
    console.log(soundData)
  });
}