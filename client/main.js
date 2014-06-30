
var JadeRenderer = require("jade-renderer");

function Client () {
  this.el = document.createElement("div");
  this.renderer = new JadeRenderer({ 
    el: this.el,
    template: require("./template") 
  });
}

Client.prototype.render = function () {
  this.renderer.render();
};

module.exports = Client;
