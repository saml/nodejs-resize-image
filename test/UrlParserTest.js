var assert = require('assert');

var UrlParser = require('../src/UrlParser');

describe('UrlParser', function() {
    describe('#parse()', function() {
        var urlParser = UrlParser('/src', '/out');

        var centerCropRemote = urlParser.parse('/http://imgur.com/a.100x200.jpg');

        it('center crop remote -> remoteUrl', function() {
            assert.equal('http://imgur.com/a.jpg', centerCropRemote.remoteUrl);
        });

        it('center crop remote -> out', function() {
            assert.equal('/out/http/imgur.com/a.100x200.jpg', centerCropRemote.out);
        });

        it('center crop remote -> src', function() {
            assert.equal('/src/http/imgur.com/a.jpg', centerCropRemote.src);
        });

        var centerCropRemoteNormalized = urlParser.parse('/http/imgur.com/a.100x200.jpg');

        it('center crop remote normalized -> remoteUrl', function() {
            assert.equal('http://imgur.com/a.jpg', centerCropRemoteNormalized.remoteUrl);
        });

        it('center crop remote normalized -> out', function() {
            assert.equal('/out/http/imgur.com/a.100x200.jpg', centerCropRemoteNormalized.out);
        });

        it('center crop remote normalized -> src', function() {
            assert.equal('/src/http/imgur.com/a.jpg', centerCropRemoteNormalized.src);
        });

        var badProtocol = urlParser.parse('/httpa/imgur.com/a.100x200sw.jpg');
        it('httpa -> remoteUrl', function() {
            assert.equal(null, badProtocol.remoteUrl);
        });

        it('httpa -> src', function() {
            assert.equal('/src/httpa/imgur.com/a.jpg', badProtocol.src);
        });


        it('httpa -> out', function() {
            assert.equal('/out/httpa/imgur.com/a.100x200sw.jpg', badProtocol.out);
        });

        it('a', function() {
            assert.equal(null, urlParser.parse('/http:/imgur.com/a.100x200t.jpg').remoteUrl);
        });

        it('b', function() {
            assert.equal('http://imgur.com/a.jpg', urlParser.parse('/http/imgur.com/a.100x200sw.jpg').remoteUrl);
        });

        it('c', function() {
            assert.equal('https://imgur.com/a.jpg', urlParser.parse('/https/imgur.com/a.100x200sw.jpg').remoteUrl);
        });

        it('d', function() {
            assert.equal('https://imgur.com/a.100x200abc.jpg', urlParser.parse('/https/imgur.com/a.100x200abc.jpg').remoteUrl);
        });

        it('e', function() {
            assert.equal('https://imgur.com/a.jpg', urlParser.parse('/https://imgur.com/a.100x200sw.jpg').remoteUrl);
        });

        it('dirname a', function() {
            assert.equal('https://imgur.com/a.jpg', urlParser.parse('/https://imgur.com/a.100x200sw.jpg').remoteUrl);
        });
    });
});
