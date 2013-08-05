var path = require('path');
var util = require('./util');

/**
 * require('UrlParser')(srcDir, destDir).parse(url);
 *
 * paramatized module
 */
var Module = function(srcDir, destDir, maxOutputSize) {
    var me = {};


    var PathUrlRE = /^\/*(https?)(?:\:\/)?\/(.+)$/;
    var PathRE = /^\/*(.+)$/;
    var HttpUrlRE = /^(https?)(?:\:\/)?\/(.+)$/;

    var normalizeUrl = function(url) {
        var m = PathUrlRE.exec(url);
        if (!m) {
            var pathMatch = PathRE.exec(url);
            return pathMatch[1];
        }
        return path.join(m[1], m[2]);
    };

    var normalizeSize = function(width, height) {
        var w, h;
        if (width > height) {
            h = maxOutputSize * height / width;
            w = maxOutputSize;
        } else {
            w = maxOutputSize * width / height;
            h = maxOutputSize;
        }
        if (w >= width && h >= height) {
            w = width;
            h = height;
        }
        return {width: w, height: h};
    };


    var getImgPath = function(imgId) {
        return path.join(srcDir, normalizeUrl(imgId));
    };

    var getOutputPath = function(url) {
        return path.join(destDir, normalizeUrl(url));
    };

    var getRemoteOriginUrl = function(imgId) {
        var m = HttpUrlRE.exec(imgId);
        if (!m) {
            return null;
        }
        return m[1] + '://' + m[2];
    };

    var CropParser = function() {
        var me = {};

        var UrlRE = /^\/(.+)\.(\d+)x(\d+)(n|nw|w|sw|s|se|e|ne)?(\.\w+)$/;
        var GravityMap = {
            n: 'North',
            nw: 'NorthWest',
            w: 'West',
            sw: 'SouthWest',
            s: 'South',
            se: 'SouthEast',
            e: 'East',
            ne: 'NorthEast'
        };

        var getGravity = function(key) {
            if (!key) {
                return 'Center';
            }
            return GravityMap[key];
        };

        me.parse = function(url) {
            var m = UrlRE.exec(url);
            if (!m) {
                return null;
            }

            var size = normalizeSize(m[2]*1, m[3]*1);
            var width = size.width;
            var height = size.height;
            var gravity = getGravity(m[4]);
            var ext = m[5];
            var imgId = m[1] + ext;

            var src = getImgPath(imgId);
            var out = getOutputPath(url);
            var remoteUrl = getRemoteOriginUrl(imgId);
            return ({
                remoteUrl: remoteUrl,
                width: width,
                height: height,
                src: src,
                out: out,
                args: ['-resize', '%sx%s^'.f(width, height), 
                    '-gravity', gravity,
                    '-crop', '%sx%s+0+0'.f(width, height),
                    '+repage']
            });
        };
        return me;
    }

    var ThumbnailParser = function() {
        var me = {};

        var UrlRE = /^\/(.+)\.(\d+)x(\d+)t(\.\w+)$/;

        me.parse = function(url) {
            var m = UrlRE.exec(url);
            if (!m) {
                return null;
            }


            var size = normalizeSize(m[2]*1, m[3]*1);
            var width = size.width;
            var height = size.height;
            var ext = m[4];
            var imgId = m[1] + ext;

            var src = getImgPath(imgId);
            var out = getOutputPath(url);
            var remoteUrl = getRemoteOriginUrl(imgId);

            return ({
                remoteUrl: remoteUrl,
                width: width,
                height: height,
                src: src,
                out: out,
                args: ['-resize', '%sx%s>'.f(width, height)]
            });
        };
        return me;
    };

    var OriginalImgParser = function() {
        var me = {};
        var UrlRE = /^\/(.+\.\w+)$/;
        me.parse = function(url) {
            var m = UrlRE.exec(url);
            var imgId = m[1];
            var src = getImgPath(imgId);
            var remoteUrl = getRemoteOriginUrl(imgId);
            return ({
                remoteUrl: remoteUrl,
                src: src
            });
        };
        return me;
    };


    var parsers = [CropParser(), ThumbnailParser(), OriginalImgParser()];
    var parsersLength = parsers.length;

    me.parse = function(url) {
        var i = 0;
        for (; i < parsersLength; i++) {
            var parser = parsers[i];
            var parsed = parser.parse(url);
            if (parsed) {
                return parsed;
            }
        }
        return null;
    };

    return me;
};

module.exports = Module;

