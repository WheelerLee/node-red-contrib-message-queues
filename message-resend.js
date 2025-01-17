module.exports = function (RED) {
  function MessageResendNode(config) {
    RED.nodes.createNode(this, config);
    this.time = config.time;
    this.reset = config.reset;
    var node = this;
    node.timers = [];
    node.left = 0;
    node.on('input', function (msg) {

      node.send(msg);

      // 清空之前的定时器
      if (node.reset) {
        if (node.timers.length > 0) {
          for (const timer of node.timers) {
            clearTimeout(timer);
          }
          node.timers = [];
        }
        node.left = 0;
      }

      if (node.time) {
        const times = node.time.split(',').map(x => parseInt(x, 10));
        node.left = times.length + node.left;
        node.status({ fill: "green", shape: "ring", text: `${node.left}` });
        for (const time of times) {
          const timer = setTimeout(() => {
            node.send(msg);
            node.left--;
            node.status({ fill: "green", shape: "ring", text: `${node.left}` });
          }, time * 1000);
          if (node.reset) {
            // 有取消未完成的定时器的情况下才需要保存历史记录
            node.timers.push(timer);
          }
        }
      }
    });
  }
  RED.nodes.registerType("Message Resend", MessageResendNode);
}