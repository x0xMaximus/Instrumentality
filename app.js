var fs = require('fs');
var robot = require("robotjs");
var parse = require('csv-parse');
var _ = require("underscore")
require('should');

var screen = robot.getScreenSize()

var debug = true;

//-- For mapping new screen resolutions
while(false) { var pos = robot.getMousePos(); console.log(pos); }

if(debug){
  var pos = {
    dock_icon: {x: 445, y: 886 },
    incognito: {x: 510, y: 698},
    url: {x: 400, y: 77},

    menu_name: {x: 70, y: 10},
    menu_close: {x: 150, y: 315},

    browse: {
      top_left: {x: 150, y: 100},
      bottom_right: {x: 1050, y: 800},
    }
  }
} else {
  var pos = {
    dock_icon: {x: 445, y: 886 },
    incognito: {x: 510, y: 698},
    url: {x: 400, y: 77},

    menu_name: {x: 70, y: 10},
    menu_close: {x: 150, y: 315},

    browse: {
      top_left: {x: 150, y: 100},
      bottom_right: {x: 1050, y: 800},
    }
  }
}

//-- Load the CSV Data and start the loop
var parser = parse({columns: true, auto_parse: true}, function(err, data){
  _.each(data, function(obj) {
    obj['quiet'] =  obj['quiet']==='true'
  });
  main(data);
});
fs.createReadStream(__dirname+'/data/data.csv').pipe(parser);

//-- Abstract way to jump the mouse to test faster
function move_mouse(x, y){
  robot.moveMouseSmooth(x, y);
}

//
// Repeatable Actions
//
function open_chrome(){
  move_mouse(pos.dock_icon.x, pos.dock_icon.y);
  robot.mouseClick();
  // (TODO) Sleep for a minute to let it application load
}

function goto_url(url, counter){
  move_mouse(pos.url.x, pos.url.y);

  if(counter == 0) {
    robot.keyTap('delete');
  }
  if(counter == 1) {
    robot.mouseClick('left');
    robot.keyTap('delete');
  }

  robot.typeString(url);
  robot.keyTap('enter');
}

function scroll(direction) {
  if(direction == 'up') {
    robot.keyTap('pageup');
  } else {
    robot.keyTap('pagedown');
  }
}

function open_incognito(url){
  move_mouse(pos.dock_icon.x, pos.dock_icon.y);
  robot.mouseClick('right');

  move_mouse(pos.incognito.x, pos.incognito.y);
  robot.mouseClick();
  goto_url(url);
}

function quit_chrome() {
  move_mouse(pos.menu_name.x, pos.menu_name.y);
  robot.mouseClick();

  move_mouse(pos.menu_close.x, pos.menu_close.y);
  robot.mouseClick();
}

function browse(seconds, quiet) {
  seconds = typeof seconds !== 'undefined' ? seconds : 60;
  quiet = typeof quiet !== 'undefined' ? quiet : false;
  var started = Date.now();

  while ( Date.now() - started < seconds*1000 ) {
    var x = Math.floor(Math.random() * (pos.browse.bottom_right.x-pos.browse.top_left.x)) + pos.browse.top_left.x;
    var y = Math.floor(Math.random() * (pos.browse.bottom_right.y-pos.browse.top_left.y)) + pos.browse.top_left.y;
    move_mouse(x, y);

    if(!quiet) {

      if(Math.random() < .25) {
        if(Math.random() < .25) {
          scroll('up');
        } else {
          scroll();
        }
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

      goto_url(site.url, counter);
      browse(site.duration*1.5, false);
      counter++;

    } else {
      //-- Private
      //var object_sites = _.filter(sites, {kind:0})
      var object_sites = _.filter(sites, {kind:1})
      var site = object_sites[Math.floor(Math.random() * object_sites.length)];

      open_incognito(site.url);
      browse(site.duration*2.5, false);
      quit_chrome();
      counter = 0;

    }
  }

}
