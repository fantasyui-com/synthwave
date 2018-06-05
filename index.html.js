// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({5:[function(require,module,exports) {

},{}],6:[function(require,module,exports) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],7:[function(require,module,exports) {
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],8:[function(require,module,exports) {
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],4:[function(require,module,exports) {

var global = arguments[3];
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

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
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
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
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
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

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
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

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":6,"ieee754":7,"isarray":8,"buffer":4}],2:[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
var fs = require('fs');
var database = JSON.parse(Buffer('ewoibWV0YSI6IHsKICAibmFtZSI6ICJzeW50aHdhdmUiCn0sCgoiZGF0YSI6IFsKICB7CiAgICAiaWQiOiAiYSIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjREUxMkU1IiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzNCMDAwOCIsCiAgICAgICAgInBvc2l0aW9uIjogIjI5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNTMyNDA4IiwKICAgICAgICAicG9zaXRpb24iOiAiMzAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFNUJDN0MiLAogICAgICAgICJwb3NpdGlvbiI6ICIzMSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0Y0Qzk2QSIsCiAgICAgICAgInBvc2l0aW9uIjogIjQwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjQ5NjUzIiwKICAgICAgICAicG9zaXRpb24iOiAiNTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGNDMwN0YiLAogICAgICAgICJwb3NpdGlvbiI6ICI3MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzU4MDgzRCIsCiAgICAgICAgInBvc2l0aW9uIjogIjc0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjQzMDdGIiwKICAgICAgICAicG9zaXRpb24iOiAiNzklIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM1ODA4M0QiLAogICAgICAgICJwb3NpdGlvbiI6ICI5MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzNBMDAyOSIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJiIiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiM1RDFCNTgiLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNDgwMDNBIiwKICAgICAgICAicG9zaXRpb24iOiAiNyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0JDMzY3RCIsCiAgICAgICAgInBvc2l0aW9uIjogIjE1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNjIwMDQzIiwKICAgICAgICAicG9zaXRpb24iOiAiMjYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFNzM2N0UiLAogICAgICAgICJwb3NpdGlvbiI6ICIyNyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0YwMjk2QyIsCiAgICAgICAgInBvc2l0aW9uIjogIjMzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMkUwMDMxIiwKICAgICAgICAicG9zaXRpb24iOiAiNDYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFQzI3NUYiLAogICAgICAgICJwb3NpdGlvbiI6ICI0NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0ZGMkJENCIsCiAgICAgICAgInBvc2l0aW9uIjogIjU0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRDkyRjYwIiwKICAgICAgICAicG9zaXRpb24iOiAiNjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM0QzAwMzAiLAogICAgICAgICJwb3NpdGlvbiI6ICI2MSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0EyMjk1RSIsCiAgICAgICAgInBvc2l0aW9uIjogIjg1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMUQwNzM4IiwKICAgICAgICAicG9zaXRpb24iOiAiODclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxMTA4M0YiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMDAlIgogICAgICB9CiAgICBdCiAgfSwKICB7CiAgICAiaWQiOiAiYyIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjMDQwMDAzIiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzk4NDk5OCIsCiAgICAgICAgInBvc2l0aW9uIjogIjE4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNTAyMTI5IiwKICAgICAgICAicG9zaXRpb24iOiAiMTklIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM4RTI4M0QiLAogICAgICAgICJwb3NpdGlvbiI6ICIyMSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzNBMDQxMSIsCiAgICAgICAgInBvc2l0aW9uIjogIjM1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNkQyNzYzIiwKICAgICAgICAicG9zaXRpb24iOiAiMzYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNEODRFOUMiLAogICAgICAgICJwb3NpdGlvbiI6ICIzNyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzk4NDk5OCIsCiAgICAgICAgInBvc2l0aW9uIjogIjQzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRDg0RTlDIiwKICAgICAgICAicG9zaXRpb24iOiAiNDQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyRjBDMTAiLAogICAgICAgICJwb3NpdGlvbiI6ICI0NiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzcyNzVCQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjUyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNzJBNkVBIiwKICAgICAgICAicG9zaXRpb24iOiAiNTMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxODQ1NkYiLAogICAgICAgICJwb3NpdGlvbiI6ICI2NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzg1QjRGMiIsCiAgICAgICAgInBvc2l0aW9uIjogIjY4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNkE5MEJEIiwKICAgICAgICAicG9zaXRpb24iOiAiNzQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM1NTg5QkIiLAogICAgICAgICJwb3NpdGlvbiI6ICI4MSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzRDN0ZBRSIsCiAgICAgICAgInBvc2l0aW9uIjogIjg3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNDE3NUE1IiwKICAgICAgICAicG9zaXRpb24iOiAiOTQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxODQ1NkYiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMDAlIgogICAgICB9CiAgICBdCiAgfSwKICB7CiAgICAiaWQiOiAiZCIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjMkQ0OENCIiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzM1NTFDRSIsCiAgICAgICAgInBvc2l0aW9uIjogIjQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM1MjcxRTMiLAogICAgICAgICJwb3NpdGlvbiI6ICIxNiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0M1RDNGRiIsCiAgICAgICAgInBvc2l0aW9uIjogIjE3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTRBREYyIiwKICAgICAgICAicG9zaXRpb24iOiAiMjUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyQTM3QTEiLAogICAgICAgICJwb3NpdGlvbiI6ICIyNiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzJFMzVBQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjMwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNkMxNzk2IiwKICAgICAgICAicG9zaXRpb24iOiAiNDclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNCNjQwQkIiLAogICAgICAgICJwb3NpdGlvbiI6ICI0OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0Q1NEJBMyIsCiAgICAgICAgInBvc2l0aW9uIjogIjU4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRUY3M0M5IiwKICAgICAgICAicG9zaXRpb24iOiAiNjElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNCODQ3NzMiLAogICAgICAgICJwb3NpdGlvbiI6ICI2MiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzlEMkY3MCIsCiAgICAgICAgInBvc2l0aW9uIjogIjg2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQjM0RDk3IiwKICAgICAgICAicG9zaXRpb24iOiAiODclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFMDZGOEYiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMDAlIgogICAgICB9CiAgICBdCiAgfSwKICB7CiAgICAiaWQiOiAiZSIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjMTIyRkE2IiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzRBMDkyQiIsCiAgICAgICAgInBvc2l0aW9uIjogIjklIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGOEUyNTkiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzhCMEExRSIsCiAgICAgICAgInBvc2l0aW9uIjogIjI4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMjgwMDFBIiwKICAgICAgICAicG9zaXRpb24iOiAiMzAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzQjBCMUIiLAogICAgICAgICJwb3NpdGlvbiI6ICIzNCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0Y4RTI1OSIsCiAgICAgICAgInBvc2l0aW9uIjogIjM2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRUFEMzJFIiwKICAgICAgICAicG9zaXRpb24iOiAiNDglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNERTkwNDgiLAogICAgICAgICJwb3NpdGlvbiI6ICI1NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzM1MDEzMSIsCiAgICAgICAgInBvc2l0aW9uIjogIjU5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRDM0RTRBIiwKICAgICAgICAicG9zaXRpb24iOiAiNjUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNDODIxNUMiLAogICAgICAgICJwb3NpdGlvbiI6ICI3NCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0MxMTY1RCIsCiAgICAgICAgInBvc2l0aW9uIjogIjc4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMzUwMTMxIiwKICAgICAgICAicG9zaXRpb24iOiAiODElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM5MjBDNTgiLAogICAgICAgICJwb3NpdGlvbiI6ICI4NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzY3MDQ0NSIsCiAgICAgICAgInBvc2l0aW9uIjogIjkxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMTEwMDE5IiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0sCiAgewogICAgImlkIjogImYiLAogICAgInR5cGUiOiAibGluZWFyLWdyYWRpZW50IiwKICAgICJhbmdsZSI6ICIxNzJkZWciLAogICAgImdyYWRpZW50IjogW3sKICAgICAgICAiY29sb3IiOiAiI0VCNkIwRiIsCiAgICAgICAgInBvc2l0aW9uIjogIjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGRjExMTEiLAogICAgICAgICJwb3NpdGlvbiI6ICI0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQkUyOTEyIiwKICAgICAgICAicG9zaXRpb24iOiAiMTUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzRkE3RTMiLAogICAgICAgICJwb3NpdGlvbiI6ICIxNyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzIxRkZGRiIsCiAgICAgICAgInBvc2l0aW9uIjogIjI5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMUJBNkUxIiwKICAgICAgICAicG9zaXRpb24iOiAiMzAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxODM5OUUiLAogICAgICAgICJwb3NpdGlvbiI6ICIzMSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0UxM0ZCOSIsCiAgICAgICAgInBvc2l0aW9uIjogIjM5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRDUxNDBEIiwKICAgICAgICAicG9zaXRpb24iOiAiNDAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFNzQzQTUiLAogICAgICAgICJwb3NpdGlvbiI6ICI0MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0YwNjJCNyIsCiAgICAgICAgInBvc2l0aW9uIjogIjQ0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjA2MkI3IiwKICAgICAgICAicG9zaXRpb24iOiAiNzMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNENDE5MEMiLAogICAgICAgICJwb3NpdGlvbiI6ICI3NCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0ZGRDcxMSIsCiAgICAgICAgInBvc2l0aW9uIjogIjgxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkMwMEQ2IiwKICAgICAgICAicG9zaXRpb24iOiAiODIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBRTBFODYiLAogICAgICAgICJwb3NpdGlvbiI6ICI5NiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzgxMDU2OCIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJnIiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiM4RTJBRTIiLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMkUxNjhFIiwKICAgICAgICAicG9zaXRpb24iOiAiMTIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGRjlFMjgiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzQ3MTY1NCIsCiAgICAgICAgInBvc2l0aW9uIjogIjIyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNzQyNTkyIiwKICAgICAgICAicG9zaXRpb24iOiAiMjMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBNTI5QTMiLAogICAgICAgICJwb3NpdGlvbiI6ICI0OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzYyMjM4MCIsCiAgICAgICAgInBvc2l0aW9uIjogIjU3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMjgwODI2IiwKICAgICAgICAicG9zaXRpb24iOiAiNTglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM1NDFCNzkiLAogICAgICAgICJwb3NpdGlvbiI6ICI3NCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzVFMUY4QyIsCiAgICAgICAgInBvc2l0aW9uIjogIjgyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTQ1RURCIiwKICAgICAgICAicG9zaXRpb24iOiAiODMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyQjZCRDEiLAogICAgICAgICJwb3NpdGlvbiI6ICI4NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzhDM0FDQyIsCiAgICAgICAgInBvc2l0aW9uIjogIjkxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjODIyREJFIiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0sCiAgewogICAgImlkIjogImgiLAogICAgInR5cGUiOiAibGluZWFyLWdyYWRpZW50IiwKICAgICJhbmdsZSI6ICIxNzJkZWciLAogICAgImdyYWRpZW50IjogW3sKICAgICAgICAiY29sb3IiOiAiI0Y0MzRBQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxQzAyMEMiLAogICAgICAgICJwb3NpdGlvbiI6ICIyNiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0YwMjBDQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjI3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNjYwOTUxIiwKICAgICAgICAicG9zaXRpb24iOiAiNTElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFQzEwQkMiLAogICAgICAgICJwb3NpdGlvbiI6ICI1MiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzk5NTdGQiIsCiAgICAgICAgInBvc2l0aW9uIjogIjY1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMzYxMDVFIiwKICAgICAgICAicG9zaXRpb24iOiAiNjYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNDNTI0RkEiLAogICAgICAgICJwb3NpdGlvbiI6ICI4MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzEwMDMzRCIsCiAgICAgICAgInBvc2l0aW9uIjogIjg0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjOUUzQkZCIiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0sCiAgewogICAgImlkIjogImkiLAogICAgInR5cGUiOiAibGluZWFyLWdyYWRpZW50IiwKICAgICJhbmdsZSI6ICIxNzJkZWciLAogICAgImdyYWRpZW50IjogW3sKICAgICAgICAiY29sb3IiOiAiIzlGQTRGNiIsCiAgICAgICAgInBvc2l0aW9uIjogIjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMwOTIxMUYiLAogICAgICAgICJwb3NpdGlvbiI6ICI5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNzc4OEU0IiwKICAgICAgICAicG9zaXRpb24iOiAiMTAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM2RkM1RTQiLAogICAgICAgICJwb3NpdGlvbiI6ICI0MSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0FEQTBGOCIsCiAgICAgICAgInBvc2l0aW9uIjogIjQ1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTI1NEQwIiwKICAgICAgICAicG9zaXRpb24iOiAiNTglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxMTA2MkIiLAogICAgICAgICJwb3NpdGlvbiI6ICI1OSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzU2MTA4QyIsCiAgICAgICAgInBvc2l0aW9uIjogIjcyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjOTUxOUIxIiwKICAgICAgICAicG9zaXRpb24iOiAiNzMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM4MjBGQTIiLAogICAgICAgICJwb3NpdGlvbiI6ICI3NCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzYxMEM4RSIsCiAgICAgICAgInBvc2l0aW9uIjogIjgzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNDAwNzcyIiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0sCiAgewogICAgImlkIjogImoiLAogICAgInR5cGUiOiAibGluZWFyLWdyYWRpZW50IiwKICAgICJhbmdsZSI6ICIxNzJkZWciLAogICAgImdyYWRpZW50IjogW3sKICAgICAgICAiY29sb3IiOiAiIzM1QTdGRiIsCiAgICAgICAgInBvc2l0aW9uIjogIjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMwODA1MTYiLAogICAgICAgICJwb3NpdGlvbiI6ICIyOSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzA3M0JFRSIsCiAgICAgICAgInBvc2l0aW9uIjogIjMwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNzBBMEY0IiwKICAgICAgICAicG9zaXRpb24iOiAiMzElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNDMEQ4RkMiLAogICAgICAgICJwb3NpdGlvbiI6ICIzOSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0VDRjdGRCIsCiAgICAgICAgInBvc2l0aW9uIjogIjQ4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDAwMDBCIiwKICAgICAgICAicG9zaXRpb24iOiAiNTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3MjE2QTEiLAogICAgICAgICJwb3NpdGlvbiI6ICI2MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzA4MDUxNiIsCiAgICAgICAgInBvc2l0aW9uIjogIjY1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTcyMURBIiwKICAgICAgICAicG9zaXRpb24iOiAiNjclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM0RjEyNzkiLAogICAgICAgICJwb3NpdGlvbiI6ICI3OSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzA4MDUxNiIsCiAgICAgICAgInBvc2l0aW9uIjogIjgxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQjEyQkUyIiwKICAgICAgICAicG9zaXRpb24iOiAiOTYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNDNTQyRjciLAogICAgICAgICJwb3NpdGlvbiI6ICIxMDAlIgogICAgICB9CiAgICBdCiAgfSwKICB7CiAgICAiaWQiOiAiayIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjMDkwNjRCIiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzU4MUI3OCIsCiAgICAgICAgInBvc2l0aW9uIjogIjE3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDkwNjRCIiwKICAgICAgICAicG9zaXRpb24iOiAiMTglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3NzJEOEUiLAogICAgICAgICJwb3NpdGlvbiI6ICIyMiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzY0MUU4MCIsCiAgICAgICAgInBvc2l0aW9uIjogIjIzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNjYyNThCIiwKICAgICAgICAicG9zaXRpb24iOiAiMzAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyMTAwNTUiLAogICAgICAgICJwb3NpdGlvbiI6ICIzMSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzYxMjg5MyIsCiAgICAgICAgInBvc2l0aW9uIjogIjM1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMTEwOTUyIiwKICAgICAgICAicG9zaXRpb24iOiAiMzYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM0RDIyOEIiLAogICAgICAgICJwb3NpdGlvbiI6ICIzOSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzU1NDA5RiIsCiAgICAgICAgInBvc2l0aW9uIjogIjQyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNUE1NEFBIiwKICAgICAgICAicG9zaXRpb24iOiAiNDglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3QjZCRDYiLAogICAgICAgICJwb3NpdGlvbiI6ICI1MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzM4M0E4NSIsCiAgICAgICAgInBvc2l0aW9uIjogIjUxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMzEzNDdCIiwKICAgICAgICAicG9zaXRpb24iOiAiNTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxMTA5NTIiLAogICAgICAgICJwb3NpdGlvbiI6ICI1OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzQ4NDA4QiIsCiAgICAgICAgInBvc2l0aW9uIjogIjY3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMzIyMjM4IiwKICAgICAgICAicG9zaXRpb24iOiAiNjglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGNTgwQUYiLAogICAgICAgICJwb3NpdGlvbiI6ICI2OSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzlFMjk4NyIsCiAgICAgICAgInBvc2l0aW9uIjogIjc1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRDM1NDlEIiwKICAgICAgICAicG9zaXRpb24iOiAiNzYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGOEExQjQiLAogICAgICAgICJwb3NpdGlvbiI6ICI4NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0I3NUE5MyIsCiAgICAgICAgInBvc2l0aW9uIjogIjg4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjNBNkI4IiwKICAgICAgICAicG9zaXRpb24iOiAiOTMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNCRjY4OTMiLAogICAgICAgICJwb3NpdGlvbiI6ICI5NCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzE0MDY1NSIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJsIiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiNBM0RDQ0IiLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNTU4RTg4IiwKICAgICAgICAicG9zaXRpb24iOiAiNCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzJFNjc4NCIsCiAgICAgICAgInBvc2l0aW9uIjogIjEzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjM0Y3NzhFIiwKICAgICAgICAicG9zaXRpb24iOiAiMTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzOTYzODciLAogICAgICAgICJwb3NpdGlvbiI6ICIyMiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzI1MzU3MyIsCiAgICAgICAgInBvc2l0aW9uIjogIjI2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNEQ1MDk3IiwKICAgICAgICAicG9zaXRpb24iOiAiMjclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyODJBNjUiLAogICAgICAgICJwb3NpdGlvbiI6ICIzNSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzUxNjE5QyIsCiAgICAgICAgInBvc2l0aW9uIjogIjM2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNTY4NUNCIiwKICAgICAgICAicG9zaXRpb24iOiAiNDMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3NUFGRUYiLAogICAgICAgICJwb3NpdGlvbiI6ICI0OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzdGQUVEQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjUyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTZDOEY4IiwKICAgICAgICAicG9zaXRpb24iOiAiNTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxMTFDMzgiLAogICAgICAgICJwb3NpdGlvbiI6ICI1OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzYyNzlBRCIsCiAgICAgICAgInBvc2l0aW9uIjogIjcwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRTFEM0ZGIiwKICAgICAgICAicG9zaXRpb24iOiAiNzglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3QTJDODIiLAogICAgICAgICJwb3NpdGlvbiI6ICI3OSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0VGNkVFQiIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJtIiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiNDMTE1RDciLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQjUxMEQ2IiwKICAgICAgICAicG9zaXRpb24iOiAiNCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzU0MDEwMSIsCiAgICAgICAgInBvc2l0aW9uIjogIjUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGQ0ExMEYiLAogICAgICAgICJwb3NpdGlvbiI6ICIxOCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0ZGRDgyRCIsCiAgICAgICAgInBvc2l0aW9uIjogIjIxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkNBMTBGIiwKICAgICAgICAicG9zaXRpb24iOiAiMjQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMwNTI1M0QiLAogICAgICAgICJwb3NpdGlvbiI6ICIyNSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzBFNUJDRSIsCiAgICAgICAgInBvc2l0aW9uIjogIjM1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjM0M4RkNBIiwKICAgICAgICAicG9zaXRpb24iOiAiNDMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3OUJGRTAiLAogICAgICAgICJwb3NpdGlvbiI6ICI0NSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzA5MEQ2RCIsCiAgICAgICAgInBvc2l0aW9uIjogIjQ2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDAwMDAyIiwKICAgICAgICAicG9zaXRpb24iOiAiNTYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzQjNGQTkiLAogICAgICAgICJwb3NpdGlvbiI6ICI2MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzJEQkNGRiIsCiAgICAgICAgInBvc2l0aW9uIjogIjYxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMzE4QUQzIiwKICAgICAgICAicG9zaXRpb24iOiAiNzMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxM0E3RjciLAogICAgICAgICJwb3NpdGlvbiI6ICI3NCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzM1MjMxMyIsCiAgICAgICAgInBvc2l0aW9uIjogIjc1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjI5QzVBIiwKICAgICAgICAicG9zaXRpb24iOiAiOTElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGQzQxMUMiLAogICAgICAgICJwb3NpdGlvbiI6ICI5MiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0YyOUM1QSIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJuIiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiMzNDE3NUEiLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNEEzQUE1IiwKICAgICAgICAicG9zaXRpb24iOiAiOCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzYxMjlBOCIsCiAgICAgICAgInBvc2l0aW9uIjogIjE2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMEQwNjExIiwKICAgICAgICAicG9zaXRpb24iOiAiMTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyODExMzMiLAogICAgICAgICJwb3NpdGlvbiI6ICIyOSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzY2MUQ4NiIsCiAgICAgICAgInBvc2l0aW9uIjogIjMwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjOEI3NENDIiwKICAgICAgICAicG9zaXRpb24iOiAiMzklIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM4NDU4QUQiLAogICAgICAgICJwb3NpdGlvbiI6ICI0MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzg0NThBRCIsCiAgICAgICAgInBvc2l0aW9uIjogIjQ3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjOUE1MUJBIiwKICAgICAgICAicG9zaXRpb24iOiAiNTIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNCNTVFRDMiLAogICAgICAgICJwb3NpdGlvbiI6ICI1NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0Q2MkNDMiIsCiAgICAgICAgInBvc2l0aW9uIjogIjYwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQkQ5REYyIiwKICAgICAgICAicG9zaXRpb24iOiAiNjElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBOTNCQzIiLAogICAgICAgICJwb3NpdGlvbiI6ICI2NSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzQ3MUU1OCIsCiAgICAgICAgInBvc2l0aW9uIjogIjY2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjODg3MERFIiwKICAgICAgICAicG9zaXRpb24iOiAiNzAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxNTA5MUMiLAogICAgICAgICJwb3NpdGlvbiI6ICI3MSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzI4MTEzMyIsCiAgICAgICAgInBvc2l0aW9uIjogIjgyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTU5N0UyIiwKICAgICAgICAicG9zaXRpb24iOiAiODMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM1MzMwNzQiLAogICAgICAgICJwb3NpdGlvbiI6ICI4NCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzNDMjE0QyIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJvIiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiNBQTEzMDgiLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDAwMDAwIiwKICAgICAgICAicG9zaXRpb24iOiAiMjElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM5RTIwOEQiLAogICAgICAgICJwb3NpdGlvbiI6ICIyMiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0QxNTFCQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjMwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjA4OUU0IiwKICAgICAgICAicG9zaXRpb24iOiAiNDglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGMUFERTgiLAogICAgICAgICJwb3NpdGlvbiI6ICI2MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0U4ODFBMyIsCiAgICAgICAgInBvc2l0aW9uIjogIjY0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTM0QzkzIiwKICAgICAgICAicG9zaXRpb24iOiAiNjUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzODBENDUiLAogICAgICAgICJwb3NpdGlvbiI6ICI2OSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzFBMDgyRSIsCiAgICAgICAgInBvc2l0aW9uIjogIjcwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDMxOTUyIiwKICAgICAgICAicG9zaXRpb24iOiAiNzElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM0MUFBQUYiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMDAlIgogICAgICB9CiAgICBdCiAgfSwKICB7CiAgICAiaWQiOiAicCIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjMDAwMDAwIiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzExMDcwNyIsCiAgICAgICAgInBvc2l0aW9uIjogIjEzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjOTEyQjZGIiwKICAgICAgICAicG9zaXRpb24iOiAiMTQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGNzg1OEQiLAogICAgICAgICJwb3NpdGlvbiI6ICIyNiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0NCNEY3OCIsCiAgICAgICAgInBvc2l0aW9uIjogIjI3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNDQxNDJFIiwKICAgICAgICAicG9zaXRpb24iOiAiMzUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM0RkFBQzEiLAogICAgICAgICJwb3NpdGlvbiI6ICIzNiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzY5RTJFRiIsCiAgICAgICAgInBvc2l0aW9uIjogIjU3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMjc0Rjc3IiwKICAgICAgICAicG9zaXRpb24iOiAiNTglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxNDBCMzUiLAogICAgICAgICJwb3NpdGlvbiI6ICI3MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0Q3NzNBMCIsCiAgICAgICAgInBvc2l0aW9uIjogIjcxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRTM5MUJCIiwKICAgICAgICAicG9zaXRpb24iOiAiODglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNEMDZFQTkiLAogICAgICAgICJwb3NpdGlvbiI6ICI4OSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzAwMDAwMCIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJxIiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiMwMDAwMDAiLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDAwMDAwIiwKICAgICAgICAicG9zaXRpb24iOiAiMTQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFQzQwNUUiLAogICAgICAgICJwb3NpdGlvbiI6ICIxNSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0VDNDA1RSIsCiAgICAgICAgInBvc2l0aW9uIjogIjIxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMzEwNzMzIiwKICAgICAgICAicG9zaXRpb24iOiAiMjIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3NzExNzYiLAogICAgICAgICJwb3NpdGlvbiI6ICIzMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0RCMkM1RCIsCiAgICAgICAgInBvc2l0aW9uIjogIjMxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRUQzMTVBIiwKICAgICAgICAicG9zaXRpb24iOiAiNTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyQjBBNTQiLAogICAgICAgICJwb3NpdGlvbiI6ICI1OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzcxMTg3NiIsCiAgICAgICAgInBvc2l0aW9uIjogIjczJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjIzRDU0IiwKICAgICAgICAicG9zaXRpb24iOiAiNzQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNDMDM0NjkiLAogICAgICAgICJwb3NpdGlvbiI6ICI5NSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzMwMDgzRiIsCiAgICAgICAgInBvc2l0aW9uIjogIjk2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMzQxMDk2IiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0sCiAgewogICAgImlkIjogInIiLAogICAgInR5cGUiOiAibGluZWFyLWdyYWRpZW50IiwKICAgICJhbmdsZSI6ICIxNzJkZWciLAogICAgImdyYWRpZW50IjogW3sKICAgICAgICAiY29sb3IiOiAiI0JBQUMwQyIsCiAgICAgICAgInBvc2l0aW9uIjogIjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3RjMyMDUiLAogICAgICAgICJwb3NpdGlvbiI6ICI5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjODYwRTdFIiwKICAgICAgICAicG9zaXRpb24iOiAiMTAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM2NzA5ODkiLAogICAgICAgICJwb3NpdGlvbiI6ICIyMiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzRFMDQ5NCIsCiAgICAgICAgInBvc2l0aW9uIjogIjIzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNjgwQkI5IiwKICAgICAgICAicG9zaXRpb24iOiAiMjUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM5RDBFQzAiLAogICAgICAgICJwb3NpdGlvbiI6ICI0OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0ZGMTlDNSIsCiAgICAgICAgInBvc2l0aW9uIjogIjQ5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQkUxNEQ0IiwKICAgICAgICAicG9zaXRpb24iOiAiNTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzNjA3NzUiLAogICAgICAgICJwb3NpdGlvbiI6ICI1OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzdCMEI2NSIsCiAgICAgICAgInBvc2l0aW9uIjogIjY4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMTUwMDJCIiwKICAgICAgICAicG9zaXRpb24iOiAiNjklIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM4QzBFNzEiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMDAlIgogICAgICB9CiAgICBdCiAgfSwKICB7CiAgICAiaWQiOiAicyIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjNDMwMDg3IiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzYwMDJBMCIsCiAgICAgICAgInBvc2l0aW9uIjogIjEzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQzMxNkRBIiwKICAgICAgICAicG9zaXRpb24iOiAiMTQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNDNDU5QjciLAogICAgICAgICJwb3NpdGlvbiI6ICIzMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzI4MEMzNSIsCiAgICAgICAgInBvc2l0aW9uIjogIjMxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNzYyQzhCIiwKICAgICAgICAicG9zaXRpb24iOiAiNDAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBQTMwRDMiLAogICAgICAgICJwb3NpdGlvbiI6ICI0MSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzU1Mjc2OCIsCiAgICAgICAgInBvc2l0aW9uIjogIjU2JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTEyMkJEIiwKICAgICAgICAicG9zaXRpb24iOiAiNTclIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFNTQwNUUiLAogICAgICAgICJwb3NpdGlvbiI6ICI3MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzM5MzUzNCIsCiAgICAgICAgInBvc2l0aW9uIjogIjc0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDgwQTA4IiwKICAgICAgICAicG9zaXRpb24iOiAiNzUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyMDFFMUYiLAogICAgICAgICJwb3NpdGlvbiI6ICI5MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzU0NTI1MyIsCiAgICAgICAgInBvc2l0aW9uIjogIjkxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjM0IzOTNDIiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0sCiAgewogICAgImlkIjogInQiLAogICAgInR5cGUiOiAibGluZWFyLWdyYWRpZW50IiwKICAgICJhbmdsZSI6ICIxNzJkZWciLAogICAgImdyYWRpZW50IjogW3sKICAgICAgICAiY29sb3IiOiAiIzgxMEIxNyIsCiAgICAgICAgInBvc2l0aW9uIjogIjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNCQzQ4NTUiLAogICAgICAgICJwb3NpdGlvbiI6ICI0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRTM2RjgwIiwKICAgICAgICAicG9zaXRpb24iOiAiOSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzcyMDAyMCIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNzIwMDIwIiwKICAgICAgICAicG9zaXRpb24iOiAiMTYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFNzQzNjYiLAogICAgICAgICJwb3NpdGlvbiI6ICIxNyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0Y5NTU4MSIsCiAgICAgICAgInBvc2l0aW9uIjogIjIyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDExMTBBIiwKICAgICAgICAicG9zaXRpb24iOiAiMjMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM4RDBGM0YiLAogICAgICAgICJwb3NpdGlvbiI6ICIzNCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0Y2NDg4NSIsCiAgICAgICAgInBvc2l0aW9uIjogIjM1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRTQ0NjgzIiwKICAgICAgICAicG9zaXRpb24iOiAiMzklIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxNDAxMDkiLAogICAgICAgICJwb3NpdGlvbiI6ICI0MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzcyMUU1OSIsCiAgICAgICAgInBvc2l0aW9uIjogIjUxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRUQ3MUIxIiwKICAgICAgICAicG9zaXRpb24iOiAiNTIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGNDcyQjMiLAogICAgICAgICJwb3NpdGlvbiI6ICI1NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0MxNjM5QiIsCiAgICAgICAgInBvc2l0aW9uIjogIjYxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMEMwMDA4IiwKICAgICAgICAicG9zaXRpb24iOiAiNjIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM5QjExNkYiLAogICAgICAgICJwb3NpdGlvbiI6ICI3NCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0U2NTZCOSIsCiAgICAgICAgInBvc2l0aW9uIjogIjc1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjE0RkI4IiwKICAgICAgICAicG9zaXRpb24iOiAiNzglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNDOTQzQTEiLAogICAgICAgICJwb3NpdGlvbiI6ICI4MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzQ0MEE0MSIsCiAgICAgICAgInBvc2l0aW9uIjogIjg0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMzYwMDNDIiwKICAgICAgICAicG9zaXRpb24iOiAiOTUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBRDFEOUUiLAogICAgICAgICJwb3NpdGlvbiI6ICI5NiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0VGMzdENiIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJ1IiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiMyNDAwMkQiLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRUE0M0VEIiwKICAgICAgICAicG9zaXRpb24iOiAiMjIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFNDRDRUYiLAogICAgICAgICJwb3NpdGlvbiI6ICIyNiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzE0MDEwOSIsCiAgICAgICAgInBvc2l0aW9uIjogIjI5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkY1MUY5IiwKICAgICAgICAicG9zaXRpb24iOiAiMzAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFMTQ3RjUiLAogICAgICAgICJwb3NpdGlvbiI6ICIzNSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0QxMkZFRSIsCiAgICAgICAgInBvc2l0aW9uIjogIjM5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQkIxMUU2IiwKICAgICAgICAicG9zaXRpb24iOiAiNDMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBNzAxREYiLAogICAgICAgICJwb3NpdGlvbiI6ICI0OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzE0MDEwOSIsCiAgICAgICAgInBvc2l0aW9uIjogIjUxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjOTcwMERCIiwKICAgICAgICAicG9zaXRpb24iOiAiNTIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFODM5RTYiLAogICAgICAgICJwb3NpdGlvbiI6ICI1MyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzdCMDBDNyIsCiAgICAgICAgInBvc2l0aW9uIjogIjYxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNzIwMEMwIiwKICAgICAgICAicG9zaXRpb24iOiAiNjUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMxNDAxMDkiLAogICAgICAgICJwb3NpdGlvbiI6ICI3MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzY1MDFCRCIsCiAgICAgICAgInBvc2l0aW9uIjogIjcxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRTgzOUU2IiwKICAgICAgICAicG9zaXRpb24iOiAiNzIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM2NzAwQjMiLAogICAgICAgICJwb3NpdGlvbiI6ICI3OCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzYzMDJBOSIsCiAgICAgICAgInBvc2l0aW9uIjogIjgzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMTQwMTA5IiwKICAgICAgICAicG9zaXRpb24iOiAiODUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzNzAzODEiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMDAlIgogICAgICB9CiAgICBdCiAgfSwKICB7CiAgICAiaWQiOiAidiIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjMjcxMkRCIiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzMxNTRFNCIsCiAgICAgICAgInBvc2l0aW9uIjogIjMwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMjQxNkREIiwKICAgICAgICAicG9zaXRpb24iOiAiMzElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyRjVBRTciLAogICAgICAgICJwb3NpdGlvbiI6ICIzMiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzM1NUVFQiIsCiAgICAgICAgInBvc2l0aW9uIjogIjQ4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNDMyQUI5IiwKICAgICAgICAicG9zaXRpb24iOiAiNDklIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNFNzRDQkEiLAogICAgICAgICJwb3NpdGlvbiI6ICI1MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0Q3NThDRSIsCiAgICAgICAgInBvc2l0aW9uIjogIjc0JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjOEUzNEIyIiwKICAgICAgICAicG9zaXRpb24iOiAiNzUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM2MzM1QkUiLAogICAgICAgICJwb3NpdGlvbiI6ICI3NiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0YwNkFDMyIsCiAgICAgICAgInBvc2l0aW9uIjogIjkwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRDYzODlFIiwKICAgICAgICAicG9zaXRpb24iOiAiOTElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMyQzI1RTQiLAogICAgICAgICJwb3NpdGlvbiI6ICI5MiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0YxNzhDOCIsCiAgICAgICAgInBvc2l0aW9uIjogIjEwMCUiCiAgICAgIH0KICAgIF0KICB9LAogIHsKICAgICJpZCI6ICJ3IiwKICAgICJ0eXBlIjogImxpbmVhci1ncmFkaWVudCIsCiAgICAiYW5nbGUiOiAiMTcyZGVnIiwKICAgICJncmFkaWVudCI6IFt7CiAgICAgICAgImNvbG9yIjogIiNBQjcwRkUiLAogICAgICAgICJwb3NpdGlvbiI6ICIwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkQ5RkU3IiwKICAgICAgICAicG9zaXRpb24iOiAiMzAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBNTA2RTQiLAogICAgICAgICJwb3NpdGlvbiI6ICIzMSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0ZCNzlERCIsCiAgICAgICAgInBvc2l0aW9uIjogIjM5JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRjkzQkQ2IiwKICAgICAgICAicG9zaXRpb24iOiAiNDglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM1MTA0OUUiLAogICAgICAgICJwb3NpdGlvbiI6ICI0OSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0ZDOENENSIsCiAgICAgICAgInBvc2l0aW9uIjogIjU3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkRBN0Y1IiwKICAgICAgICAicG9zaXRpb24iOiAiNjUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3MDE3OTMiLAogICAgICAgICJwb3NpdGlvbiI6ICI2NiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0UyRDhGRiIsCiAgICAgICAgInBvc2l0aW9uIjogIjczJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkNGOUZGIiwKICAgICAgICAicG9zaXRpb24iOiAiNzUlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNDMEQ4RUEiLAogICAgICAgICJwb3NpdGlvbiI6ICI3NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzQ4MDI3NyIsCiAgICAgICAgInBvc2l0aW9uIjogIjgzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkI2REZCIiwKICAgICAgICAicG9zaXRpb24iOiAiODQlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM3QjAxNkQiLAogICAgICAgICJwb3NpdGlvbiI6ICIxMDAlIgogICAgICB9CiAgICBdCiAgfSwKICB7CiAgICAiaWQiOiAieCIsCiAgICAidHlwZSI6ICJsaW5lYXItZ3JhZGllbnQiLAogICAgImFuZ2xlIjogIjE3MmRlZyIsCiAgICAiZ3JhZGllbnQiOiBbewogICAgICAgICJjb2xvciI6ICIjRTEyMTdCIiwKICAgICAgICAicG9zaXRpb24iOiAiMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzE1MDQzQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjIyJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjNjcwNTU4IiwKICAgICAgICAicG9zaXRpb24iOiAiMjMlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzNDNBODAiLAogICAgICAgICJwb3NpdGlvbiI6ICIzOSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzBBMDEwNyIsCiAgICAgICAgInBvc2l0aW9uIjogIjQwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMjMwRTVDIiwKICAgICAgICAicG9zaXRpb24iOiAiNDElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMwMDkyREIiLAogICAgICAgICJwb3NpdGlvbiI6ICI1OSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzM0M0E4MCIsCiAgICAgICAgInBvc2l0aW9uIjogIjYwJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDAwQjMyIiwKICAgICAgICAicG9zaXRpb24iOiAiNjElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiM2NjY4QUEiLAogICAgICAgICJwb3NpdGlvbiI6ICI2MiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzNENEE3NSIsCiAgICAgICAgInBvc2l0aW9uIjogIjc3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMkExOTVGIiwKICAgICAgICAicG9zaXRpb24iOiAiNzglIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBMjBFNjkiLAogICAgICAgICJwb3NpdGlvbiI6ICI4NiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzAwMDAwMCIsCiAgICAgICAgInBvc2l0aW9uIjogIjg3JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMjcwMzRCIiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0sCiAgewogICAgImlkIjogInkiLAogICAgInR5cGUiOiAibGluZWFyLWdyYWRpZW50IiwKICAgICJhbmdsZSI6ICIxNzJkZWciLAogICAgImdyYWRpZW50IjogW3sKICAgICAgICAiY29sb3IiOiAiIzZGRURGMiIsCiAgICAgICAgInBvc2l0aW9uIjogIjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzOTI1NEIiLAogICAgICAgICJwb3NpdGlvbiI6ICIyMCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzcyMTU1QyIsCiAgICAgICAgInBvc2l0aW9uIjogIjIxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQzgzQjk5IiwKICAgICAgICAicG9zaXRpb24iOiAiMjIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGRDUwQTEiLAogICAgICAgICJwb3NpdGlvbiI6ICIyOSUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0ZENjk5RiIsCiAgICAgICAgInBvc2l0aW9uIjogIjMzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkY4N0E4IiwKICAgICAgICAicG9zaXRpb24iOiAiNDIlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNCMTI5ODUiLAogICAgICAgICJwb3NpdGlvbiI6ICI1NyUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzVCMTU1NCIsCiAgICAgICAgInBvc2l0aW9uIjogIjU4JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjMDAwMDAwIiwKICAgICAgICAicG9zaXRpb24iOiAiNTklIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiMzMTIwNDAiLAogICAgICAgICJwb3NpdGlvbiI6ICI5MCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzg5NUI3RiIsCiAgICAgICAgInBvc2l0aW9uIjogIjkxJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjQTUzMjZEIiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0sCiAgewogICAgImlkIjogInoiLAogICAgInR5cGUiOiAibGluZWFyLWdyYWRpZW50IiwKICAgICJhbmdsZSI6ICIxNzJkZWciLAogICAgImdyYWRpZW50IjogW3sKICAgICAgICAiY29sb3IiOiAiIzg0MDJEQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjAlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNCNzQ0RkUiLAogICAgICAgICJwb3NpdGlvbiI6ICIyNCUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzg0MDJEQSIsCiAgICAgICAgInBvc2l0aW9uIjogIjI1JSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRDI0RUZFIiwKICAgICAgICAicG9zaXRpb24iOiAiMjYlIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNBQjAyQkEiLAogICAgICAgICJwb3NpdGlvbiI6ICI0MiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiIzQ3MDAwMSIsCiAgICAgICAgInBvc2l0aW9uIjogIjQzJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkM3OTRBIiwKICAgICAgICAicG9zaXRpb24iOiAiNzElIgogICAgICB9LAogICAgICB7CiAgICAgICAgImNvbG9yIjogIiNGREQwNDkiLAogICAgICAgICJwb3NpdGlvbiI6ICI3MiUiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiY29sb3IiOiAiI0ZEQjk1MyIsCiAgICAgICAgInBvc2l0aW9uIjogIjczJSIKICAgICAgfSwKICAgICAgewogICAgICAgICJjb2xvciI6ICIjRkVGQ0JBIiwKICAgICAgICAicG9zaXRpb24iOiAiMTAwJSIKICAgICAgfQogICAgXQogIH0KXQp9Cg==', 'base64').toString());

var render = function render(input) {
  var list = Array.isArray(input) ? input : [input];
  return list.map(function (i) {
    var id = i.id,
        type = i.type,
        angle = i.angle,
        gradient = i.gradient;

    return '.' + database.meta.name + '-' + id + ' { background: ' + type + '(' + angle + ', ' + gradient.map(function (i) {
      return [i.color, i.position].join(" ");
    }).join(", ") + '); }';
  });
};

module.exports = {

  render: render,
  css: function css(pattern) {
    var selected = database.data.filter(function (gradient) {
      return gradient.id.match(pattern);
    });
    return selected.map(function (i) {
      return render(i);
    }).join("\n");
  },
  raw: function raw(pattern) {
    var selected = database.data.filter(function (gradient) {
      return gradient.id.match(pattern);
    });
    return selected;
  }

};
},{"fs":5,"buffer":4}],3:[function(require,module,exports) {
/*!
* screenfull
* v3.3.2 - 2017-10-27
* (c) Sindre Sorhus; MIT License
*/
(function () {
	'use strict';

	var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
	var isCommonjs = typeof module !== 'undefined' && module.exports;
	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

	var fn = function () {
		var val;

		var fnMap = [['requestFullscreen', 'exitFullscreen', 'fullscreenElement', 'fullscreenEnabled', 'fullscreenchange', 'fullscreenerror'],
		// New WebKit
		['webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitFullscreenElement', 'webkitFullscreenEnabled', 'webkitfullscreenchange', 'webkitfullscreenerror'],
		// Old WebKit (Safari 5.1)
		['webkitRequestFullScreen', 'webkitCancelFullScreen', 'webkitCurrentFullScreenElement', 'webkitCancelFullScreen', 'webkitfullscreenchange', 'webkitfullscreenerror'], ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozFullScreenElement', 'mozFullScreenEnabled', 'mozfullscreenchange', 'mozfullscreenerror'], ['msRequestFullscreen', 'msExitFullscreen', 'msFullscreenElement', 'msFullscreenEnabled', 'MSFullscreenChange', 'MSFullscreenError']];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for (; i < l; i++) {
			val = fnMap[i];
			if (val && val[1] in document) {
				for (i = 0; i < val.length; i++) {
					ret[fnMap[0][i]] = val[i];
				}
				return ret;
			}
		}

		return false;
	}();

	var eventNameMap = {
		change: fn.fullscreenchange,
		error: fn.fullscreenerror
	};

	var screenfull = {
		request: function (elem) {
			var request = fn.requestFullscreen;

			elem = elem || document.documentElement;

			// Work around Safari 5.1 bug: reports support for
			// keyboard in fullscreen even though it doesn't.
			// Browser sniffing, since the alternative with
			// setTimeout is even worse.
			if (/ Version\/5\.1(?:\.\d+)? Safari\//.test(navigator.userAgent)) {
				elem[request]();
			} else {
				elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
			}
		},
		exit: function () {
			document[fn.exitFullscreen]();
		},
		toggle: function (elem) {
			if (this.isFullscreen) {
				this.exit();
			} else {
				this.request(elem);
			}
		},
		onchange: function (callback) {
			this.on('change', callback);
		},
		onerror: function (callback) {
			this.on('error', callback);
		},
		on: function (event, callback) {
			var eventName = eventNameMap[event];
			if (eventName) {
				document.addEventListener(eventName, callback, false);
			}
		},
		off: function (event, callback) {
			var eventName = eventNameMap[event];
			if (eventName) {
				document.removeEventListener(eventName, callback, false);
			}
		},
		raw: fn
	};

	if (!fn) {
		if (isCommonjs) {
			module.exports = false;
		} else {
			window.screenfull = false;
		}

		return;
	}

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: function () {
				return Boolean(document[fn.fullscreenElement]);
			}
		},
		element: {
			enumerable: true,
			get: function () {
				return document[fn.fullscreenElement];
			}
		},
		enabled: {
			enumerable: true,
			get: function () {
				// Coerce to boolean in case of old WebKit
				return Boolean(document[fn.fullscreenEnabled]);
			}
		}
	});

	if (isCommonjs) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
})();
},{}],1:[function(require,module,exports) {
var synthwave = require("./index.js");
var screenfull = require("screenfull");

$(function () {
  function renderSynthwave(_ref) {
    var selectedLetter = _ref.selectedLetter,
        directedLetter = _ref.directedLetter,
        selectedClassName = _ref.selectedClassName,
        directedClassName = _ref.directedClassName;

    $('#demo-body').removeClass(selectedClassName).addClass(directedClassName);
    $('.synthwave-letter').text(directedLetter);
    $('.css-code').html(synthwave.css(directedLetter));
  }
  function trapNumber(value, min, max) {
    if (value > max) value = min;
    if (value < min) value = max;
    return value;
  }
  function getLetter(magic) {
    var selectedClassName = $('#demo-body').attr('class').split(' ').filter(function (c) {
      return c.match(/^synthwave-[a-z]$/);
    })[0] || 'synthwave-a';
    var selectedLetter = selectedClassName.split('-')[1];
    var directedLetterNumber = trapNumber(selectedLetter.charCodeAt(0) + magic, 97, 122);
    var directedLetter = String.fromCharCode(directedLetterNumber);
    var directedClassName = 'synthwave-' + directedLetter;
    var response = { selectedLetter: selectedLetter, directedLetter: directedLetter, selectedClassName: selectedClassName, directedClassName: directedClassName };
    return response;
  }

  $('#full-screen').on('click', function () {
    return screenfull.enabled ? screenfull.request() : "";
  });
  $('#aziz-light').on('click', function () {
    return $('.primary.container').toggleClass('bg-dark').toggleClass('shadow-lg');
  });
  $('#prev-wave').on('click', function () {
    return renderSynthwave(getLetter(-1));
  });
  $('#next-wave').on('click', function () {
    return renderSynthwave(getLetter(1));
  });

  renderSynthwave(getLetter(0));
});
},{"./index.js":2,"screenfull":3}],15:[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '60684' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
      // Clear the console after HMR
      console.clear();
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},[15,1], null)
//# sourceMappingURL=/index.html.map