class EventEmitter{
  constructor(){
    this.events = {};
  }
 // dictionary with our events
  on(event, listener) { // add event listeners
    if (!this.events[event]) { this.events[event] = { listeners: [] } }
    this.events[event].listeners.push(listener);
  }
  off(event) { // remove listeners
    delete this.events[event]
  }
  emit(name, ...payload) { // trigger events
    if( "undefined" === typeof this.events[name] ){  
      console.warn( "No event" + name );
      return;
    }
    for (const listener of this.events[name].listeners) {
      listener.apply(this, payload)
    }
  }
}

let eventEmitter = new EventEmitter();

export default eventEmitter;