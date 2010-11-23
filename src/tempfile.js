var path = require('path');

var util = require('./util');

var defaultRootDir = '/tmp';
var defaultPrefix = "tmp-";
var defaultPostfix = "";

var generateName = function() {
    return '%s-%s'.f(
            Date.now()
            , (Math.random() * 0x100000000 + 1).toString(36));
};



var getName = function(prefix, postfix) {
    if (undefined === prefix) {
        prefix = defaultPrefix;
    }
    if (undefined === postfix) {
        postfix = defaultPostfix;
    }
    return prefix + generateName() + postfix;
};

var getPath = function(rootDir, prefix, postfix) {
    if (undefined === rootDir) {
        rootDir = defaultRootDir;
    }
    return path.join(rootDir, getName(prefix, postfix));
};

exports.getPath = getPath;
exports.getName = getName;
