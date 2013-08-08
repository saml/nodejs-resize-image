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

        var UrlRE = /^\/(.+)\.(\d+)x(\d+)(n|w|s|e|nw|ne|sw|se)?(\.\d+)?(\.\w+)$/;
        var GravityMap = {
            n: 'North',
            w: 'West',
            s: 'South',
            e: 'East',
            nw: 'NorthWest',
            ne: 'NorthEast',
            sw: 'SouthWest',
            se: 'SouthEast'
        };

        var getGravity = function(key) {
            if (!key) {
                return 'Center';
            }
            return GravityMap[key];
        };

        var MIN_CROP_PERCENT = 10;
        var MAX_CROP_PERCENT = 100;

        var getCropPercentage = function(percent) {
            if (typeof percent === 'undefined') {
                return undefined;
            }
            percent = percent.substring(1) * 1;//get rid of leading dot.
            if (Number.isNaN(percent)) {
                return undefined;
            }
            if (percent <= MIN_CROP_PERCENT) {
                return MIN_CROP_PERCENT; 
            }
            if (percent >= MAX_CROP_PERCENT) {
                return MAX_CROP_PERCENT;
            }
            return percent;
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
            var cropPercentage = getCropPercentage(m[5]);
            var ext = m[6];
            var imgId = m[1] + ext;

            var src = getImgPath(imgId);
            var out = getOutputPath(url);
            var remoteUrl = getRemoteOriginUrl(imgId);

            var initialResizeWidth = width;
            var initialResizeHeight = height;
            if (cropPercentage) {
                var initialCropRatio = -1/100 * cropPercentage + 2;
                initialResizeWidth = Math.floor(width * initialCropRatio);
                initialResizeHeight = Math.floor(height * initialCropRatio);
            }

            return ({
                remoteUrl: remoteUrl,
                width: width,
                height: height,
                src: src,
                out: out,
                args: ['-resize', '%sx%s^'.f(initialResizeWidth, initialResizeHeight), 
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

