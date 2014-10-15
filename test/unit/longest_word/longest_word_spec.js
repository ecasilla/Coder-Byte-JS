/*jshint -W079 */

var longestWord = require('../../../katas/longest_word/longest_word'),
    expect = require('chai').expect;
describe('this is the longest word module', function() {
  it('should return a string', function(){
    expect(longestWord("Hello ernie! why so serious")).to.be.a('string');
  });
  it('should give me back the longest word', function(done) {
    expect(longestWord("Hello ernie! why so serious")).to.equal("serious");
    done();
  });
});
