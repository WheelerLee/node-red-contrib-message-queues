module.exports = function (RED) {
  function MessageQueuesNode(config) {
    RED.nodes.createNode(this, config);
    this.prefix = config.prefix;
    var node = this;
    var context = this.context();
    node.on('input', function (msg) {
      // 消息的类型： add: 往队列添加一条信息；consume: 消费一条消息，表示该消息已经处理完成，自动下发下一条消息
      const type = msg.type;

      var currentQueue = context.get('current_queue');
      const queues = context.get('queues') || [];

      if (type === 'add') {
        // 添加新的消息
        if (typeof msg.index === 'number') {
          queues.splice(msg.index, 0, msg.payload);
        } else {
          queues.push(msg.payload);
        }
        if (!currentQueue) {
          // 当前没正在处理的消息，则下发queues的第一条消息
          currentQueue = queues.shift();
          context.set('current_queue', currentQueue);
          node.send({
            payload: currentQueue,
            queues: queues
          });
        }
        context.set('queues', queues);
      } else if (type === 'consume') {
        // 消费消息
        if (currentQueue) {
          // 当前有正在处理的消息
          if (currentQueue === msg.payload) {
            // 当前正在处理的消息就是要消费的消息
            if (queues.length > 0) {
              currentQueue = queues.shift();
              // 有下一条消息，下发下一条消息
              context.set('current_queue', currentQueue);
              node.send({
                payload: currentQueue,
                queues: queues
              });
            } else {
              // 没有下一条消息，停止当前正在处理的消息
              currentQueue = null;
              context.set('current_queue', null);
            }
          }
        }
      }

      node.status({ fill: "green", shape: "ring", text: `Messages：${queues.length}，Current：${currentQueue}` });
    });
  }
  RED.nodes.registerType("Message Queues", MessageQueuesNode);
}