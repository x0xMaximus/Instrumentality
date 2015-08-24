var robot = require("robotjs");

var screen = robot.getScreenSize()

var chrome_dock_pos = {x: screen.width/3, y: screen.height-20}
var chrome_url_pos = {x: 189, y: 77}

var debug = false;

var normal_sites = [
  {
    'url': 'http://ebay.com',
    'duration': 10,
  },
  {
    'url': 'http://amazon.com',
    'duration': 10,
  },
  {
    'url': 'http://reddit.com',
    'duration': 10,
  },
  {
    'url': 'http://imdb.com',
    'duration': 10,
  },
  {
    'url': 'http://nytimes.com',
    'duration': 10,
  },
  {
    'url': 'http://craigslist.org',
    'duration': 10,
  },
];

var object_sites = [
  {
    'url': 'http://foxnews.com',
    'duration': 10,
    'quiet': false,
  },
  {
    'url': 'http://playboy.com',
    'duration': 10,
    'quiet': true,
  }
];

function move_mouse(x, y){
  if(debug){
    robot.moveMouse(x, y);
  } else {
    robot.moveMouseSmooth(x, y);
  }
}

function open_chrome(){
  move_mouse(chrome_dock_pos.x, chrome_dock_pos.y);
  robot.mouseClick();
}

function goto_url(url){
  move_mouse(chrome_url_pos.x, chrome_url_pos.y);
  //robot.mouseClick('left', true);

  robot.typeString(url);
  robot.keyTap('enter');
}

function open_incognito(url){
  move_mouse(chrome_dock_pos.x, chrome_dock_pos.y);
  robot.mouseClick('right');
  move_mouse(chrome_dock_pos.x+50, chrome_dock_pos.y-175);
  robot.mouseClick();
  goto_url(url);
}

function quit_chrome() {
  move_mouse(80, 20);
  robot.mouseClick();

  move_mouse(80, 320);
  robot.mouseClick();
}

function browse(seconds, quiet) {
  seconds = typeof seconds !== 'undefined' ? seconds : 60;
  quiet = typeof quiet !== 'undefined' ? quiet : false;
  var started = Date.now();

  var dimensions = {
    top: 0+400,
    right: screen.width-400,
    bottom: screen.height-1000,
    left: 400
  };

  while ( Date.now() - started < seconds*1000 ) {
    var x = Math.floor(Math.random() * dimensions.right) + dimensions.left;
    var y = Math.floor(Math.random() * dimensions.bottom) + dimensions.top;
    move_mouse(x, y);

    if(!quiet) {
      if(Math.random() < 0.5) {
        var mouse = robot.getMousePos();
        var hex = robot.getPixelColor(mouse.x, mouse.y);
        console.log("#" + hex + " at x:" + mouse.x + " y:" + mouse.y);
        if(hex == '0000ee') {
          robot.mouseClick();
        }
      }
    }
  }

  robot.keyToggle('w', 'command');

}

var counter = 0;
while(true) {
  if(counter==0){
    open_chrome();
  }

  if(counter < 2) {
    //-- Public
    var site = normal_sites[Math.floor(Math.random() * normal_sites.length)];
    goto_url(site.url);
    browse(site.duration, false);
    counter++;

  } else {
    //-- Private
    var site = object_sites[Math.floor(Math.random() * object_sites.length)];
    open_incognito(site.url);
    browse(site.duration, false);
    quit_chrome();
    counter = 0;

  }
}
