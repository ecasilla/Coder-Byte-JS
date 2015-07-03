/*jshint -W079 */
var path = require('path');
var simpleAdding = require(path.join(process.cwd(), "katas/simpleAdding/simpleAdding.js"));

describe('Simple Adding: ', function() {

    it('should return a integer', function() {
        expect(simpleAdding(1)).to.be.a('number');
    });

    it('should do parameter checking for numbers', function() {
        expect(simpleAdding({})).to.equal(0);
    });

    it('should add up all the numbers from 1 to num', function() {
        expect(simpleAdding(12)).to.equal(78);
        expect(simpleAdding(140)).to.equal(9870);
    });
});
