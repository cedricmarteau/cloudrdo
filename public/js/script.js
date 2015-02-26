var socket = io.connect('http://localhost');
var client_id = "45543d60298a07d51ca66c31835dfa26",
    api = "http://api.soundcloud.com";

var currentSound = null;

SC.initialize({
  client_id: client_id
});

SC.stream("/tracks/293", function(sound){
  currentSound = sound;
});

$("#play").on("click",function(){
  if ($("#player").is(".playing")){
    $("#player").removeClass('playing');
    currentSound.pause();
  }else{
    $("#player").addClass('playing');
    currentSound.play();
  }

});