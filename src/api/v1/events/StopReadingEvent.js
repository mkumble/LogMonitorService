const EventEmitter = require('events');

//Events emitter that notifies when to stop reading the stream
class StopReadingEvent extends EventEmitter {}

module.exports = StopReadingEvent;