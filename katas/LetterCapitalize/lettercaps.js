module.exports = letterCaps;

function letterCaps(str) {
  str = str == null ? '' : String(str);
  var stringArr = str.split(" ");
  return stringArr.map(function(value,index){
    var v = stringArr[index];
    return v.charAt(0).toUpperCase() + v.slice(1);
  }).join(" ");
}
