/*jshint -W079 */
var firstReverse = require("../../../katas/first_reverse/first_reverse.js");
var expect = require("../../helpers/expect.js");

describe('First Reverse', function() {
    it('should reverse a string', function() {
        expect(firstReverse("Hello")).to.be("olleH");
    });
    it("should fail if its given anything but a string", function() {
        expect(firstReverse({})).to.be("Please call with strings");
    });

});
