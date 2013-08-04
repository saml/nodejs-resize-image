# About

For GET requests, dynamically resizes image using ImageMagick `convert` command and serves the resized image.

For example,

    GET /some/image.10x20.jpg

will execute

    convert srcDir/some/image.jpg -resize 10x20> destDir/tempFile.jpg

and serves

    destDir/tempFile.jpg

convert command, srcDir, and destDir are configurable.

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
