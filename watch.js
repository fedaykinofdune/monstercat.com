
var Spy = require("eye-spy");
var spawn = require('child_process').spawn;

var server;
var builder;
var killing;

function restart ( spy ) {
  if ( !server ) {
    console.log("starting server...");
    start(spy);
  }
  else if ( !killing ) {
    console.log("restarting server...");
    killing = true;
    server.kill();
  }
}

process.env.DEBUG = "mc*"

function start ( spy ) {
  server = spawn("node", ["index"], { 
    stdio: "inherit",
    env: process.env
  });
  server.on("close", function () {
    server = null;
    killing = false;
    start(spy);
  });
  spy.watch();
}

function build ( spy ) {
  if ( builder ) { 
    spy.watch();
    return;
  }
  console.log("building...");
  builder = spawn("npm", ["run", "build"], { stdio: "inherit" });
  builder.on("close", function ( code ) {
    builder = null;
    spy.watch();
  });
}

new Spy({
  directories: ["./server/routes"], 
  recursive: true,
  extensions: ["js"], 
  callback: restart
});

new Spy({
  directories: ["./client"],
  files: [
    "main.js", 
    "template.jade", 
    "style.less",
    "component.json"
  ],
  callback: build
});

new Spy({
  directories: ["./client/local-components"],
  recursive: true,
  extensions: ["js", "jade", "less", "json"],
  callback: build
});
