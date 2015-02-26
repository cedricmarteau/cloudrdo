var socket = io.connect('https://cloudrdo.herokuapp.com/');
var client_id = "45543d60298a07d51ca66c31835dfa26",
    api = "https://api.soundcloud.com";

var currentSound = null;

SC.initialize({
  client_id: client_id
});

SC.get(api+"/tracks/175762713", function(track){
  currentSound = {
    track : track,
    title : track.title,
    artist : track.user.username,
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