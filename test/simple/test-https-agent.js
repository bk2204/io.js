// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

if (!process.versions.openssl) {
  console.error('Skipping because node compiled without OpenSSL.');
  process.exit(0);
}

var common = require('../common');
var assert = require('assert');
var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
  cert: fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem')
};


var server = https.Server(options, function(req, res) {
  res.writeHead(200);
  res.end('hello world\n');
});


var responses = 0;
var N = 10;
var M = 10;

server.listen(common.PORT, function() {
  for (var i = 0; i < N; i++) {
    setTimeout(function() {
      for (var j = 0; j < M; j++) {
        https.get({
          path: '/',
          port: common.PORT,
          rejectUnauthorized: false
        }, function(res) {
          res.resume();
          console.log(res.statusCode);
          if (++responses == N * M) server.close();
        }).on('error', function(e) {
          console.log(e.message);
          process.exit(1);
        });
      }
    }, i);
  }
});


process.on('exit', function() {
  assert.equal(N * M, responses);
});
