module.exports = simpleAdding;

function simpleAdding(num) {
 if (typeof num !== 'number') {
  return 0; 
 }
 var numArr = [];
 var index = 1;
 var addition;
 while(numArr.length !== num){
    numArr.push(index);
    index++
 }
  addition = add(numArr)
  return addition;
}

function add(array) {
  var num = 0;
  for (var i = 0, l = array.length; i < l; i ++) {
    var v = array[i];
    num = v + num;
  }
  return num;
}

