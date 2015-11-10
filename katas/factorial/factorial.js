function firstFactorial(num) {
    if (num === 0 || typeof num !== 'number') {
        return 1;
    } else {
        var arr = createArray(1, num);
        return arr.reduce(function(acc, curr) {
            return acc * curr;
        }, 1);
    }
}

function createArray(start, end) {
    var results = [],
        current = start,
        step = start < end ? 1 : -1;

    results.push(current);

    while (current !== end) {
        current += step;
        results.push(current);
    }

    return results;
}

module.exports = firstFactorial;
