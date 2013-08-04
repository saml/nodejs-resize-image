var config = {};
config.port = 8383;
config.host = '0.0.0.0';

//imagemagick command. can be absolute path: /usr/bin/convert
config.convertCmd = 'convert';

//where images are located. can be absolute path.
config.srcDir = './img/';
//where to store resized files.
config.destDir = './tmp/';
//whether to leave generated thumbnails or not.
config.cacheImages = true;


var localConfig = {};
try {
    localConfig = require('./settings.local');
} catch(err) {
} finally {
    localConfig.__proto__ = config;
}

module.exports = localConfig;
