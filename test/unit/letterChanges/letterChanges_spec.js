/*jshint -W079 */
var path = require('path');
var letterChanges = require(path.join(process.cwd(),'katas/letterChanges/letterChanges.js'));
var expect = require('chai').expect;
describe('The Letter changer function', function(){
    it('should return a string', function(){
    expect(letterChanges()).to.be.a('string');
  });
    it('should replace every letter in the string to the next letter in the alphabet', function(){
   expect(letterChanges("a")).to.equal("b")
  });
    it('should return the new modified version with the vowels uppercased', function(){
    expect(letterChanges("hello")).to.equal("Ifmmp");
  });
    it('should not accept any parameters that arent strings', function(){
    expect(letterChanges({})).to.equal("")
  });
});

