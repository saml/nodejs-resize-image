var path = require('path');
var util = require('./util');

/**
 * require('UrlParser')(srcDir, destDir).parse(url);
 *
 * paramatized module
 */
var Module = function(srcDir, destDir) {
    var me = {};

    var getImgPath = function(imgId) {
        return path.join(srcDir, imgId);
    };

    var getOutputPath = function(url) {
        return path.join(destDir, url);
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

            var width = m[2] * 1;
            var height = m[3] * 1;
            var gravity = getGravity(m[4]);
            var ext = m[5];
            var imgId = m[1] + ext;

            var src = getImgPath(m[1]+ext);
            var out = getOutputPath(url);

            return ({
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

            var width = m[2] * 1;
            var height = m[3] * 1;
            var ext = m[4];
            var imgId = m[1] + ext;

            var src = getImgPath(m[1]+ext);
            var out = getOutputPath(url);

            return ({
                width: width,
                height: height,
                src: src,
                out: out,
                args: ['-resize', '%sx%s>'.f(width, height)]
            });
        };
        return me;
    };


    var parsers = [CropParser(), ThumbnailParser()];
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

    me.getImgPath = getImgPath;

    return me;
};

module.exports = Module;

