var stream = require('stream')
  , mime = require('mime')
  , util = require('util')
  , bl = require('bl')
  ;

function mutations (src, dest) {
  if (src.headers && dest.setHeader) {
    for (var i in src.headers) dest.setHeader(i, src.headers[i])
  }
  if (src.path && (!src.headers || !src.headers['content-type']) && dest.setHeader) {
    console.log(mime.lookup(src.path))
    dest.setHeader('content-type', mime.lookup(src.path))
  }
  if (src.statusCode) dest.statusCode = src.statusCode
}

function Response (view) {
  var self = this
  self.view = view
  self.buffering = bl()
  self.headers = {}
  self.dests = []
  stream.Transform.call(self)
  self.on('pipe', function (src) {
    mutations(src, self)
    src.on('error', function (e) {
      // TODO: Handle 404 errors
      self.emit('error', e)
    })
  })
  self.on('error', self.error.bind(self))
  if (view) {
    if (typeof view === 'string' || Buffer.isBuffer(view)) {
      process.nextTick(function () {
        self.end(view)
      })
    }
  }
}
util.inherits(Response, stream.Transform)

Response.prototype._transform = function (chunk, encoding, cb) {
  if (this._pipe) {
    this._pipe()
    this._pipe = null
  }
  if (typeof this.view === 'function') this.buffering.append(chunk)
  else this.push(chunk)
  cb(null)
}
Response.prototype.pipe = function () {
  this.dests.push(arguments[0])
  // if (!arguments[1]) arguments[1] = {}
  // arguments[1].end = false
  stream.Transform.prototype.pipe.apply(this, arguments)
}
Response.prototype._pipe = function () {
  var self = this
  this.dests.forEach(function (dest) {
    mutations(self, dest)
  })
}

Response.prototype.setHeader = function (key, value) {
  this.headers[key] = value
}
Response.prototype.error = function (e, status) {
  var self = this
  self.statusCode = status || 500
  if (self._erroring) return
  self._erroring = true
  if (typeof self.view === 'function') {
    self.view.call(self, e, null, function (e, data) {
      if (e) return self.end('Internal Server Error')
      self.end(data)
    })
  } else {
    // TODO: Default tracebacks on errors.
  }
}
Response.prototype.end = function (data) {
  var a = arguments
    , self = this
    ;
  if (data) this.write(data)
  if (typeof self.view === 'function') {
    self.view.call(self, null, self.buffering, function (e, data) {
      if (e) self.error(e)
      self.dests.forEach(function (dest) {
        dest.write(data)
      })
      stream.Transform.prototype.end.apply(self)
    })
  } else {
    stream.Transform.prototype.end.apply(self)
  }

}

function response (view) {
  return new Response(view)
}

Object.keys(mime.types).forEach(function (mimeName) {
  function _response (view) {
    var r = response(view)
    r.setHeader('content-type', mime.types[mimeName])
    return r
  }
  response[mimeName] = _response

  Response.prototype[mimeName] = function (view) {
    var self = this
    self.setHeader('content-type', mime.types[mimeName])
    process.nextTick(function () {
      self.end(view)
    })
    return this
  }
})
response.json = function (view) {
  var r = response(JSON.stringify(view))
  r.setHeader('content-type', mime.types['json'])
  return r
}

module.exports = response
