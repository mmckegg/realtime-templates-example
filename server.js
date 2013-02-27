
var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/static');
var shoe = require('shoe')
var fs = require('fs')
var path = require('path')

var split = require('split')

var browserify = require('browserify')
var bundlePath = path.join(__dirname, 'static', 'bundle.js')

var realtimeTemplates = require('realtime-templates')
var safeStringify = require('json-context').safeStringify

var contextDB = require('./database')
var renderer = realtimeTemplates(__dirname + '/views', {
  includeBindingMetadata: true,
  masterName: 'layout'
})

contextDB.applyChange({
  id: 1,
  title: "Testing 123",
  body: "Testing 123 for farve sax",
  type: 'page'
})

contextDB.applyChange({
  id: 2,
  name: "Matt McKegg",
  body: "I am a comment",
  type: 'comment',
  parent_id: 1
})

contextDB.applyChange({
  id: 3,
  name: "Clive McKegg",
  body: "I am another comment",
  type: 'comment',
  parent_id: 1
})

contextDB.applyChange({
  id: 4,
  title: "Testing 456",
  body: "Another page",
  type: 'page'
})

contextDB.applyChange({
  id: 5,
  name: "Book Clooker",
  body: "Some cool info",
  type: 'comment',
  parent_id: 4
})

var userDatasources = {}

var router = new require('routes').Router();
router.addRoute("/objects/:id", function(req, res, params, splats){
  contextDB.generate({
    params: {current_object_id: parseInt(params.id, 10), token: 'some-unique-random-string'}, 
    matcherRefs: ['current_object', 'items_for_current_object']
  }, function(err, datasource){
    userDatasources[datasource.data.token] = datasource
    renderer.render('object', datasource, function(err, html){
      datasource
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end(html)
    })
  })
});

browserify('./client.js').bundle(function(err, src){
  fs.writeFileSync(bundlePath, src)
})

var server = http.createServer(function(req, res){
  var route = router.match(req.url);
  if (route){
    route.fn.apply(server, [req, res, route.params, route.splats])
  } else {
    ecstatic(req, res)
  }
})
server.listen(9999);

console.log("open http://localhost:9999/objects/1")

shoe(function (stream) {
  var datasource = null

  stream.once('data', function(data){
    var token = data.toString().trim()
    datasource = userDatasources[token]
    console.log('LOGGING IN:', token)
    if (datasource){
      stream.pipe(split()).on('data', function(data){
        console.log('received data', data)
        datasource.pushChange(JSON.parse(data), {source: 'user', onDeny: function(){
          console.log('denied change')
        }})
      })
      datasource.on('change', function(object, changeInfo){
        if (changeInfo.source === 'database'){
          stream.write(safeStringify(object) + '\n')
        }
      })
    } else {
      stream.close()
    }
  })

  stream.on('end', function () {
    if (datasource){
      datasource.destroy()
      userDatasources[datasource.data.token] = null
    }
  });

}).install(server, '/contexts')