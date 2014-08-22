function parseQueryString(query) {
  query = decodeURIComponent(query || window.location.search.substring(1));

  var args = {};
  query.split(/&/).forEach(function(kv) {
    var splitted = kv.split(/=/);
    args[splitted[0]] = splitted[1];
  });
  return args;
}

function parseAssetUrl(url) {
  var regex = new RegExp('^(.+)(\\.\\w+)$');
  var m = regex.exec(url);
  return m;
}

function getRendition(url, width, height, isNoCrop, quality) {
  var parsed = parseAssetUrl(url);
  if (!parsed) {
    return null;
  }


  var withoutExt = parsed[1];
  var ext = parsed[2];

  var args = [];
  if (!isNaN(width) && !isNaN(height)) {
    var dimension = width+'x'+height;
    if (isNoCrop) {
      dimension += 't';
    }
    args.push(dimension);
  }

  if (!isNaN(quality)) {
    args.push('q'+quality);
  }

  return '/'+withoutExt+'.'+args.join('.')+ext;
}

function createAnchor(url, text) {
  var a = document.createElement('a');
  a.href = url;
  a.innerHTML = text || url;
  return a;
}

function decimalDigits(num) {
  return Math.max(Math.log(Math.floor(num)) / Math.LN10 + 1, 1);
}

function toFractionPrecision(num, precision) {
  return num.toPrecision(decimalDigits(num) + precision);
}

function toKilobyte(size) {
  return toFractionPrecision(size / Math.pow(2, 10), 2);
}

// loads image via xhr to get image byte size :P
// onSuccess(Image, int byte size)
function loadImage(url, onSuccess) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';

  xhr.addEventListener('load', function() {
    var blob = xhr.response;

    var reader = new FileReader();
    reader.addEventListener('loadend', function() {
      var blobBase64 = reader.result;
      var img = new Image();
      img.src = blobBase64;
      if (typeof onSuccess == 'function') {
        var size = parseInt(xhr.getResponseHeader('Content-Length'), 10) || blob.size;
        onSuccess(img, size);
      }
    });

    reader.readAsDataURL(xhr.response);
  });
  xhr.open('GET', url);
  xhr.send();
}

