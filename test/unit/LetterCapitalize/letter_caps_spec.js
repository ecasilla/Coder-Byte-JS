/*jshint -W079 */
var path = require('path');
var letterCaps = require(path.join(process.cwd(), "katas/LetterCapitalize/lettercaps.js"));
var expect = require("chai").expect;

describe('This module should capitalize the first letter in every word', function() {

    it('should return a string', function() {
        expect(letterCaps()).to.be.a('string')
    });
    it('should return cap word', function() {
        expect(letterCaps("hello")).to.equal("Hello");
    });
    it('should return the cap words of a sentence', function() {
        expect(letterCaps("hello world")).to.equal("Hello World");
    });
});
