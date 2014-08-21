var path = require('path');

var EXTENSIONS = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.tif': 'image/tiff',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json'
};

function getMimeType(name) {
  var ext = path.extname(name).toLowerCase();
  return EXTENSIONS[ext] || 'application/octet-stream';
};

exports.fromPath = getMimeType;
