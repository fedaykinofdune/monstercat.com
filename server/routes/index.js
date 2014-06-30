
var Jade = require("jade");

function renderTemplate ( name, opts, done ) {
  Jade.renderFile("./server/templates/" + name + ".jade", opts, done);
}

function Index ( app ) {

  app.get("/", function ( req, res ) {
    renderTemplate("index", {}, function ( err, html ) {
      res.send(html);
    });
  });

};

module.exports = Index;