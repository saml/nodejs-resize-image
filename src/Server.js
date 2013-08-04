var http = require('http');
var fs = require('fs');
var sys = require('sys');
var path = require('path');
var child = require('child_process');
var events = require('events');

var util = require('./util');
var UrlParser = require('./UrlParser');

var Server = function(convertCmd, srcDir, destDir, cacheImages) {
    var me = {};

    var urlParser = UrlParser(srcDir, destDir);

    var getMimeType = function(name) {
        var ext = path.extname(name).toLowerCase();
        switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.tif':
        case '.tiff':
            return 'image/tiff';
        }
        return 'application/octet-stream';
    };

    //handles request.
    var Handler = function(request, response) {
        var me = {};

        var emitter = new events.EventEmitter();
        me.emitter = emitter;

        var serveFile = function(filePath, mimeType, callback) {
            if (!mimeType) {
                mimeType = getMimeType(filePath);
            }

            var encoding = 'binary';

            fs.stat(filePath, function(err, stat) {
                //var isFavicon = filePath.lastIndexOf('/favicon.ico') == filePath.length - 12;//'/favicon.ico'.length 
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
                sys.log('executing: %s %s'.f(convertCmd, args.join(' ')));
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
                    sys.log(err);
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
                            sys.log('error while deleting: ' + imagePath);
                        }
                    });
                }
            });
        };

        var serveCachedImageOrGenerate = function(param) {
            fs.exists(param.out, function(exists) {
                if (exists) {
                    serveCachedImage(param.out);
                } else {
                    resizeImage(param.src, param.out, param.args, function() {
                        serveCachedImage(param.out);
                    });
                }
            });
        };

        var start = function() {
            if (request.method !== 'GET') {
                emitter.emit('error', me.do501);
                return;
            }

            var thumbGenParams = urlParser.parse(request.url);
            if (thumbGenParams === null) {
                serveFile(urlParser.getImgPath(request.url), undefined);
            } else {
                serveCachedImageOrGenerate(thumbGenParams);
            }
        };

        me.start = function() {
            process.nextTick(start);
        }


        return me;
    };



    me.server = http.createServer(function(request, response) {
        var handler = Handler(request, response);
        handler.emitter.on('error', function(f, msg) {
            if (typeof f === 'function') {
                sys.log(msg);
                f();
            }
        });
        handler.start();
    });

    me.server.on('close', function() {
        sys.log('Server stopped');
    });

    me.start = function(host, port) {
        me.stop();
        me.server.listen(port, host, function() {
            sys.log('Server started %s:%s'.f(host, port));
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

module.exports = Server;
