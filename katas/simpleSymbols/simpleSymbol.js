module.exports = simpleSymbol;

function simpleSymbol (string) {
  string = string == null ? '' : String(string);
  if (string.match(/\+[a-zA-Z]\+/)) {
   log("Hello") 
  } 
  //var strArr = string.split("");
  //log(strArr)
}

function log() {
  console.log.apply(this,arguments);
}

simpleSymbol("f++d+")
