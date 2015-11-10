module.exports = letterChanger;

function letterChanger(string) {
    var string = string == null ? '' : String(string);
    var strArr = string.toLowerCase().split("");

    return strArr.map(function(value,index){
      var charr = strArr[index]
      charr = alphabetCheck(charr)
      charr = vowelCheck(charr);
      return charr;
    }).join("");
}

letterChanger(string) //sideeffects

function vowelCheck(charr) {
    var vowel = 'aeiou'.split("");
    if (vowel.indexOf(charr) !== -1) {
        //charr = charr.toUpperCase();
        return true
    }
    return false;
}

var result = letterChanger(upperCase(vowelCheck(alphabetCheck))))

function alphabetCheck(charr) {
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
