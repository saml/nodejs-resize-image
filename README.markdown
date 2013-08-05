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

Parameter :|: Crops At :|: Example :|: Comment
 | Center | GET /some/image.10x20.jpg | Not specifying a parameter crops at center.
t | No Crop | GET /some/image.100x400t.jpg | Instead of cropping, some/image.jpg is resized to fit in 100x400 rectangle.
n | North | GET /a/b.100x400n.jpg |
ne | NorthEast | GET /a/b.100x400ne.jpg |
se | SouthEast | GET /a/b.100x400se.jpg |
s | South | GET /a/b.100x400s.jpg |
sw | SouthWest | GET /a/b.100x400sw.jpg |
w | West | GET /a/b.100x400w.jpg |
nw | NorthWest | GET /a/b.100x400nw.jpg |

# Example

- [300x300 cropped to center](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300.jpg)
- [300x300 thumbnail](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300t.jpg)
- [300x300 cropped to west](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300w.jpg)
- [300x300 cropped to east](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300e.jpg)
- [300x300 cropped to north](http://nodejs-resize-image.herokuapp.com/http://i.imgur.com/gWthS3m.300x300n.jpg)

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
