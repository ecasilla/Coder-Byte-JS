/*jshint -W079 */
var path = require('path');
var firstFactorial = require(path.join(process.cwd(),"katas/factorial/factorial.js"));
var expect = require('chai').expect;

describe("Factorial", function() {
  it("It will give you the factorial of number ", function() {
    expect(firstFactorial(4)).to.equal(24);
  });
  it("should give you 1 if you pass in 0 or any other data type ", function() {
    expect(firstFactorial({})).to.equal(1);
    expect(firstFactorial(0)).to.equal(1);
  });
});
