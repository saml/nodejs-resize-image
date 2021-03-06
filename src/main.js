var path = require('path');

var util = require('./util');
var settings = require('./settings');
var Server = require('./Server');

var main = function() {
    var argv = process.argv.splice(2);
    var port = argv.length > 0 ? (argv[0] * 1) : settings.port;
    var host = settings.host;
    var convertCmd = settings.convertCmd;
    var srcDir = settings.srcDir;
    var destDir = settings.destDir;
    var staticDir = settings.staticDir;
    var baseDir = process.cwd();//__dirname;
    var cacheImages = settings.cacheImages;
    var maxOutputSize = settings.maxOutputSize;
    var debug = settings.debug;

    if (!srcDir.startsWith('/')) {
        srcDir = path.join(baseDir, srcDir);
    }
    if (!destDir.startsWith('/')) {
        destDir = path.join(baseDir, destDir);
    }
    if (!staticDir.startsWith('/')) {
      staticDir = path.join(baseDir, staticDir);
    }



    console.log('Using\n'
                + '  host           %s\n'.f(host)
                + '  port           %s\n'.f(port)
                + '  convert cmd    %s\n'.f(convertCmd)
                + '  staticDir      %s\n'.f(staticDir)
                + '  srcDir         %s\n'.f(srcDir)
                + '  destDir        %s\n'.f(destDir)
                + '  cacheImages    %s\n'.f(cacheImages)
                + '  maxOutputSize  %s\n'.f(maxOutputSize)
                + '  debug          %s\n'.f(debug)
    );

    var server = Server(convertCmd, srcDir, destDir, cacheImages, maxOutputSize, staticDir);
    var exit = function(ret) {
        if (typeof ret === 'undefined') {
            ret = 0;
        }
        server.stop();
        console.log('Bye');
        process.exit(ret);
    };

    //process.on('exit', exit);
    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);
    process.on('SIGQUIT', exit);
    //process.on('uncaughtException', function(err) {
    //    console.log(err);
    //    console.log(err.stack);
    //    //exit(1);
    //});
    server.start(host, port);
};

main();
