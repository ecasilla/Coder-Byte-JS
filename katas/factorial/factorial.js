function firstFactorial (num){
    if (num === 0|| typeof num !== 'number'){
      return 1;
    } else {
      return num * firstFactorial( num - 1 );
    }
}

module.exports = firstFactorial;
