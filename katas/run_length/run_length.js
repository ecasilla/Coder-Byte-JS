function RunLength(str) {
    var input = str.split("");
    var charCounter = 0;
    var temp = [];
    var last = input.length - 1;
    var results = input.reduce(function(prev, curr, index, arr) {
        var prevTracker = index === 0 ? 0 : index - 1;
        if (arr[prevTracker] === input[index]) {
            return charCounter++
        } else {
            temp.push(charCounter);
            temp.push(input[prevTracker]);
            charCounter = 1;
            return;
        }
    }, temp);
    //final index push
    temp.push(charCounter)
    temp.push(input[last])
    return temp.join("");
}

module.exports = RunLength;
