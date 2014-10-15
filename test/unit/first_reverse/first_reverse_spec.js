/*jshint -W079 */
var path = require('path');
var firstReverse = require(path.join(process.cwd(), "katas/first_reverse/first_reverse.js"));
var expect = require("chai").expect;

describe('First Reverse', function() {
    it('should reverse a string', function() {
        expect(firstReverse("Hello")).to.equal("olleH");
    });
    it("should fail if its given anything but a string", function() {
        expect(firstReverse({})).to.be.a("string");
    });

});
