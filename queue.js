const { bus } = require("./index");

module.exports = function (RED) {
  function QueueNode(config) {
    RED.nodes.createNode(this, config);
    this.prefix = config.prefix;
    var node = this;
    var context = this.context();
    var timeout = null;

    function consume(msg) {
      var currentQueue = context.get('current_queue');
      const queues = context.get('queues') || [];
      // 消费消息
      if (currentQueue && currentQueue.topic === msg.topic) {
        // 当前正在处理的消息就是要消费的消息
        if (queues.length > 0) {
          currentQueue = queues.shift();
          // 有下一条消息，下发下一条消息
          context.set('current_queue', currentQueue);
          node.send(currentQueue);
        } else {
          // 没有下一条消息，停止当前正在处理的消息
          currentQueue = null;
          context.set('current_queue', null);
        }

        if (currentQueue && config.autoConsumeTime > 0) {
          timeout = setTimeout(() => {
            consume(currentQueue);
            timeout = null;
          }, config.autoConsumeTime * 1000);
        }
        
        node.status({ fill: "green", shape: "ring", text: `Messages：${queues.length}，Current：${currentQueue ? currentQueue.topic : 'null'}` });
      }
    }

    bus.on('message-consume', (msg) => {
      consume(msg);
    });

    node.on('input', function (msg) {
      var currentQueue = context.get('current_queue');
      const queues = context.get('queues') || [];

      // 添加新的消息
      if (typeof msg.index === 'number') {
        queues.splice(msg.index, 0, msg);
      } else {
        queues.push(msg);
      }
      if (!currentQueue) {
        // 当前没正在处理的消息，则下发queues的第一条消息
        currentQueue = queues.shift();
        context.set('current_queue', currentQueue);
        node.send(currentQueue);
      }
      context.set('queues', queues);

      if (currentQueue && config.autoConsumeTime > 0) {
        timeout = setTimeout(() => {
          consume(currentQueue);
          timeout = null;
        }, config.autoConsumeTime * 1000);
      }

      node.status({ fill: "green", shape: "ring", text: `Messages：${queues.length}，Current：${currentQueue.topic}` });
    });
  }
  RED.nodes.registerType("Queue", QueueNode);
}