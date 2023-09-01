export default class WindowRPC {
  windowName
  channel
  funcRef = {}
  eventResolveRef = {}
  eventRejectRef = {}

  constructor(name) {
    this.windowName = name
    this.channel = new BroadcastChannel('__WindowRPC__')
    this.init()
  }

  init() {
    this.channel.addEventListener("message", (event) => {
      const { windowName, funcName, messageId, args, type, result: callResult } = JSON.parse(event.data);
      if (type === 'call' && windowName === this.windowName) {
        // 调函数，回消息
        try {
          const result = this.funcRef[funcName](...args)
          this.channel.postMessage(JSON.stringify({
            messageId,
            result,
            type: 'resolve'
          }));
        } catch (e) {
          this.channel.postMessage(JSON.stringify({
            messageId,
            result: String(e),
            type: 'reject'
          }));
        }
      }
      // 接收结果，触发 Promise
      if (type === 'resolve' && messageId in this.eventResolveRef) {
        this.eventResolveRef[messageId](callResult)
      }
      if (type === 'reject' && messageId in this.eventRejectRef) {
        this.eventRejectRef[messageId](callResult)
      }
    });
  }

  addFunc(funcName, callback) {
    this.funcRef[funcName] = callback
  }

  callFunc(windowName, funcName, args = []) {
    const messageId = `message_${+new Date() + Math.random()}`
    this.channel.postMessage(JSON.stringify({
      windowName,
      funcName,
      messageId,
      args,
      type: 'call'
    }));
    return new Promise((resolve, reject) => {
      this.eventResolveRef[messageId] = resolve
      this.eventRejectRef[messageId] = reject
    })
  }
}
