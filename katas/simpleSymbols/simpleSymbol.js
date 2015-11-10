module.exports = simpleSymbol;

function simpleSymbol(string) {
  string = string == null ? '' : String(string);
  if (string.match(/\+[a-zA-Z]\+/)) {
    return true;
  }else{
    return false;
  }
}

function log() {
    console.log.apply(this, arguments);
}

simpleSymbol("f++d+");
simpleSymbol("+d+=3=+s+");
