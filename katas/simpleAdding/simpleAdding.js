module.exports = simpleAdding;

function simpleAdding(num) {
    if (typeof num !== 'number') {
        return 0;
    }
    var numArr = [];
    var index = 1;
    var addition;
    while (numArr.length !== num) {
        numArr.push(index);
        index++
    }
    addition = add(numArr)
    return addition;
}

function add(array) {
  return array.reduce(function(acc,curr){
    return acc + curr;
  },0);
}
