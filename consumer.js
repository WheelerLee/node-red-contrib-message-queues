const { bus } = require("./index");

module.exports = function (RED) {
  function ConsumerNode(config) {
    RED.nodes.createNode(this, config);
    this.prefix = config.prefix;
    var node = this;
    node.on('input', function (msg) {
      if (msg && msg.topic) {
        bus.emit('message-consume', msg);
      }
    });
  }
  RED.nodes.registerType("Consumer", ConsumerNode);
}