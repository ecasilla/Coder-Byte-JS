(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function firstFactorial (num){
    if (num === 0|| typeof num !== 'number'){
      return 1;
    } else {
      return num * firstFactorial( num - 1 );
    }
}

module.exports = firstFactorial;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
var TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str.toString()
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.compare = function (a, b) {
  assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) {
    return -1
  }
  if (y < x) {
    return 1
  }
  return 0
}

// BUFFER INSTANCE METHODS
// =======================

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end === undefined) ? self.length : Number(end)

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = asciiSlice(self, start, end)
      break
    case 'binary':
      ret = binarySlice(self, start, end)
      break
    case 'base64':
      ret = base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

Buffer.prototype.equals = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.compare = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return readUInt16(this, offset, false, noAssert)
}

function readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return readInt16(this, offset, false, noAssert)
}

function readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return readInt32(this, offset, false, noAssert)
}

function readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return readFloat(this, offset, false, noAssert)
}

function readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
  return offset + 1
}

function writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
  return offset + 2
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, false, noAssert)
}

function writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
  return offset + 4
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
  return offset + 1
}

function writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
  return offset + 2
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, false, noAssert)
}

function writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
  return offset + 4
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, false, noAssert)
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":4,"ieee754":5}],4:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],5:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){
(function (Buffer){
(function(global, module) {

    if ('undefined' == typeof module) {
        var module = {
            exports: {}
        }, exports = module.exports
    }

    /**
     * Exports.
     */

    module.exports = expect;
    expect.Assertion = Assertion;

    /**
     * Exports version.
     */

    expect.version = '0.1.2';

    /**
     * Possible assertion flags.
     */

    var flags = {
        not: ['to', 'be', 'have', 'include', 'only'],
        to: ['be', 'have', 'include', 'only', 'not'],
        only: ['have'],
        have: ['own'],
        be: ['an']
    };

    function expect(obj) {
        return new Assertion(obj);
    }

    /**
     * Constructor
     *
     * @api private
     */

    function Assertion(obj, flag, parent) {
        this.obj = obj;
        this.flags = {};

        if (undefined != parent) {
            this.flags[flag] = true;

            for (var i in parent.flags) {
                if (parent.flags.hasOwnProperty(i)) {
                    this.flags[i] = true;
                }
            }
        }

        var $flags = flag ? flags[flag] : keys(flags),
            self = this

        if ($flags) {
            for (var i = 0, l = $flags.length; i < l; i++) {
                // avoid recursion
                if (this.flags[$flags[i]]) continue;

                var name = $flags[i],
                    assertion = new Assertion(this.obj, name, this)

                    if ('function' == typeof Assertion.prototype[name]) {
                        // clone the function, make sure we dont touch the prot reference
                        var old = this[name];
                        this[name] = function() {
                            return old.apply(self, arguments);
                        }

                        for (var fn in Assertion.prototype) {
                            if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {
                                this[name][fn] = bind(assertion[fn], assertion);
                            }
                        }
                    } else {
                        this[name] = assertion;
                    }
            }
        }
    };

    /**
     * Performs an assertion
     *
     * @api private
     */

    Assertion.prototype.assert = function(truth, msg, error) {
        var msg = this.flags.not ? error : msg,
            ok = this.flags.not ? !truth : truth;

        if (!ok) {
            throw new Error(msg);
        }

        this.and = new Assertion(this.obj);
    };

    /**
     * Check if the value is truthy
     *
     * @api public
     */

    Assertion.prototype.ok = function() {
        this.assert( !! this.obj, 'expected ' + i(this.obj) + ' to be truthy', 'expected ' + i(this.obj) + ' to be falsy');
    };

    /**
     * Assert that the function throws.
     *
     * @param {Function|RegExp} callback, or regexp to match error string against
     * @api public
     */

    Assertion.prototype.throwError =
        Assertion.prototype.throwException = function(fn) {
            expect(this.obj).to.be.a('function');

            var thrown = false,
                not = this.flags.not

            try {
                this.obj();
            } catch (e) {
                if ('function' == typeof fn) {
                    fn(e);
                } else if ('object' == typeof fn) {
                    var subject = 'string' == typeof e ? e : e.message;
                    if (not) {
                        expect(subject).to.not.match(fn);
                    } else {
                        expect(subject).to.match(fn);
                    }
                }
                thrown = true;
            }

            if ('object' == typeof fn && not) {
                // in the presence of a matcher, ensure the `not` only applies to
                // the matching.
                this.flags.not = false;
            }

            var name = this.obj.name || 'fn';
            this.assert(
                thrown, 'expected ' + name + ' to throw an exception', 'expected ' + name + ' not to throw an exception');
    };

    /**
     * Checks if the array is empty.
     *
     * @api public
     */

    Assertion.prototype.empty = function() {
        var expectation;

        if ('object' == typeof this.obj && null !== this.obj && !isArray(this.obj)) {
            if ('number' == typeof this.obj.length) {
                expectation = !this.obj.length;
            } else {
                expectation = !keys(this.obj).length;
            }
        } else {
            if ('string' != typeof this.obj) {
                expect(this.obj).to.be.an('object');
            }

            expect(this.obj).to.have.property('length');
            expectation = !this.obj.length;
        }

        this.assert(
            expectation, 'expected ' + i(this.obj) + ' to be empty', 'expected ' + i(this.obj) + ' to not be empty');
        return this;
    };

    /**
     * Checks if the obj exactly equals another.
     *
     * @api public
     */

    Assertion.prototype.be =
        Assertion.prototype.equal = function(obj) {
            this.assert(
                obj === this.obj, 'expected ' + i(this.obj) + ' to equal ' + i(obj), 'expected ' + i(this.obj) + ' to not equal ' + i(obj));
            return this;
    };

    /**
     * Checks if the obj sortof equals another.
     *
     * @api public
     */

    Assertion.prototype.eql = function(obj) {
        this.assert(
            expect.eql(obj, this.obj), 'expected ' + i(this.obj) + ' to sort of equal ' + i(obj), 'expected ' + i(this.obj) + ' to sort of not equal ' + i(obj));
        return this;
    };

    /**
     * Assert within start to finish (inclusive).
     *
     * @param {Number} start
     * @param {Number} finish
     * @api public
     */

    Assertion.prototype.within = function(start, finish) {
        var range = start + '..' + finish;
        this.assert(
            this.obj >= start && this.obj <= finish, 'expected ' + i(this.obj) + ' to be within ' + range, 'expected ' + i(this.obj) + ' to not be within ' + range);
        return this;
    };

    /**
     * Assert typeof / instance of
     *
     * @api public
     */

    Assertion.prototype.a =
        Assertion.prototype.an = function(type) {
            if ('string' == typeof type) {
                // proper english in error msg
                var n = /^[aeiou]/.test(type) ? 'n' : '';

                // typeof with support for 'array'
                this.assert(
                    'array' == type ? isArray(this.obj) :
                    'object' == type ? 'object' == typeof this.obj && null !== this.obj : type == typeof this.obj, 'expected ' + i(this.obj) + ' to be a' + n + ' ' + type, 'expected ' + i(this.obj) + ' not to be a' + n + ' ' + type);
            } else {
                // instanceof
                var name = type.name || 'supplied constructor';
                this.assert(
                    this.obj instanceof type, 'expected ' + i(this.obj) + ' to be an instance of ' + name, 'expected ' + i(this.obj) + ' not to be an instance of ' + name);
            }

            return this;
    };

    /**
     * Assert numeric value above _n_.
     *
     * @param {Number} n
     * @api public
     */

    Assertion.prototype.greaterThan =
        Assertion.prototype.above = function(n) {
            this.assert(
                this.obj > n, 'expected ' + i(this.obj) + ' to be above ' + n, 'expected ' + i(this.obj) + ' to be below ' + n);
            return this;
    };

    /**
     * Assert numeric value below _n_.
     *
     * @param {Number} n
     * @api public
     */

    Assertion.prototype.lessThan =
        Assertion.prototype.below = function(n) {
            this.assert(
                this.obj < n, 'expected ' + i(this.obj) + ' to be below ' + n, 'expected ' + i(this.obj) + ' to be above ' + n);
            return this;
    };

    /**
     * Assert string value matches _regexp_.
     *
     * @param {RegExp} regexp
     * @api public
     */

    Assertion.prototype.match = function(regexp) {
        this.assert(
            regexp.exec(this.obj), 'expected ' + i(this.obj) + ' to match ' + regexp, 'expected ' + i(this.obj) + ' not to match ' + regexp);
        return this;
    };

    /**
     * Assert property "length" exists and has value of _n_.
     *
     * @param {Number} n
     * @api public
     */

    Assertion.prototype.length = function(n) {
        expect(this.obj).to.have.property('length');
        var len = this.obj.length;
        this.assert(
            n == len, 'expected ' + i(this.obj) + ' to have a length of ' + n + ' but got ' + len, 'expected ' + i(this.obj) + ' to not have a length of ' + len);
        return this;
    };

    /**
     * Assert property _name_ exists, with optional _val_.
     *
     * @param {String} name
     * @param {Mixed} val
     * @api public
     */

    Assertion.prototype.property = function(name, val) {
        if (this.flags.own) {
            this.assert(
                Object.prototype.hasOwnProperty.call(this.obj, name), 'expected ' + i(this.obj) + ' to have own property ' + i(name), 'expected ' + i(this.obj) + ' to not have own property ' + i(name));
            return this;
        }

        if (this.flags.not && undefined !== val) {
            if (undefined === this.obj[name]) {
                throw new Error(i(this.obj) + ' has no property ' + i(name));
            }
        } else {
            var hasProp;
            try {
                hasProp = name in this.obj
            } catch (e) {
                hasProp = undefined !== this.obj[name]
            }

            this.assert(
                hasProp, 'expected ' + i(this.obj) + ' to have a property ' + i(name), 'expected ' + i(this.obj) + ' to not have a property ' + i(name));
        }

        if (undefined !== val) {
            this.assert(
                val === this.obj[name], 'expected ' + i(this.obj) + ' to have a property ' + i(name) + ' of ' + i(val) + ', but got ' + i(this.obj[name]), 'expected ' + i(this.obj) + ' to not have a property ' + i(name) + ' of ' + i(val));
        }

        this.obj = this.obj[name];
        return this;
    };

    /**
     * Assert that the array contains _obj_ or string contains _obj_.
     *
     * @param {Mixed} obj|string
     * @api public
     */

    Assertion.prototype.string =
        Assertion.prototype.contain = function(obj) {
            if ('string' == typeof this.obj) {
                this.assert(~this.obj.indexOf(obj), 'expected ' + i(this.obj) + ' to contain ' + i(obj), 'expected ' + i(this.obj) + ' to not contain ' + i(obj));
            } else {
                this.assert(~indexOf(this.obj, obj), 'expected ' + i(this.obj) + ' to contain ' + i(obj), 'expected ' + i(this.obj) + ' to not contain ' + i(obj));
            }
            return this;
    };

    /**
     * Assert exact keys or inclusion of keys by using
     * the `.own` modifier.
     *
     * @param {Array|String ...} keys
     * @api public
     */

    Assertion.prototype.key =
        Assertion.prototype.keys = function($keys) {
            var str, ok = true;

            $keys = isArray($keys) ? $keys : Array.prototype.slice.call(arguments);

            if (!$keys.length) throw new Error('keys required');

            var actual = keys(this.obj),
                len = $keys.length;

            // Inclusion
            ok = every($keys, function(key) {
                return~ indexOf(actual, key);
            });

            // Strict
            if (!this.flags.not && this.flags.only) {
                ok = ok && $keys.length == actual.length;
            }

            // Key string
            if (len > 1) {
                $keys = map($keys, function(key) {
                    return i(key);
                });
                var last = $keys.pop();
                str = $keys.join(', ') + ', and ' + last;
            } else {
                str = i($keys[0]);
            }

            // Form
            str = (len > 1 ? 'keys ' : 'key ') + str;

            // Have / include
            str = (!this.flags.only ? 'include ' : 'only have ') + str;

            // Assertion
            this.assert(
                ok, 'expected ' + i(this.obj) + ' to ' + str, 'expected ' + i(this.obj) + ' to not ' + str);

            return this;
    };

    /**
     * Function bind implementation.
     */

    function bind(fn, scope) {
        return function() {
            return fn.apply(scope, arguments);
        }
    }

    /**
     * Array every compatibility
     *
     * @see bit.ly/5Fq1N2
     * @api public
     */

    function every(arr, fn, thisObj) {
        var scope = thisObj || global;
        for (var i = 0, j = arr.length; i < j; ++i) {
            if (!fn.call(scope, arr[i], i, arr)) {
                return false;
            }
        }
        return true;
    };

    /**
     * Array indexOf compatibility.
     *
     * @see bit.ly/a5Dxa2
     * @api public
     */

    function indexOf(arr, o, i) {
        if (Array.prototype.indexOf) {
            return Array.prototype.indexOf.call(arr, o, i);
        }

        if (arr.length === undefined) {
            return -1;
        }

        for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0; i < j && arr[i] !== o; i++);

        return j <= i ? -1 : i;
    };

    /**
     * Inspects an object.
     *
     * @see taken from node.js `util` module (copyright Joyent, MIT license)
     * @api private
     */

    function i(obj, showHidden, depth) {
        var seen = [];

        function stylize(str) {
            return str;
        };

        function format(value, recurseTimes) {
            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (value && typeof value.inspect === 'function' &&
                // Filter out the util module, it's inspect function is special
                value !== exports &&
                // Also filter out any prototype objects using the circular check.
                !(value.constructor && value.constructor.prototype === value)) {
                return value.inspect(recurseTimes);
            }

            // Primitive types cannot have properties
            switch (typeof value) {
                case 'undefined':
                    return stylize('undefined', 'undefined');

                case 'string':
                    var simple = '\'' + json.stringify(value).replace(/^"|"$/g, '')
                        .replace(/'/g, "\\'")
                        .replace(/\\"/g, '"') + '\'';
                    return stylize(simple, 'string');

                case 'number':
                    return stylize('' + value, 'number');

                case 'boolean':
                    return stylize('' + value, 'boolean');
            }
            // For some reason typeof null is "object", so special case here.
            if (value === null) {
                return stylize('null', 'null');
            }

            // Look up the keys of the object.
            var visible_keys = keys(value);
            var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;

            // Functions without properties can be shortcutted.
            if (typeof value === 'function' && $keys.length === 0) {
                if (isRegExp(value)) {
                    return stylize('' + value, 'regexp');
                } else {
                    var name = value.name ? ': ' + value.name : '';
                    return stylize('[Function' + name + ']', 'special');
                }
            }

            // Dates without properties can be shortcutted
            if (isDate(value) && $keys.length === 0) {
                return stylize(value.toUTCString(), 'date');
            }

            var base, type, braces;
            // Determine the object type
            if (isArray(value)) {
                type = 'Array';
                braces = ['[', ']'];
            } else {
                type = 'Object';
                braces = ['{', '}'];
            }

            // Make functions say that they are functions
            if (typeof value === 'function') {
                var n = value.name ? ': ' + value.name : '';
                base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
            } else {
                base = '';
            }

            // Make dates with properties first say the date
            if (isDate(value)) {
                base = ' ' + value.toUTCString();
            }

            if ($keys.length === 0) {
                return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
                if (isRegExp(value)) {
                    return stylize('' + value, 'regexp');
                } else {
                    return stylize('[Object]', 'special');
                }
            }

            seen.push(value);

            var output = map($keys, function(key) {
                var name, str;
                if (value.__lookupGetter__) {
                    if (value.__lookupGetter__(key)) {
                        if (value.__lookupSetter__(key)) {
                            str = stylize('[Getter/Setter]', 'special');
                        } else {
                            str = stylize('[Getter]', 'special');
                        }
                    } else {
                        if (value.__lookupSetter__(key)) {
                            str = stylize('[Setter]', 'special');
                        }
                    }
                }
                if (indexOf(visible_keys, key) < 0) {
                    name = '[' + key + ']';
                }
                if (!str) {
                    if (indexOf(seen, value[key]) < 0) {
                        if (recurseTimes === null) {
                            str = format(value[key]);
                        } else {
                            str = format(value[key], recurseTimes - 1);
                        }
                        if (str.indexOf('\n') > -1) {
                            if (isArray(value)) {
                                str = map(str.split('\n'), function(line) {
                                    return '  ' + line;
                                }).join('\n').substr(2);
                            } else {
                                str = '\n' + map(str.split('\n'), function(line) {
                                    return '   ' + line;
                                }).join('\n');
                            }
                        }
                    } else {
                        str = stylize('[Circular]', 'special');
                    }
                }
                if (typeof name === 'undefined') {
                    if (type === 'Array' && key.match(/^\d+$/)) {
                        return str;
                    }
                    name = json.stringify('' + key);
                    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                        name = name.substr(1, name.length - 2);
                        name = stylize(name, 'name');
                    } else {
                        name = name.replace(/'/g, "\\'")
                            .replace(/\\"/g, '"')
                            .replace(/(^"|"$)/g, "'");
                        name = stylize(name, 'string');
                    }
                }

                return name + ': ' + str;
            });

            seen.pop();

            var numLinesEst = 0;
            var length = reduce(output, function(prev, cur) {
                numLinesEst++;
                if (indexOf(cur, '\n') >= 0) numLinesEst++;
                return prev + cur.length + 1;
            }, 0);

            if (length > 50) {
                output = braces[0] +
                    (base === '' ? '' : base + '\n ') +
                    ' ' +
                    output.join(',\n  ') +
                    ' ' +
                    braces[1];

            } else {
                output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
            }

            return output;
        }
        return format(obj, (typeof depth === 'undefined' ? 2 : depth));
    };

    function isArray(ar) {
        return Object.prototype.toString.call(ar) == '[object Array]';
    };

    function isRegExp(re) {
        var s = '' + re;
        return re instanceof RegExp || // easy case
        // duck-type for context-switching evalcx case
        typeof(re) === 'function' &&
            re.constructor.name === 'RegExp' &&
            re.compile &&
            re.test &&
            re.exec &&
            s.match(/^\/.*\/[gim]{0,3}$/);
    };

    function isDate(d) {
        if (d instanceof Date) return true;
        return false;
    };

    function keys(obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }

        var keys = [];

        for (var i in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, i)) {
                keys.push(i);
            }
        }

        return keys;
    }

    function map(arr, mapper, that) {
        if (Array.prototype.map) {
            return Array.prototype.map.call(arr, mapper, that);
        }

        var other = new Array(arr.length);

        for (var i = 0, n = arr.length; i < n; i++)
            if (i in arr)
                other[i] = mapper.call(that, arr[i], i, arr);

        return other;
    };

    function reduce(arr, fun) {
        if (Array.prototype.reduce) {
            return Array.prototype.reduce.apply(
                arr, Array.prototype.slice.call(arguments, 1)
            );
        }

        var len = +this.length;

        if (typeof fun !== "function")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1)
            throw new TypeError();

        var i = 0;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= len)
                    throw new TypeError();
            } while (true);
        }

        for (; i < len; i++) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };

    /**
     * Asserts deep equality
     *
     * @see taken from node.js `assert` module (copyright Joyent, MIT license)
     * @api private
     */

    expect.eql = function eql(actual, expected) {
        // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
            return true;
        } else if ('undefined' != typeof Buffer && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
            if (actual.length != expected.length) return false;

            for (var i = 0; i < actual.length; i++) {
                if (actual[i] !== expected[i]) return false;
            }

            return true;

            // 7.2. If the expected value is a Date object, the actual value is
            // equivalent if it is also a Date object that refers to the same time.
        } else if (actual instanceof Date && expected instanceof Date) {
            return actual.getTime() === expected.getTime();

            // 7.3. Other pairs that do not both pass typeof value == "object",
            // equivalence is determined by ==.
        } else if (typeof actual != 'object' && typeof expected != 'object') {
            return actual == expected;

            // 7.4. For all other Object pairs, including Array objects, equivalence is
            // determined by having the same number of owned properties (as verified
            // with Object.prototype.hasOwnProperty.call), the same set of keys
            // (although not necessarily the same order), equivalent values for every
            // corresponding key, and an identical "prototype" property. Note: this
            // accounts for both named and indexed properties on Arrays.
        } else {
            return objEquiv(actual, expected);
        }
    }

    function isUndefinedOrNull(value) {
        return value === null || value === undefined;
    }

    function isArguments(object) {
        return Object.prototype.toString.call(object) == '[object Arguments]';
    }

    function objEquiv(a, b) {
        if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
            return false;
        // an identical "prototype" property.
        if (a.prototype !== b.prototype) return false;
        //~~~I've managed to break Object.keys through screwy arguments passing.
        //   Converting to array solves the problem.
        if (isArguments(a)) {
            if (!isArguments(b)) {
                return false;
            }
            a = pSlice.call(a);
            b = pSlice.call(b);
            return expect.eql(a, b);
        }
        try {
            var ka = keys(a),
                kb = keys(b),
                key, i;
        } catch (e) { //happens when one is a string literal and the other isn't
            return false;
        }
        // having the same number of owned properties (keys incorporates hasOwnProperty)
        if (ka.length != kb.length)
            return false;
        //the same set of keys (although not necessarily the same order),
        ka.sort();
        kb.sort();
        //~~~cheap key test
        for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i])
                return false;
        }
        //equivalent values for every corresponding key, and
        //~~~possibly expensive deep test
        for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i];
            if (!expect.eql(a[key], b[key]))
                return false;
        }
        return true;
    }

    var json = (function() {
        "use strict";

        if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
            return {
                parse: nativeJSON.parse,
                stringify: nativeJSON.stringify
            }
        }

        var JSON = {};

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        function date(d, key) {
            return isFinite(d.valueOf()) ?
                d.getUTCFullYear() + '-' +
                f(d.getUTCMonth() + 1) + '-' +
                f(d.getUTCDate()) + 'T' +
                f(d.getUTCHours()) + ':' +
                f(d.getUTCMinutes()) + ':' +
                f(d.getUTCSeconds()) + 'Z' : null;
        };

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = { // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }


        function str(key, holder) {

            // Produce a string from holder[key].

            var i, // The loop counter.
                k, // The member key.
                v, // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.

            if (value instanceof Date) {
                value = date(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.

            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':

                    // JSON numbers must be finite. Encode non-finite numbers as null.

                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':

                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce 'null'. The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                    // If the type is 'object', we might be dealing with an object or an array or
                    // null.

                case 'object':

                    // Due to a specification blunder in ECMAScript, typeof null is 'object',
                    // so watch out for that case.

                    if (!value) {
                        return 'null';
                    }

                    // Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

                    // Is the value an array?

                    if (Object.prototype.toString.apply(value) === '[object Array]') {

                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.

                        v = partial.length === 0 ? '[]' : gap ?
                            '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                            '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

                    // If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {

                        // Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.

                    v = partial.length === 0 ? '{}' : gap ?
                        '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                        '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        }

        // If the JSON object does not yet have a stringify method, give it one.

        JSON.stringify = function(value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', {
                '': value
            });
        };

        // If the JSON object does not yet have a parse method, give it one.

        JSON.parse = function(text, reviver) {
            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({
                        '': j
                    }, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };

        return JSON;
    })();

    if ('undefined' != typeof window) {
        window.expect = module.exports;
    }

})(
    this, 'undefined' != typeof module ? module : {}, 'undefined' != typeof exports ? exports : {}
);

}).call(this,require("buffer").Buffer)
},{"buffer":3}],7:[function(require,module,exports){
/*jshint -W079 */
    var firstFactorial  = require("../../../katas/factorial/factorial.js");
          expect = require("../../helpers/expect.js");

describe("Factorial", function() {
  it("It will give you the factorial of number ",function() {
    expect(firstFactorial(4)).to.be(24);
  });
  it("should give you 1 if you pass in 0 or any other data type ", function() {
    expect(firstFactorial({})).to.be(1)
    expect(firstFactorial(0)).to.be(1)
  });
});

},{"../../../katas/factorial/factorial.js":1,"../../helpers/expect.js":6}],8:[function(require,module,exports){
/*jshint -W079 */
var firstReverse = require("../../../katas/first_reverse/first_reverse.js");
var expect = require("../../helpers/expect.js");

describe('First Reverse', function() {
    it('should reverse a string', function() {
        expect(firstReverse("Hello")).to.be("olleH");
    });
    it("should fail if its given anything but a string", function() {
        expect(firstReverse({})).to.be("Please call with strings");
    });

});

},{"../../../katas/first_reverse/first_reverse.js":2,"../../helpers/expect.js":6}]},{},[7,8]);