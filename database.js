var leveldb = require('levelup')
var levelContext = require('level-json-context')

var db = leveldb(__dirname + '/test-db', {
  encoding: 'json'
})

module.exports = levelContext(db, {
  matchers: [
    { ref: 'items_for_current_object',
      item: 'items[id={.id}]',
      collection: 'items',
      match: {
        parent_id: {$query: 'current_object_id'},
      },
      allow: {
        append: true,
        update: true,
        remove: true
      }
    }, {
      ref: 'current_object',
      item: 'current_object',
      match: {
        id: {$query: 'current_object_id'}
      }
    }
  ]
})