/*jshint -W079 */

//Have the function RunLength(str) take the str parameter being passed and return a compressed version
//of the string using the Run-length encoding algorithm. 
//This algorithm works by taking the occurrence of each repeating character and
//outputting that number along with a single character of the repeating sequence.
//For example: "wwwggopp" would return 3w2g1o2p. The string will not contain
//any numbers, punctuation, or symbols. 

var path = require('path');
var runLength = require(path.join(process.cwd(), 'katas/run_length/run_length'));

describe('Run length: ', function() {
    it('should return a string', function() {
        expect(runLength("wwwggopp")).to.be.a('string');
    });
    it('should give me back the length of the characters in a word', function(done) {
        expect(runLength("wwwggopp")).to.equal("3w2g1o2p");
        done();
    });
});
