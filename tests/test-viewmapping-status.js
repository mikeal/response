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
    console.log(req.method + " "+ req.url);
    switch (req.url) {
        case '/test1a' :
            response.json({test:1}).pipe(res)
        break;
        case '/test1b' :
            var x = response();
            x.json({test:1}).pipe(res)
        break;
        case '/test2a' :
            response.json({test:1}).status(302).pipe(res)
        break;
        case '/test2b' :
            var x = response();
            x.json({test:1}).status(302).pipe(res)
        break;
        case '/test4a' : 
            response.json(23423).pipe(res)
        break;
        case '/test4b' : 
            var x = response();
            x.json(23423).pipe(res)
        break;
        case '/test6a' : 
            response.txt(23423).pipe(res)
        break;
        case '/test6b' : 
            var x = response();
            x.txt(23423).pipe(res);
        break;
        default:
        break;
    }
})

var q = new ql;
tape.test('testing new view mapping, convenience functions, and member functions',function(t) {
    t.plan(18)
    q.series([
    function(lib) {
        server.listen(8090,function(){
            lib.done()
        });
    },
    function(lib) {
        request('http://localhost:8090/test1a', {json:true}, function (e, resp, body) {
            t.equal(resp.headers['content-type'],'application/json')
            t.deepEqual(body,{test:1});
            lib.done();
        })
    },
    function(lib) {
        request('http://localhost:8090/test1b', {json:true}, function (e, resp, body) {
            t.equal(resp.headers['content-type'],'application/json')
            t.deepEqual(body,{test:1});
            lib.done();
        })
    },
    function(lib) {
        request('http://localhost:8090/test2a', {json:true}, function (e, resp, body) {
            t.equal(resp.statusCode, 302, 'status code should be 302')
            t.equal(resp.headers['content-type'],'application/json')
            t.deepEqual(body,{test:1});
            lib.done();
        })
    },
    function(lib) {
        request('http://localhost:8090/test2b', {json:true}, function (e, resp, body) {
            t.equal(resp.statusCode, 302, 'status code should be 302')
            t.equal(resp.headers['content-type'],'application/json')
            t.deepEqual(body,{test:1});
            lib.done();
        })
    },
    function(lib) {
        request('http://localhost:8090/test4a', {json:true}, function (e, resp, body) {
            t.equal(resp.headers['content-type'],'application/json')
            t.equal(body,23423);
            lib.done();
        })
    },
    function(lib) {
        request('http://localhost:8090/test4b', {json:true}, function (e, resp, body) {
            t.equal(resp.headers['content-type'],'application/json')
            t.equal(body,23423);
            lib.done();
        })
    },
    function(lib) {
        request('http://localhost:8090/test6a', {json:true}, function (e, resp, body) {
            t.equal(resp.headers['content-type'],'text/plain')
            t.equal(body,23423);
            lib.done();
        })
    },
    function(lib) {
        request('http://localhost:8090/test6b', {json:true}, function (e, resp, body) {
            t.equal(resp.headers['content-type'],'text/plain')
            t.equal(body,23423);
            lib.done();
        })
    },
    function(lib) {
        tape.test('cleanup',function(t) {
            server.on('close',function() {
                t.end()
                lib.done()
            });
            server.close()
        });
    }
    ]);
})
