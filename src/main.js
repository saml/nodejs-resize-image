var http = require('http');
var fs = require('fs');
var sys = require('sys');
var path = require('path');
var child = require('child_process');
var events = require('events');

var util = require('./util');
var tempfile = require('./tempfile');
var settings = require('./settings');

//GET /path/to/image.jpg/120x64.jpg
//will execute
//convert scrDir/path/to/image.jpg \
//    -size 120x64 destDir/tempFile.jpg
//and serve destDir/tempFile.jpg
var Server = function(convert, srcDir, destDir, cacheImages) {
    var me = {};


    var regexForThumb = /^\/(.+)\/(\d+)x(\d+)\+(\d+)\+(\d+)(\.\w+)$/;
    var regexForThumbWithoutCrop = /^\/(.+)\/(\d+)x(\d+)(\.\w+)$/;

    var getSourceImage = function(shortPath) {
        return path.join(srcDir, shortPath);
    };

    var parseUrlWithoutCrop = function(url) {
        var m = regexForThumbWithoutCrop.exec(url);
        if (!m) {
            return null;
        }

        var width = m[2] * 1;
        var height = m[3] * 1;
        var src = getSourceImage(m[1]);
        var out = path.join(destDir, url);
        return ({
            width: width,
            height: height,
            src: src,
            out: out
        });
    };

    var parseUrlWithCrop = function(url) {
        var m = regexForThumb.exec(url);
        if (!m) {
            return null;
        }

        var width = m[2] * 1;
        var height = m[3] * 1;
        var cropX = m[4] * 1;
        var cropY = m[5] * 1;
        var src = getSourceImage(m[1]);
        var out = path.join(destDir, url);
        return ({
            width: width,
            height: height,
            cropX: cropX,
            cropY: cropY,
            src: src,
            out: out
        });
    };

    var parseUrl = function(url) {
        var o = parseUrlWithCrop(url);
        if (o) {
            return o;
        }

        return parseUrlWithoutCrop(url);
    };

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
                sys.log('executing: %s %s'.f(convert, args.join(' ')));
                var p = child.spawn(convert, args);
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
            path.exists(param.out, function(exists) {
                if (exists) {
                    serveCachedImage(param.out);
                } else {
                    var size = '%sx%s'.f(param.width, param.height);
                    var args = ['-resize', size];
                    if (param.cropX && param.cropY) {
                        size = '%sx%s+%s+%s'.f(param.width, param.height, param.cropX, param.cropY);
                        args = ['-crop', size];
                        //args = ['-crop', size, '+repage'];
                    }

                    resizeImage(param.src, param.out, args, function() {
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

            var o = parseUrl(request.url);
            if (o && o.src && o.out && o.width && o.height) {
                //it is thumbnail url. resize it and serve.
                serveCachedImageOrGenerate(o);

            } else {
                //try to serve original without resizing.
                serveFile(getSourceImage(request.url), undefined);
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

var main = function() {
    var argv = process.argv;
    //if (argv.length < 3) {
    //    console.log("Usage: %s %s config.json".f(argv[0], argv[1]));
    //    process.exit(1);
    //}

    if (argv.length > 2) {
        console.log("Loading settings from " + argv[2]);
        settings = require(argv[2]);//override settings module with what's supplied by commandline.
    }

    var port = settings.port || 8080;
    var host = settings.host || '127.0.0.1';
    var convert = settings.convert || 'convert';
    var srcDir = settings.srcDir || './';
    var destDir = settings.destDir || './tmp/';
    var baseDir = process.cwd();//__dirname;
    var cacheImages = typeof settings.cacheImages == 'undefined' ? true : settings.cacheImages;

    if (!srcDir.startsWith('/')) {
        srcDir = path.join(baseDir, srcDir);
    }
    if (!destDir.startsWith('/')) {
        destDir = path.join(baseDir, destDir);
    }



    console.log('Using\n'
                + '\thost\t%s\n'.f(host)
                + '\tport\t%s\n'.f(port)
                + '\tconvert\t%s\n'.f(convert)
                + '\tsrcDir\t%s\n'.f(srcDir)
                + '\tdestDir\t%s\n'.f(destDir)
                + '\tcacheImages\t%s\n'.f(cacheImages));

    var server = Server(convert, srcDir, destDir, cacheImages);
    var exit = function() {
        server.stop();
        process.exit(0);
    };

    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);
    process.on('SIGQUIT', exit);
    process.on('SIGKILL', exit);
    //process.on('uncaughtException', function(err) {
    //    sys.log(err);
    //});
    server.start(host, port);
};

main();
