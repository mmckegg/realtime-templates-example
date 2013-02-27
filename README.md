Realtime Templates - Example Site
===

An example of using all of the realtime-templates modules together in a single site.

## Usage

Run `npm start` and navigate to http://localhost:9999

## Featured Packages

### [realtime-templates](http://github.com/mmckegg/realtime-templates)

Render views on the server (using standard HTML markup) that the browser can update in realtime when the original data changes.

### [json-context](http://github.com/mmckegg/json-context)

Allows a server to create a JSON Context - single object that supports querying and contains all data required to render a view/page. When sent to the client it also provides an event stream for syncing with server and data-binding.

### [level-json-context](http://github.com/mmckegg/level-json-context)

Creates instances of **jsonContext** from a leveldb database using [levelup](https://github.com/rvagg/node-levelup). [Contexts](https://github.com/mmckegg/json-context) are automatically generated from matchers, and provides ability to watch matchers for realtime notifications.