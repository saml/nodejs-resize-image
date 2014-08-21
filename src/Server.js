var http = require('http');
var fs = require('fs');
var path = require('path');
var child = require('child_process');
var events = require('events');
var urlutil = require('url');

var util = require('./util');
var UrlParser = require('./UrlParser');
var settings = require('./settings');
var mimetypes = require('./mimetypes');

var Server = function(convertCmd, srcDir, destDir, cacheImages, maxOutputSize, staticDir) {
    var me = {};

    var urlParser = UrlParser(srcDir, destDir, maxOutputSize);


    //handles request.
    var Handler = function(request, response) {
        var me = {};

        var emitter = new events.EventEmitter();
        me.emitter = emitter;

        var serveFile = function(filePath, mimeType, callback) {
            if (!mimeType) {
                mimeType = mimetypes.fromPath(filePath);
            }

            var encoding = 'binary';

            fs.stat(filePath, function(err, stat) {
                if (err || !stat.isFile()) {
                    emitter.emit('error', me.do404, 'not found: ' + filePath);
                    return;
                }

                response.writeHead(200, {
                    'Content-Type': mimeType
                    , 'Content-Length': stat.size
                });
                var stream = fs.createReadStream(filePath, {
                    flags: 'r'
                    , encoding: encoding
                });
                stream.on('data', function(data) {
                    response.write(data, encoding);
                });
                stream.on('close', function() {
                    response.end();
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
                stream.on('error', function(err) {
                    emitter.emit('error', me.do500, 'error reading file: ' + filePath);
                });
            });
        };

        var resizeImage = function(src, out, convertArgs, callback) {
            var basePath = path.dirname(out);

            var doResize = function() {
                var args = [src].concat(convertArgs);
                args.push(out);
                console.log('executing: %s %s', convertCmd, args.join(' '));
                var p = child.spawn(convertCmd, args);
                p.on('exit', function(code) {
                    if (code === 0) {
                        if (typeof callback === 'function') {
                            callback(out);
                        }
                    } else {
                        emitter.emit('error', me.do500, 'convert %s exited with %s'.f(args.join(' '), code));
                    }
                });
            };

            util.mkdirP(basePath, 0755, function(err) {
                if (err) {
                    emitter.emit('error', me.do500, 'cannot create directory: ' + basePath);
                } else {
                    process.nextTick(doResize);
                }
            });

        };

        me.do404 = function(msg) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            var data = 'Not Found: ' + request.url;
            if (msg) {
                data = '%s\n%s'.f(data, msg);
            }
            response.end(data);
        };

        me.do500 = function(msg) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            var data = 'Internal Error: ' + request.url;
            if (msg) {
                data = '%s\n%s'.f(data, msg);
            }
            response.end(data);
        };

        me.do501 = function(msg) {
            response.writeHead(501, {
                'Content-Type': 'text/plain'
            });
            var data = 'Not Supported Method: %s %s'.f(request.method, request.url);
            if (msg) {
                data = '%s\n%s'.f(data, msg);
            }
            response.end(data);
        };


        //serves cached image at imagePath (and deletes possibly).
        var serveCachedImage = function(imagePath) {
            serveFile(imagePath, undefined, function() {
                if (!cacheImages) {
                    fs.unlink(imagePath, function(err) {
                        if (err) {
                            console.log('error while deleting: ' + imagePath);
                        }
                    });
                }
            });
        };

        var serveCachedImageOrGenerate = function(param) {
            fs.exists(param.out, function(exists) {
                if (exists && !settings.debug) {
                    serveCachedImage(param.out);
                } else {
                    resizeImage(param.src, param.out, param.args, function() {
                        serveCachedImage(param.out);
                    });
                }
            });
        };

        var serveImage = function(params) {
            if (typeof params.args === 'undefined') {
                //original
                serveFile(params.src, undefined);
            } else {
                serveCachedImageOrGenerate(params);
            }
        };
    
        var downloadAndTry = function(params) {
            var url = params.remoteUrl;
            var output = params.src;
            util.downloadAnd(url, output, function(err) {
                if (err) {
                    emitter.emit('error', me.do500, 'Failed to download: '+url);
                } else {
                    serveImage(params);
                }
            });
        };


        var staticPrefix = '/static/';
        var start = function() {
          if (request.url.startsWith(staticPrefix)) {
            var urlPath = urlutil.parse(request.url).pathname;
            var filePath = path.join(staticDir, urlPath.substring(staticPrefix.length));
            serveFile(filePath);
          } else {

            if (request.method !== 'GET') {
                emitter.emit('error', me.do501);
                return;
            }

            if (request.url === '/favicon.ico') {
                emitter.emit('error', me.do404);
                return;
            }

            var url = request.url;
            var parsed = urlParser.parse(request.url);
            if (!parsed) {
                emitter.emit('error', me.do404);
                return;
            }
            var src = parsed.src;
            var isRemoteSrc = !!parsed.remoteUrl;

            fs.exists(src, function(exists) {
                if (exists) {
                    serveImage(parsed);
                } else if (isRemoteSrc) {
                    downloadAndTry(parsed);
                } else {
                    emitter.emit('error', me.do500, 'Image does not exist and cannot be downloaded from remote: '+src);
                }
            });
          }
        };

        me.start = function() {
            process.nextTick(start);
        }


        return me;
    };




  function onEachRequest(req, resp) {
    var handler = Handler(req, resp);
    handler.emitter.on('error', onError);
    handler.start();
  }


    me.server = http.createServer(onEachRequest);
   
    me.server.on('close', function() {
        console.log('Server stopped');
    });

    me.start = function(host, port) {
        me.stop();
        me.server.listen(port, host, function() {
            console.log('Server started %s:%d', host, port);
        });
    };

    me.stop = function() {
        try {
            me.server.close();
        } catch (e) {
        }
    };

    return me;
};

function onError(f, msg) {
  if (typeof f === 'function') {
    if (typeof msg !== 'undefined') {
      console.log(msg);
    }
    f(msg);
  }
}

module.exports = Server;
