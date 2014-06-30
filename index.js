
var BodyParser = require("body-parser");
var Express = require("express");
var Files = require("fs");
var Monk = require("monk");

var debug = require("debug")("mc");

var db = Monk("localhost/test");
db.on("error", function ( error ) {
  debug(error);
});
db.once("open", function () {
  debug("Successfully opened the database connection.");
});

var app = Express();
app.enable("trust proxy");
app.use(Express.static("./server/public"));
app.use(BodyParser());
app.db = db;

var routes = Files.readdirSync("./server/routes/");
for ( var i in routes ) {
  require("./server/routes/" + routes[i])(app);
}

var server = app.listen(process.env.PORT || 1337, function () {
  debug("The Monstercat is alive.");
});