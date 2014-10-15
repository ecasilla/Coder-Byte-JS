function firstReverse(str) {
    str = str == null ? '' : String(str);

    var strArray = str.split("");
    var reverse = [];
    for (var i = strArray.length - 1; i >= 0; i--) {
        reverse.push(strArray[i]);
        str = reverse.join("");
    }
    return str;
}

module.exports = firstReverse;
