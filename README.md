# Response

The basic idea is to build [request](https://github.com/mikeal/request) for HTTP Responses.

This whole package is still beta.

## Files

```javascript
var server = http.createServer(function (req, res) {
  if (req.url === '/test.js') return fs.createReadStream('file.js').pipe(response()).pipe(res)
})
```

When pipeing files to `response` it will lookup the mime type and set the propert content-type header for whatever file extension you send it.

## html, json

```javascript
var server = http.createServer(function (req, res) {
  if (req.url === '/') return response.html('<html>Hello World</html>').pipe(res)
  if (req.url === '/sitemap.html') {
    var f = fs.createReadStream('sitemap')
    return r.pipe(response.html()).pipe(res)
  }
  if (req.url === '/something.json') return response.json({test:1}).pipe(res)
})
```

## gzip and deflate compression

The `compress` and `gzip` keys in an options object are used for compression.

```javascript
var server = http.createServer(function (req, res) {
  var f = fs.createReadStream('file.js')
  if (req.url === '/file.js') return f.pipe(response({compress:req})).pipe(res)
})
```

You can pass an HTTP Request object and the best compression, if any, will be chosen for you. Alternatively you can pass `"gzip"` or `"deflate"` to forcce compression of the response stream.

This compression option is compatible with every other feature in `response` and will work whether you do file streaming, html, json, or even using views. When passing a view, string or buffer to `response` the second argument is used as the options object.

```javascript
var server = http.createServer(function (req, res) {
  if (req.url === '/') return response.html('<html>Nope</html>', {compress:req}).pipe(res)
})
```

## views (very experimental)

```javascript
function view (e, data, cb) {
  if (e) return cb(e)
  cb(null, '<html>' + data + '</html>')
}

var server = http.createServer(function (req, res) {
  var r = response(view)
  r.pipe(res)
  if (req.url === '/test1') return r.html('test')
})
```

This is how you would easily support something like a template system. TODO: example.

### Credits

Mad props to @marak who handed over the "response" package in npm that he registered way back in the day.
