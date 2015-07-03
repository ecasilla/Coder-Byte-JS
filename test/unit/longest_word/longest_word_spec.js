/*jshint -W079 */

var path = require('path');
var longestWord = require(path.join(process.cwd(), 'katas/longest_word/longest_word'));

describe('Longest word: ', function() {
    it('should return a string', function() {
        expect(longestWord("Hello ernie! why so serious")).to.be.a('string');
    });
    it('should give me back the longest word', function(done) {
        expect(longestWord("Hello ernie! why so serious")).to.equal("serious");
        done();
    });
    it('should return the first instance of the longest word if there are two words with the same length', function() {
        expect(longestWord("I yess love dogs")).to.equal("yess");
    });
});
