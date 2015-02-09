var img = new Image();
var div = document.getElementById('foo');

img.onload = function() {
  div.innerHTML += '<img src="'+img.src+'" />'; 
};

img.src = 'http://i.imgur.com/fHEA74D.png';