function longestWord(strings) {
    var longest = "";
    var strArray = strings.split(" ");
    for (var i = 0, l = strArray.length; i < l; i++) {
        var v = strArray[i];
        v = v.replace(/([^a-zA-Z])/gm, '');
        if (v.length > longest.length) {
            longest = v;
        }
    }
    return longest;
}

module.exports = longestWord;

longestWord("Hello ernie! why so serious");
