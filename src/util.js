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

exports.mkdirP = mkdirP;

