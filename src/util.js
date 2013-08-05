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

var mkdirP = function(p, mode, callback) {
    var cb = callback || function () {};
    if (p.charAt(0) !== '/') {
        p = path.join(process.cwd(), p);
    }

    var ps = path.normalize(p).split('/');
    fs.exists(p, function (exists) {
        if (exists) {
            cb(null);
        } else {
            mkdirP(ps.slice(0,-1).join('/'), mode, function (err) {
                if (err && err.errno != process.EEXIST) {
                    cb(err);
                } else {
                    fs.mkdir(p, mode, cb);
                }
            });
        }
    });
};


var downloadAnd = function(url, target, callback) {
    var GET = http.get;
    if (url.startsWith('https://')) {
        GET = https.get;
    }
    console.log('downloading %s => %s', url, target);
    GET(url, function(resp) {
        if (resp.statusCode !== 200) {
            callback(new Error("remote server didn't respond with 200: "+url));
            return;
        }

        //maybe download to /tmp and rename.
        var file = fs.createWriteStream(target);
        resp.on('data', function(chunk) {
            file.write(chunk);
        }).on('end', function() {
            file.end();
            callback(null);
        });
    }).on('error', function(err) {
        callback(err); 
    }).setTimeout(5000);
};


/**
 * downloads url and calls callback(error or null);
 */
var ensureDirAndDownload = function(url, target, callback) {
    var targetDir = path.dirname(target);
    fs.exists(targetDir, function(exists) {
        if (!exists) {
            mkdirP(targetDir, 0755, function(err) {
                if (err) {
                    callback(err);
                } else {
                    downloadAnd(url, target, callback);
                }
            });
        } else {
            downloadAnd(url, target, callback);
        }
    });
};

module.exports = {
    mkdirP: mkdirP,
    downloadAnd: ensureDirAndDownload
};

