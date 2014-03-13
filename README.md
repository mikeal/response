# Response

The basic idea is to build request for http responses.

The whole package is still beta.

# Usage

## Files

```javascript
var server = http.createServer(function (req, res) {
  if (req.url === '/test.js') return f('test-files.js').pipe(response()).pipe(res)
})
```

When pipeing files to `response` it will lookup the mime type and set the propert content-type header for whatever file extension you send it.

## html, json

```javascript
var server = http.createServer(function (req, res) {
  if (req.url === '/') return response.html('<html>Hello World</html>').pipe(res)
  if (req.url === '/sitemap.html') return fs.createReadStream('sitemap').pipe(response.html()).pipe(res)
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
