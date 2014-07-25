function longestWord(strings) {
    var longest;
    var cache = []
    var strArray = strings.split(" ");
    for (var i = 0, l = strArray.length; i < l; i++) {
        var v = strArray[i];
        v = v.replace(/([^a-zA-Z])/gm, '');
        if (v) {
            cache.push(v);
        }
    }
    return longest;
}
