function firstReverse(str) {
    if (typeof str !== "string") {
        return "Please call with strings";
    }
    var strArray = str.split("");
    var reverse = [];
    for (var i = strArray.length - 1; i >= 0; i--) {
        reverse.push(strArray[i]);
        str = reverse.join("");
    }
    return str;
}

module.exports = firstReverse;
