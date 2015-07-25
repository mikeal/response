var response = require('../')
  , http = require('http')
  , request = require('request')
  , fs = require('fs')
  , path = require('path')
  , ql = require('queuelib');
  ;
var tape = require('tape');

function f (name) {
  return fs.createReadStream(path.join(__dirname, name))
}
function fr (name) {
  return fs.readFileSync(path.join(__dirname, name)).toString()
}

var server = http.createServer(function (req, res) {
    if (req.url == '/') 
        response.json({test:1}).location('/foo').status(302).pipe(res)
    else if (req.url = '/foo')
        response.txt('bar').pipe(res)
})

var q = new ql;
tape.test('testing new view mapping, convenience functions, and member functions',function(t) {
    t.plan(2)
    q.series([
    function(lib) {
        server.listen(8082,function(){
            lib.done()
        });
    },
    function(lib) {
        request('http://localhost:8082/', {json:true}, function (e, resp, body) {
            t.equal(resp.headers['content-type'],'text/plain')
            t.equal(body,'bar')
            lib.done();
        })
    },
    function(lib) {
        tape.test('cleanup',function(t) {
            t.end()
            server.close()
            lib.done()
        });
    }
    ]);
})
