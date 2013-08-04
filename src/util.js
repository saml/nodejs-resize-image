if (typeof Object.create !== 'function') {
    Object.create = function(o) {
        var F = function() {};
        F.prototype = o;
        return new F();
    };
}

if (String.prototype.f !== 'function') {
    String.prototype.f = function() {
        var args = arguments;
        var index = 0;
        var r = function() {
            return args[index++];
        };
        return this.replace(/%s/g, r);
    };
}

if (String.prototype.fo !== 'function') {
    String.prototype.fo = function(o) {
        var r = function(matched, group_1) {
            return o[group_1];
        };
        return this.replace(/%\(([^)]+)\)s/g, r);
    };
}

if (String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function(s) {
        return this.indexOf(s) === 0;
    };
}

/*
if (Array.prototype.collectFirst !== 'function') {
    Array.prototype.collectFirst = function(pred) {
        var n = this.length;
        var i = 0;
        for (; i < n; i++) {
            var x = this[i];
            if (pred(x)) {
                return x;
            }
        }
        return null;
    };
}
*/

var path = require('path');
var fs = require('fs');
var http = require('http');
var https = require('https');

var Module = {};

Module.mkdirP = function(p, mode, callback) {
    var cb = callback || function () {};
    if (p.charAt(0) !== '/') {
        p = path.join(process.cwd(), p);
    }

    var ps = path.normalize(p).split('/');
    fs.exists(p, function (exists) {
        if (exists) {
            cb(null);
        } else {
            Module.mkdirP(ps.slice(0,-1).join('/'), mode, function (err) {
                if (err && err.errno != process.EEXIST) {
                    cb(err);
                } else {
                    fs.mkdir(p, mode, cb);
                }
            });
        }
    });
};

var UrlRE = /^\/*(https?)(?:\:\/\/|\/)?(.+)$/;
var PathRE = /^\/*([^:]+)$/;

Module.normalizeUrl = function(url) {
    var m = UrlRE.exec(url);
    if (!m) {
        var pathMatch = PathRE.exec(url);
        return pathMatch[1];
    }
    return path.join(m[1], m[2]);
};


/**
 * downloads url and calls callback(error or null);
 */
Module.downloadAnd = function(url, target, callback) {
    var targetDir = path.dirname(target);
    fs.exists(targetDir, function(exists) {
        if (!exists) {
            Module.mkdirP(targetDir, 0755, function(err) {
                if (err) {
                    callback(err);
                } else {
                    var GET = http.get;
                    if (url.startsWith('https://')) {
                        GET = https.get;
                    }
                    console.log('downloading %s => %s', url, target);
                    GET(url, function(resp) {
                        //maybe download to /tmp and rename.
                        var file = fs.createWriteStream(target);
                        resp.on('data', function(chunk) {
                            file.write(chunk);
                        }).on('end', function() {
                            file.end();
                            callback(null);
                        });
                    });
                }
            });
        }
    });
};

module.exports = Module;

