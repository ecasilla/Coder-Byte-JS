/*jshint -W079 */
    var firstFactorial  = require("../../../katas/factorial/factorial.js");
          expect = require("../../helpers/expect.js");

describe("Factorial", function() {
  it("It will give you the factorial of number ",function() {
    expect(firstFactorial(4)).to.be(24);
  });
  it("should give you 1 if you pass in 0 or any other data type ", function() {
    expect(firstFactorial({})).to.be(1)
    expect(firstFactorial(0)).to.be(1)
  });
});
