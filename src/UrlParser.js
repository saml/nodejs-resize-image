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

        var UrlRE = /^\/(.+)\.(\d+)x(\d+)(\.\w+)$/;

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
                args: ['-resize', '%sx%s^'.f(width, height), 
                    '-gravity', 'center',
                    '-crop', '%sx%s+0+0'.f(width, height),
                    '+repage']
            });
        };
        return me;
    }

    var ThumbnailParser = function() {
        var me = {};

        var UrlRE = /^\/(.+)\.t.(\d+)x(\d+)(\.\w+)$/;

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

