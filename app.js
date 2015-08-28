var fs = require('fs');
var robot = require("robotjs");
var parse = require('csv-parse');
var _ = require("underscore")
require('should');

var screen = robot.getScreenSize()

var pos = {
  dock_icon: {x: 915, y: 1034 };
  url: {x: 400, y: 77}
  browse: {t: 100, r: 1600, b: 970, l: 285};
}


var pos = robot.getMousePos();
console.log(pos);

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

  robot.mouseClick('left');

  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');
  robot.keyTap('delete');

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


  while ( Date.now() - started < seconds*1000 ) {
    var x = Math.floor(Math.random() * dimensions.right-dimensions.left) + dimensions.left;
    var y = Math.floor(Math.random() * dimensions.bottom-dimensions.top) + dimensions.top;
    move_mouse(x, y);

    if(!quiet) {
      if(Math.random() < .1) {
        robot.keyTap('pagedown');
      }

      if(Math.random() < .1) {
        robot.keyTap('pageup');
      }

      if(Math.random() < 0.3) {
        //var mouse = robot.getMousePos();
        //var hex = robot.getPixelColor(mouse.x, mouse.y);
        //console.log("#" + hex + " at x:" + mouse.x + " y:" + mouse.y);
        //if(hex == '0000ee') {
        robot.mouseClick();

      }
    }
  }

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

      goto_url(site.url);
      browse(site.duration*1.5, false);
      counter++;

    } else {
      //-- Private
      var object_sites = _.filter(sites, {kind:0})
      var site = object_sites[Math.floor(Math.random() * object_sites.length)];

      open_incognito(site.url);
      browse(site.duration*2.5, false);
      quit_chrome();
      counter = 0;

    }
  }

}
