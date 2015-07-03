module.exports = letterCaps;

function letterCaps(str) {
    str = str == null ? '' : String(str);
    var stringArr = str.split(" ");
    var comp = [];
    for (var i = 0, l = stringArr.length; i < l; i++) {
        var v = stringArr[i],
        upper = v.charAt(0).toUpperCase() + v.slice(1);
        comp.push(upper)
    }
    return comp.join(" ")
}
