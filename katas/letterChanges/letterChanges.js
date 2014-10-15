module.exports = letterChanger;

function letterChanger(string) {
    string = string == null ? '' : String(string);
    mixed = [],
    strArr = string.toLowerCase().split("");
    for (var i = 0, l = strArr.length; i < l; i++) {
        var charr = strArr[i];
        charr = alphabetcheck(charr)
        charr = vowelCheck(charr);
        mixed.push(charr);
    }
    return mixed.join("");
}

function vowelCheck(charr) {
    var vowel = 'aeiou'.split("");
    if (vowel.indexOf(charr) !== -1) {
        charr = charr.toUpperCase();
    }
    return charr;
}

function alphabetcheck(charr) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    if (charr.match(/([^a-zA-Z])/gm)) {
        return charr;
    } else {
        charr = alphabet.indexOf(charr) + 1;

        if (charr === 25) {
            charr = alphabet[0];
        } else {
            charr = alphabet[charr];
        }
    }
    return charr;
}
