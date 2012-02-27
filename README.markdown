# About

For GET requests, dynamically resizes image using ImageMagick `convert` command and serves the resized image.

For example,

    GET /some/image.jpg/10x20.jpg

will execute

    convert srcDir/some/image.jpg -resize 10x20 destDir/tempFile.jpg

and serves

    destDir/tempFile.jpg

convert command, srcDir, and destDir are configurable.

# Getting started

Download and install [Node.js](http://nodejs.org/):

    cd node-v0.2.5
    ./configure --prefix=$HOME/opt/nodejs --without-ssl
    make
    make install
    #add nodejs/bin to PATH

Run

    node src/main.js

Configure

    cp src/settings.js settings.local.js
    vim settings.local.js
    node src/main.js /absolute/path/to/settings.local.js

