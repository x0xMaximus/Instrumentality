var fs = require('fs');
var robot = require("robotjs");
var parse = require('csv-parse');
var _ = require("underscore")
require('should');

var screen = robot.getScreenSize()

var chrome_dock_pos = {x: screen.width/3, y: screen.height-20}
var chrome_url_pos = {x: 189, y: 77}

var debug = false;

var parser = parse({columns: true, auto_parse: true}, function(err, data){
  _.each(data, function(obj) {
    obj['quiet'] =  obj['quiet']==='true'
  });
  main(data);
});
fs.createReadStream(__dirname+'/data/data.csv').pipe(parser);

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

function scroll(direction) {
  direction = typeof direction !== 'undefined' ? seconds : 60;
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

function main(sites) {

  var counter = 0;
  while(true) {
    if(counter==0){
      open_chrome();
    }

    if(counter < 2) {
      //-- Public
      var basic_sites = _.filter(sites, {kind:1})
      var site = basic_sites[Math.floor(Math.random() * basic_sites.length)];
      console.log(site);

      goto_url(site.url);
      browse(site.duration, false);
      counter++;

    } else {
      //-- Private
      var object_sites = _.filter(sites, {kind:0})
      var site = object_sites[Math.floor(Math.random() * object_sites.length)];

      /*
      open_incognito(site.url);
      */
      browse(site.duration, false);
      quit_chrome();
      counter = 0;

    }
  }

}
