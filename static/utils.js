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

function range(start, end, stepsFn) {
  if (start === end) {
    return [start, end];
  }
  
  var shouldLoop = function() {
    return start < end;
  };
  if (start > end) {
    shouldLoop = function() {
      return start > end;
    };
  }

  if (typeof stepsFn !== 'function') {
    stepsFn = function(x) { return x + 1; };
  }
  var arr = [];


  while (shouldLoop()) {
    arr.push(start);
    start = stepsFn(start);
  }
  arr.push(end);
  return arr;
}

function initFormInputFromQuery(query, key, form, defaultValue, name) {
  name = name || key;

  var input = form.querySelector('input[name="'+name+'"]');
  var value = query[key];
  if (typeof value === 'undefined') {
    value = defaultValue;
  }

  if (input) {
    input.value = value;
  }
  return input;
}

function commaSeparatedNumbers(str) {
  if (str) {
    return str.split(',').map(function(x) { return Number(x); });
  }
  return [];
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

function appendImageCell(cellWidth, cellHeight, quality, url, parentElem) {
  var cell = document.createElement('div');
  cell.className = 'cell';
  cell.style.width = cellWidth + 'px';

  function append(img, size) {

    img.addEventListener('load', function() {
      var kb = toKilobyte(size);
      cell.appendChild(document.createElement('br'));

      var msg = img.naturalWidth+'x'+img.naturalHeight+' | q'+quality+' | '+kb+'kb';
      cell.appendChild(document.createTextNode(msg));
      cell.appendChild(document.createElement('br'));

      cell.appendChild(createAnchor(url));

    });


    cell.appendChild(img);
  }


  parentElem.appendChild(cell);
  loadImage(url, append);
}



