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

You can specify crop size in percentage (defaults to `100%`):

```
GET /some/image.10x20n.70.jpg
```

would crop 1:2 rectangle that'll fit about 70% of original image.

Other parameters:

Parameter | Crops At | Example | Comment
----------|----------|---------|---------
 | Center | GET /some/image.10x20.jpg | Not specifying a parameter crops at center.
n | North | GET /a/b.100x400n.jpg |
s | South | GET /a/b.100x400s.jpg |
w | West | GET /a/b.100x400w.jpg |
e | East | GET /a/b.100x400e.jpg |
nw | NorthWest | GET /a/b.100x400nw.jpg |
ne | NorthEast | GET /a/b.100x400ne.jpg |
sw | SouthWest | GET /a/b.100x400sw.jpg |
se | SouthEast | GET /a/b.100x400se.jpg |
t | No Crop | GET /some/image.100x400t.jpg | Instead of cropping, some/image.jpg is resized to fit in 100x400 rectangle.

# Example

- [original is horizontal.](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.jpg)
- Horizontal to square:
    - [300x300 cropped to center](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300.jpg)
    - [300x300 cropped to west](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300w.jpg)
    - [300x300 cropped to east](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300e.jpg)
    - [300x300 cropped to north west 100%](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300nw.jpg)
    - [300x300 cropped to north west 50%](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300nw.50.jpg)
    - [300x300 thumbnail](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300t.jpg)
- Horizontal to vertical:
    - [320x480 cropped to center](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.320x480.jpg)
    - [320x480 cropped to west](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.320x480w.jpg)
    - [320x480 cropped to east](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.320x480e.jpg)
    - [320x480 cropped to north east 100%](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.320x480ne.jpg)
    - [320x480 cropped to north east 75%](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.320x480ne.75.jpg)
- Horizontal to horizontal:
    - [500x281 cropped to center](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.500x281.jpg)
    - [500x281 cropped to north](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.500x281n.jpg)
    - [500x281 cropped to south](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.500x281s.jpg)
    - [500x281 cropped to south west 100%](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.500x281sw.jpg)
    - [500x281 cropped to south west 80%](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.500x281sw.80.jpg)

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
