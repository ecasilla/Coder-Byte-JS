/*jshint -W079 */
var path = require('path');
var simpleSymbol = require(path.join(process.cwd(), 'katas/simpleSymbols/simpleSymbol.js'));
var expect = require('chai').expect;

describe('The simple symbol module', function(){
  
    it('should return a string instance', function(){
      expect(simpleSymbol()).to.be.a("string");
  });
});

