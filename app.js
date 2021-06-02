const EventEmitter = require('events')

const eventStore = {
  emitter: new EventEmitter(),
  write: function(event) {
    console.log('-> write to event store and publish event')
    // store as json in folder somewhere by domain and aggregate
    this.emitter.emit(event.type, event)
  },
  read: () => {
    // read all events by domain and aggregateId 
  }
}

const app = {
  eventStore: eventStore,
  readModels: {
    users: {}
  },
  subscribers: {},
  subscribe: function(subscribeEventType, readModel, model){
    if(this.subscribers[subscribeEventType]) {
      this.subscribers[subscribeEventType].push(readModel)
    } else {
      this.subscribers[subscribeEventType] = [readModel]
    }
    this.eventStore.emitter.on(subscribeEventType, (event) => {
      this.subscribers[event.type].map((subscriber => {
        console.log('-> subscriber:', subscriber, ' handles event')
        const newState = subscriber(this.readModels[model], event)
        this.readModels[model][newState.id] = newState 
      }))
    })
  },
}

const userReadModel = (user, event) => {
  const eventData = event.data
  switch(event.type) {
    case 'USER_CREATED': {
      user = { 
        id: eventData.id,
        name: eventData.name
      }
      break
    }
  }
  return user
}

app.subscribe('USER_CREATED', userReadModel, 'users')


console.log('==== FIRST USER CREATED')
eventStore.write( { type: 'USER_CREATED', data: { id: 1, name: 'John' }})
console.log('users:', app.readModels.users)

console.log('==== SECOND USER CREATED')
eventStore.write( { type: 'USER_CREATED', data: { id: 2, name: 'Paul' }})
console.log('users:', app.readModels.users)