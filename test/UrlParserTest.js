var assert = require('assert');

var UrlParser = require('../src/UrlParser');

describe('UrlParser', function() {
    describe('#parse()', function() {
        var urlParser = UrlParser('/imgdir', '/thumbnaildir');

        it('should parse remoteUrl', function() {
            assert.equal('http://imgur.com/a.jpg', urlParser.parse('/http://imgur.com/a.100x200.jpg').remoteUrl);
        });

        it('should parse remoteUrl without ://', function() {
            assert.equal('http://imgur.com/a.jpg', urlParser.parse('/http/imgur.com/a.100x200.jpg').remoteUrl);
        });

        it('should reject false remoteUrl', function() {
            assert.equal(null, urlParser.parse('/httpa/imgur.com/a.100x200.jpg').remoteUrl);
        });
    });
});
