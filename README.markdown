# About

For GET requests, dynamically resizes image using ImageMagick and serves the resized image.

For example,

    GET /some/image.c.10x20.jpg

will execute

    convert srcDir/some/image.jpg -resize 10x20 destDir/some/image.c.10x20.jpg

and serves

    destDir/some/image.c.10x20.jpg

convert command, srcDir, and destDir are configurable.

# Getting started

Download and install [Node.js](http://nodejs.org/):

    cd node-v0.2.5
    ./configure --prefix=$HOME/opt/nodejs --without-ssl
    make
    make install
    #add nodejs/bin to PATH

Run

    node src/main.js localhost:8888

Configure

    vim src/settings.js



