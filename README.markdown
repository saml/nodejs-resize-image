# About

For GET requests, dynamically crops and resizes image using 
ImageMagick `convert` command.
And, serves the resized image.


The following crops 1:2 rectangle at center of some/image.jpg. And resizes the crop to 10x20:

```
GET /some/image.10x20.jpg
```

You can specify where to crop other than center. The following crops at the top (north).

```
GET /some/image.10x20n.jpg
```

Other parameters:

Parameter | Crops At | Example | Comment
----------|----------|---------|---------
 | Center | GET /some/image.10x20.jpg | Not specifying a parameter crops at center.
n | North | GET /a/b.100x400n.jpg |
s | South | GET /a/b.100x400s.jpg |
w | West | GET /a/b.100x400w.jpg |
e | East | GET /a/b.100x400e.jpg |
t | No Crop | GET /some/image.100x400t.jpg | Instead of cropping, some/image.jpg is resized to fit in 100x400 rectangle.

# Example

- [original is horizontal.](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.jpg)
- Horizontal to square:
    - [300x300 cropped to center](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300.jpg)
    - [300x300 cropped to west](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300w.jpg)
    - [300x300 cropped to east](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300e.jpg)
    - [300x300 thumbnail](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300t.jpg)
- Horizontal to vertical:
    - [320x480 cropped to center](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.320x480.jpg)
    - [320x480 cropped to west](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.320x480w.jpg)
    - [320x480 cropped to east](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.320x480e.jpg)
- Horizontal to horizontal:
    - [500x281 cropped to center](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.500x281.jpg)
    - [500x281 cropped to north](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.500x281n.jpg)
    - [500x281 cropped to south](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.500x281s.jpg)

# Quickstart

Run

    node src/main.js

Configure

    cp src/settings.js src/settings.local.js
    vim settings.local.js

Example `settings.local.js`:


    module.exports = {
        port: 8081,
        srcDir: '/var/www',
        destDir: '/var/cache',
        convertcmd: '/usr/local/bin/convert'
    }
