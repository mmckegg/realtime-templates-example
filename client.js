var shoe = require('shoe');
var stream = shoe('/contexts');
var domready = require('domready')
var split = require('split')

var realtimeTemplates = require('realtime-templates')
var jsonContext = require('json-context')

domready(function(){
  var bindingElement = document.getElementById('realtimeBindingInfo')
  var meta = JSON.parse(bindingElement.innerHTML)
  var datasource = jsonContext(meta.data, {
    matchers: meta.matchers,
    filters: {}
  })

  window.context = datasource

  var binder = realtimeTemplates.bind(meta.view, datasource, {
    formatters: {}, 
    behaviors: {}
  })

  stream.pipe(split()).on('data', function(line){
    // push the changed objects coming down the wire directly into the context
    console.log('RECIEVED DATA:', line)
    datasource.pushChange(JSON.parse(line), {source: 'server'})
  })
  stream.write(datasource.data.token + '\n')

  datasource.on('change', function(object, changeInfo){
    if (changeInfo.source === 'user'){
      stream.write(jsonContext.safeStringify(object) + '\n')
    }
  })

})