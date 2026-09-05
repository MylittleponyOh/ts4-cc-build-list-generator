(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(globalThis, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


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

  var i
  for (i = 0; i < len; i += 4) {
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
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
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


/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



const base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
const ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
const customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

const K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    const arr = new Uint8Array(1)
    const proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  const buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
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
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  const valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  const b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
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
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  const length = byteLength(string, encoding) | 0
  let buf = createBuffer(length)

  const actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  const length = array.length < 0 ? 0 : checked(array.length) | 0
  const buf = createBuffer(length)
  for (let i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayView (arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    const copy = new Uint8Array(arrayView)
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
  }
  return fromArrayLike(arrayView)
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  let buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    const len = checked(obj.length) | 0
    const buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
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
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  let x = a.length
  let y = b.length

  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
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
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  let i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  const buffer = Buffer.allocUnsafe(length)
  let pos = 0
  for (i = 0; i < list.length; ++i) {
    let buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf)
        buf.copy(buffer, pos)
      } else {
        Uint8Array.prototype.set.call(
          buffer,
          buf,
          pos
        )
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    } else {
      buf.copy(buffer, pos)
    }
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  const len = string.length
  const mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  let loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
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
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  let loweredCase = false

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

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
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

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  const i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  const len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (let i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  const len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (let i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  const len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (let i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  const length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  let str = ''
  const max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
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

  let x = thisEnd - thisStart
  let y = end - start
  const len = Math.min(x, y)

  const thisCopy = this.slice(thisStart, thisEnd)
  const targetCopy = target.slice(start, end)

  for (let i = 0; i < len; ++i) {
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
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
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
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  let indexSize = 1
  let arrLength = arr.length
  let valLength = val.length

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

  let i
  if (dir) {
    let foundIndex = -1
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
      let found = true
      for (let j = 0; j < valLength; j++) {
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
  const remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  const strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  let i
  for (i = 0; i < length; ++i) {
    const parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
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
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  const remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  let loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length)

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
  const res = []

  let i = start
  while (i < end) {
    const firstByte = buf[i]
    let codePoint = null
    let bytesPerSequence = (firstByte > 0xEF)
      ? 4
      : (firstByte > 0xDF)
          ? 3
          : (firstByte > 0xBF)
              ? 2
              : 1

    if (i + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint

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
const MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  const len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  let res = ''
  let i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  let ret = ''
  end = Math.min(buf.length, end)

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  let ret = ''
  end = Math.min(buf.length, end)

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  const len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  let out = ''
  for (let i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  const bytes = buf.slice(start, end)
  let res = ''
  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
  for (let i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  const len = this.length
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

  const newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUintLE =
Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let val = this[offset]
  let mul = 1
  let i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUintBE =
Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  let val = this[offset + --byteLength]
  let mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUint8 =
Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUint16LE =
Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUint16BE =
Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUint32LE =
Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUint32BE =
Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const lo = first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24

  const hi = this[++offset] +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    last * 2 ** 24

  return BigInt(lo) + (BigInt(hi) << BigInt(32))
})

Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const hi = first * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    this[++offset]

  const lo = this[++offset] * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    last

  return (BigInt(hi) << BigInt(32)) + BigInt(lo)
})

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let val = this[offset]
  let mul = 1
  let i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let i = byteLength
  let mul = 1
  let val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  const val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  const val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const val = this[offset + 4] +
    this[offset + 5] * 2 ** 8 +
    this[offset + 6] * 2 ** 16 +
    (last << 24) // Overflow

  return (BigInt(val) << BigInt(32)) +
    BigInt(first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24)
})

Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const val = (first << 24) + // Overflow
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    this[++offset]

  return (BigInt(val) << BigInt(32)) +
    BigInt(this[++offset] * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    last)
})

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUintLE =
Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  let mul = 1
  let i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUintBE =
Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  let i = byteLength - 1
  let mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUint8 =
Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUint16LE =
Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUint16BE =
Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUint32LE =
Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUint32BE =
Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function wrtBigUInt64LE (buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7)

  let lo = Number(value & BigInt(0xffffffff))
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  return offset
}

function wrtBigUInt64BE (buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7)

  let lo = Number(value & BigInt(0xffffffff))
  buf[offset + 7] = lo
  lo = lo >> 8
  buf[offset + 6] = lo
  lo = lo >> 8
  buf[offset + 5] = lo
  lo = lo >> 8
  buf[offset + 4] = lo
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset + 3] = hi
  hi = hi >> 8
  buf[offset + 2] = hi
  hi = hi >> 8
  buf[offset + 1] = hi
  hi = hi >> 8
  buf[offset] = hi
  return offset + 8
}

Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE (value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
})

Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE (value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
})

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    const limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  let i = 0
  let mul = 1
  let sub = 0
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
  offset = offset >>> 0
  if (!noAssert) {
    const limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  let i = byteLength - 1
  let mul = 1
  let sub = 0
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
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE (value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
})

Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE (value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
})

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
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
  value = +value
  offset = offset >>> 0
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
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
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
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  const len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
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
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      const code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
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

  let i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    const bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    const len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// CUSTOM ERRORS
// =============

// Simplified versions from Node, changed for Buffer-only usage
const errors = {}
function E (sym, getMessage, Base) {
  errors[sym] = class NodeError extends Base {
    constructor () {
      super()

      Object.defineProperty(this, 'message', {
        value: getMessage.apply(this, arguments),
        writable: true,
        configurable: true
      })

      // Add the error code to the name to include it in the stack trace.
      this.name = `${this.name} [${sym}]`
      // Access the stack to generate the error message including the error code
      // from the name.
      this.stack // eslint-disable-line no-unused-expressions
      // Reset the name to the actual name.
      delete this.name
    }

    get code () {
      return sym
    }

    set code (value) {
      Object.defineProperty(this, 'code', {
        configurable: true,
        enumerable: true,
        value,
        writable: true
      })
    }

    toString () {
      return `${this.name} [${sym}]: ${this.message}`
    }
  }
}

E('ERR_BUFFER_OUT_OF_BOUNDS',
  function (name) {
    if (name) {
      return `${name} is outside of buffer bounds`
    }

    return 'Attempt to access memory outside buffer bounds'
  }, RangeError)
E('ERR_INVALID_ARG_TYPE',
  function (name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`
  }, TypeError)
E('ERR_OUT_OF_RANGE',
  function (str, range, input) {
    let msg = `The value of "${str}" is out of range.`
    let received = input
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input))
    } else if (typeof input === 'bigint') {
      received = String(input)
      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
        received = addNumericalSeparator(received)
      }
      received += 'n'
    }
    msg += ` It must be ${range}. Received ${received}`
    return msg
  }, RangeError)

function addNumericalSeparator (val) {
  let res = ''
  let i = val.length
  const start = val[0] === '-' ? 1 : 0
  for (; i >= start + 4; i -= 3) {
    res = `_${val.slice(i - 3, i)}${res}`
  }
  return `${val.slice(0, i)}${res}`
}

// CHECK FUNCTIONS
// ===============

function checkBounds (buf, offset, byteLength) {
  validateNumber(offset, 'offset')
  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
    boundsError(offset, buf.length - (byteLength + 1))
  }
}

function checkIntBI (value, min, max, buf, offset, byteLength) {
  if (value > max || value < min) {
    const n = typeof min === 'bigint' ? 'n' : ''
    let range
    if (byteLength > 3) {
      if (min === 0 || min === BigInt(0)) {
        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`
      } else {
        range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +
                `${(byteLength + 1) * 8 - 1}${n}`
      }
    } else {
      range = `>= ${min}${n} and <= ${max}${n}`
    }
    throw new errors.ERR_OUT_OF_RANGE('value', range, value)
  }
  checkBounds(buf, offset, byteLength)
}

function validateNumber (value, name) {
  if (typeof value !== 'number') {
    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value)
  }
}

function boundsError (value, length, type) {
  if (Math.floor(value) !== value) {
    validateNumber(value, type)
    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)
  }

  if (length < 0) {
    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
  }

  throw new errors.ERR_OUT_OF_RANGE(type || 'offset',
                                    `>= ${type ? 1 : 0} and <= ${length}`,
                                    value)
}

// HELPER FUNCTIONS
// ================

const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  let codePoint
  const length = string.length
  let leadSurrogate = null
  const bytes = []

  for (let i = 0; i < length; ++i) {
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
  const byteArray = []
  for (let i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  let c, hi, lo
  const byteArray = []
  for (let i = 0; i < str.length; ++i) {
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
  let i
  for (i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
const hexSliceLookupTable = (function () {
  const alphabet = '0123456789abcdef'
  const table = new Array(256)
  for (let i = 0; i < 16; ++i) {
    const i16 = i * 16
    for (let j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

// Return not function with Error if BigInt not supported
function defineBigIntMethod (fn) {
  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn
}

function BufferBigIntNotDefined () {
  throw new Error('BigInt not supported')
}


/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
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


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./src/BufferStore.ts":
/*!****************************!*\
  !*** ./src/BufferStore.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/**
 * BufferStore
 *
 * A LFU+TTL cache for reading buffer segments from a file.
 */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BufferStore = exports.BrowserBufferStore = exports.NodeBufferStore = exports.Buffer = void 0;
const polyfill_1 = __webpack_require__(/*! ./polyfill */ "./src/polyfill.ts");
const polyfill_fs_1 = __webpack_require__(/*! ./polyfill.fs */ "./src/polyfill.fs.ts");
const polyfill_Buffer_1 = __webpack_require__(/*! ./polyfill.Buffer */ "./src/polyfill.Buffer.ts");
var polyfill_Buffer_2 = __webpack_require__(/*! ./polyfill.Buffer */ "./src/polyfill.Buffer.ts");
Object.defineProperty(exports, "Buffer", ({ enumerable: true, get: function () { return polyfill_Buffer_2.Buffer; } }));
const LFUCache_1 = __webpack_require__(/*! ./LFUCache */ "./src/LFUCache.ts");
/**
 * This module provides a LFU+TTL cache implementation for reading file buffers.
 *
 * It is optimized for use with Blobs and File objects, but is also designed to
 * work file paths in Node.js.
 *
 * It caches the buffers in segments, with each segment being a small, but fixed size.
 */
/**
 * Default configuration for the buffer cache.
 *
 * This object contains the default values for managing the cache, including
 * the segment size, capacity, and time-to-live (TTL) for each segment.
 *
 * These are used to populate the {@link SegmentOptions} object, if the user omits the values.
 *
 * @internal
 */
const DEFAULTS = {
    /**
     * The size of each segment in bytes.
     *
     * This value defines the size of individual segments in the buffer.
     *
     * @defaultValue 16KB (1024 * 16)
     */
    SEGMENT_SIZE: 1024 * 16, // 16KB
    /**
     * The number of segments in a buffer.
     *
     * This value defines how many segments can be stored in cache before
     * cycling out least frequently used items (LFU).
     *
     * @defaultValue 16 segments
     * total default capacity of 256KB (when multiplied by the `SEGMENT_SIZE`)
     */
    SEGMENT_CAPACITY: 16, // 16 * 16KB = 256KB
    /**
     * The time-to-live (TTL) for each segment in milliseconds.
     *
     * This value defines how long a segment remains in the buffer before
     * it is considered stale and eligible for eviction.
     *
     * @defaultValue 30 seconds (1000 * 60 * 0.5)
     */
    SEGMENT_TTL: 1000 * 60 * 0.5 // 30 seconds
};
/**
 * The parent class buffer store for both Node.js and browser environments.
 *
 * This is the base buffer cache. It uses the file as a backing store.
 * It is most performant when the file is a Blob or File object, but
 * it can also work with file paths (in Node.js).
 *
 * It is designed to be extended, then used
 *
 * @internal
 */
class BaseBufferStore {
    /**
     * Creates a new buffer store
     *
     * Since the value of length will be calculated differently based on
     * engine and environment, length is required as an argument, and is intended
     * to be calculated by child classes.
     *
     * This sets up an underlying LFU+TTL cache.
     *
     * @param { File | Blob | string } file
     * @param { number } length
     */
    constructor(file, length, { size: segment_size = DEFAULTS.SEGMENT_SIZE, capacity: segment_capacity = DEFAULTS.SEGMENT_CAPACITY, ttl: segment_ttl = DEFAULTS.SEGMENT_TTL }) {
        /**
         * This is the primary method for retrieving buffer segments.
         *
         * It first checks the cache, then falls back to the file system.
         * @param index The index of the buffer segment to retrieve.
         * @returns { Promise<BufferStoreEntry> }
         */
        this._get = async (index) => {
            let out = this._cache.get(index);
            if (!out)
                out = await this._read(index);
            this._cache.set(index, out);
            return out;
        };
        if (segment_size < 8)
            throw new Error("Segment size must be at least 8 bytes");
        this._file = file;
        if (!length)
            throw new Error("Invalid length");
        this.length = length;
        this.segment_size = segment_size;
        this.count = Math.ceil(length / segment_size);
        this._cache = new LFUCache_1.LFUCache(segment_capacity, segment_ttl);
    }
    /**
     * Retrieves a buffer by its offset and length and wraps it in a {@link BufferReader}.
     *
     * @param offset
     * @param length
     * @returns { BufferReader }
     * @public
     */
    get(offset, length) {
        return new BufferReader(this._get, this._direct, this.segment_size, offset, length);
    }
}
/**
 * A buffer store for Node.js environments.
 *
 * @remarks
 * This class is designed to work with both Blobs/File objects and file paths.
 */
class NodeBufferStore extends BaseBufferStore {
    /**
     * @param file The Blob/File object or file path to read from.
     * @param { Partial<SegmentOptions> } segment_options @see {@link SegmentOptions}
     */
    constructor(file, segment_options = {}) {
        const size = file instanceof Blob ? file.size : polyfill_fs_1.fs.statSync(file).size;
        super(file, size, segment_options);
        /**
         * The Node.js implementation of the direct buffer getter for retrieving buffer segments directly from the file system.
         * @see {@link BaseBufferStore._direct}
         *
         * @param offset The offset in the buffer to start reading from.
         * @param length The length of the buffer to read.
         * @returns { Promise<Buffer> }
         * @protected
         */
        this._direct = async (offset, length) => {
            if (offset < 0 || offset + length > this.length)
                throw new RangeError(`Read out of range (by length): ${offset} + ${length}/${this.length}`);
            return new Promise((read_resolve, read_reject) => {
                if (this._blob) {
                    const subblob = this._blob.slice(offset, offset + length);
                    subblob.arrayBuffer().then((buffer) => {
                        read_resolve(polyfill_Buffer_1.Buffer.from(buffer));
                    }).catch(read_reject);
                }
                else {
                    polyfill_fs_1.fs.open(this._path, "r", (err, fd) => {
                        if (err)
                            return read_reject(err);
                        const outbuffer = polyfill_Buffer_1.Buffer.alloc(length);
                        polyfill_fs_1.fs.read(fd, outbuffer, 0, length, offset, (err, bytesRead, buffer) => {
                            if (err)
                                return read_reject(err);
                            if (!buffer || bytesRead !== buffer.length)
                                return read_reject(new Error("Read failed"));
                            read_resolve(outbuffer);
                        });
                    });
                }
            });
        };
    }
    /**
     * The setter for the file property.
     * @see {@link BaseBufferStore._file}
     */
    set _file(file) {
        if (file instanceof Blob)
            this._blob = file;
        else {
            if (typeof file !== "string")
                throw new TypeError("Invalid argument for file, expected File, Blob, or string");
            if (!polyfill_fs_1.fs.existsSync(file))
                throw new Error(`File not found: ${file}`);
            this._path = file;
        }
    }
    /**
     * The Node.js implementation of the cache fallthrough method for retrieving non-cached buffer segments.
     * @see {@link BaseBufferStore._read}
     *
     * @param index The index of the buffer segment to read from the file system.
     * @returns { Promise<BufferStoreEntry> }
     */
    async _read(index) {
        if (index < 0 || index >= this.count)
            throw new RangeError(`Read out of range (by index): ${index}/${this.count}`);
        const offset = index * this.segment_size;
        const length = Math.min(this.segment_size, this.length - offset);
        return new Promise((read_resolve, read_reject) => {
            this._direct(offset, length).then((buffer) => {
                read_resolve({
                    index,
                    buffer
                });
            }).catch(read_reject);
        });
    }
}
exports.NodeBufferStore = NodeBufferStore;
/**
 * A buffer store for browser environments.
 *
 * @remarks
 * This class is designed to work only with Blobs and File objects.
 */
class BrowserBufferStore extends BaseBufferStore {
    /**
     * @param file The Blob/File object to read from.
     * @param segment_options @see {@link SegmentOptions}
     */
    constructor(file, segment_options = {}) {
        if (!(file instanceof Blob))
            throw new TypeError("Invalid argument for file, expected File or Blob");
        super(file, file.size, segment_options);
        /**
         * The browser implementation of the direct buffer getter for retrieving buffer segments directly from the file system.
         * @see {@link BaseBufferStore._direct}
         *
         * @param offset The offset in the buffer to start reading from.
         * @param length The length of the buffer to read.
         * @returns { Promise<Buffer> }
         * @protected
         */
        this._direct = async (offset, length) => {
            if (offset < 0 || offset + length > this.length)
                throw new RangeError(`Read out of range (by length): ${offset} + ${length}/${this.length}`);
            const subblob = this._blob.slice(offset, offset + length);
            return polyfill_Buffer_1.Buffer.from(await subblob.arrayBuffer());
        };
    }
    /**
     * The setter for the file property.
     * @see {@link BaseBufferStore._file}
     */
    set _file(file) {
        if (!(file instanceof Blob))
            throw new TypeError("Invalid argument for file, expected File or Blob");
        this._blob = file;
    }
    /**
     * The browser implementation of the cache fallthrough method for retrieving non-cached buffer segments.
     * @see {@link BaseBufferStore._read}
     *
     * @param index The index of the buffer segment to read from the file system.
     * @returns { Promise<BufferStoreEntry> }
     */
    async _read(index) {
        if (index < 0 || index >= this.count)
            throw new RangeError(`Read out of range (by index): ${index}/${this.count}`);
        const offset = index * this.segment_size;
        const length = Math.min(this.segment_size, this.length - offset);
        const subblob = this._blob.slice(offset, offset + length);
        const buffer = polyfill_Buffer_1.Buffer.from(await subblob.arrayBuffer());
        return {
            index,
            buffer
        };
    }
}
exports.BrowserBufferStore = BrowserBufferStore;
/**
 * A wrapper for reading buffers from a {@link BufferStore}.
 *
 * Provides quality of life methods for reading the data stored in the requested buffer.
 * @see {@link BufferStore.get}
 * @public
 */
class BufferReader {
    constructor(getter, direct, segment_size, offset, length) {
        this._getter = getter;
        this._direct = direct;
        this._segment_size = segment_size;
        this._offset = offset;
        this._length = length;
        this._cursor = 0;
        this._current_index = this._first_index = Math.floor(offset / segment_size);
        // last index inclusive
        this._last_index = Math.floor((offset + length - 1) / segment_size);
        this._count = this._last_index - this._first_index + 1;
        this._current_segment = getter(this._first_index);
        if (this._count > 1)
            this._next_segment = getter(this._first_index + 1);
    }
    /**
     * The current position of the cursor in the buffer.
     */
    get cursor() {
        return this._cursor;
    }
    /**
     * Moves the cursor to the specified position
     *
     * @param position The position to move the cursor to.
     *
     * @remarks
     * If the position is out of range, it will wrap around to the beginning or end of the buffer.
     *
     * This method also asynchronously polls the cache for the next segment if the cursor moves to a new segment.
     */
    async move(position) {
        while (position < 0 || position >= this._length) {
            if (position < 0) {
                position += this._length;
            }
            else {
                position -= this._length;
            }
        }
        this._cursor = position;
        const current_index = this._current_index;
        const correct_index = Math.floor((this._offset + position) / this._segment_size);
        if (correct_index === current_index)
            return;
        this._current_index = correct_index;
        const diff = correct_index - current_index;
        switch (diff) {
            case 1:
                this._prior_segment = this._current_segment;
                this._current_segment = this._next_segment;
                if (current_index < this._last_index)
                    this._next_segment = this._getter(current_index + 1);
                else
                    this._next_segment = this._getter(this._first_index);
                break;
            case -1:
                this._next_segment = this._current_segment;
                this._current_segment = this._prior_segment;
                if (current_index > this._first_index)
                    this._prior_segment = this._getter(current_index - 1);
                else
                    this._prior_segment = this._getter(this._last_index);
                break;
            default:
                this._current_segment = this._getter(correct_index);
                if (correct_index < this._last_index)
                    this._next_segment = this._getter(correct_index + 1);
                else
                    this._next_segment = undefined;
                if (correct_index > this._first_index)
                    this._prior_segment = this._getter(correct_index - 1);
                else
                    this._prior_segment = undefined;
                break;
        }
    }
    /**
     * Advances the cursor by the specified length.
     *
     * @param length The length to advance the cursor by.
     *
     * @remarks
     * {@link BufferReader.move} moves the cursor to an absolute position, while this method
     * advances the cursor to a position relative to the current position.
     */
    async advance(length = 1) {
        await this.move(this._cursor + length);
    }
    /**
     * This is the primary method for retrieving from the cached buffer.
     *
     * @param length The length (in bytes) of the buffer to retrieve from the cursor position.
     * @returns { Promise<Buffer> }
     *
     * @private
     */
    async _getBuffer(length, offset = this._cursor, moving = true) {
        if (offset + length > this._length)
            throw new RangeError(`Read out of range (by length): ${offset}/${this._length}`);
        if (length > 8)
            throw new Error(`Read length too large`);
        // snapshot current state
        const current_offset_cursor = offset + this._offset;
        const current_index = this._current_index;
        const current_segment = await this._current_segment;
        const _next_segment = this._next_segment;
        // immediately advance cursor
        if (moving)
            this.advance(length);
        let buffers = [];
        const skippedBeginning = current_offset_cursor % this._segment_size;
        if (this._segment_size >= length + skippedBeginning) {
            buffers.push(current_segment.buffer.subarray(skippedBeginning, skippedBeginning + length));
        }
        else {
            buffers.push(current_segment.buffer.subarray(skippedBeginning));
            const next_segment = await _next_segment;
            const remainingBytes = length - buffers[0].length;
            buffers.push(next_segment.buffer.subarray(0, remainingBytes));
        }
        return polyfill_Buffer_1.Buffer.concat(buffers);
    }
    /**
     * Retrieves a buffer from the buffer cache directly. Can be used for reading large segments.
     *
     * @param offset The offset in the buffer to start reading from.
     * @param length The length of the buffer to read.
     * @returns { Promise<Buffer> }
     *
     * @deprecated This method should be avoided and used sparingly, as it bypasses any memory optimizations.
     */
    async get(offset = this._offset, length = this._length) {
        return await this._direct(offset, length);
    }
    /**
     * A method for retrieving an arbitrary number of bytes from the buffer as a number or bigint in little-endian order (least significant BYTE first).
     *
     * @param length
     * @returns { Promise<Number | BigInt> }
     *
     * @remarks Maximum length is 8 bytes due to JavaScript's number precision.
     */
    async getBytesLE(length) {
        const bytes = await this._getBuffer(length);
        let little_three_bytes;
        let big_four_bytes;
        switch (length) {
            case 8: return bytes.readBigInt64LE(0);
            case 7:
            case 6:
            case 5:
                little_three_bytes = bytes.readUIntLE(3, length - 4);
            default:
                big_four_bytes = bytes.readUIntLE(0, Math.min(length, 4));
        }
        if (little_three_bytes !== undefined)
            return BigInt(big_four_bytes) << 32n | BigInt(little_three_bytes);
        else
            return big_four_bytes;
    }
    /**
     * A method for retrieving an arbitrary number of bytes from the buffer as a number or bigint in big-endian order (most significant BYTE (and BIT) first).
     *
     * @param length
     * @returns { Promise<Number | BigInt> }
     *
     * @remarks Maximum length is 8 bytes due to JavaScript's number precision.
     */
    async getBytesBE(length) {
        const bytes = await this._getBuffer(length);
        let little_four_bytes;
        let big_three_bytes;
        switch (length) {
            case 8: return bytes.readBigInt64BE(0);
            case 7:
            case 6:
            case 5:
                big_three_bytes = bytes.readUIntBE(0, length - 4);
            default:
                little_four_bytes = bytes.readUIntBE(0, Math.min(length, 4));
        }
        if (big_three_bytes !== undefined)
            return BigInt(big_three_bytes) << 32n | BigInt(little_four_bytes);
        else
            return little_four_bytes;
    }
    /**
     * Retrieves a single byte from the buffer as a number.
     * @returns { Promise<Number> }
     */
    async getByte() {
        return (await this._getBuffer(1)).readUInt8(0);
    }
    /**
     * Retrieves two bytes from the buffer as a number.
     * @returns { Promise<Number> }
     */
    async getTwoBytes() {
        return (await this._getBuffer(2)).readUInt16LE(0);
    }
    async getShort() {
        return this.getTwoBytes();
    }
    /**
     * Retrieves three bytes from the buffer as a number.
     * @returns { Promise<Number> }
     */
    async getFourBytes() {
        return (await this._getBuffer(4)).readUInt32LE(0);
    }
    /**
     * Alias for {@link BufferReader.getFourBytes}
     */
    async getInt() {
        return this.getFourBytes();
    }
    /**
     * Alias for {@link BufferReader.getFourBytes}
     */
    async getFloat() {
        return (await this._getBuffer(4)).readFloatLE(0);
    }
    /**
     * Retrieves eight bytes from the buffer as a bigint.
     * @returns { Promise<BigInt> }
     */
    async getEightBytes() {
        return (await this._getBuffer(8)).readBigInt64LE(0);
    }
    /**
     * Alias for {@link BufferReader.getEightBytes}
     */
    async getLong() {
        return this.getEightBytes();
    }
    /**
     * Retrieves a variable-length LEB128 encoded number from the buffer as a 32-bit unsigned number.
     * @returns { Promise<Number> }
     */
    async getUnsignedLEB128() {
        let value = 0;
        let shift = 0;
        let byte;
        let bytelimit = 5;
        let i = 0;
        do {
            byte = await this.getByte();
            value |= (byte & 0x7f) << shift;
            shift += 7;
            i++;
        } while ((byte & 0x80) && i < bytelimit);
        if ((byte & 0x80) && i === bytelimit)
            throw new RangeError("LEB128 value too large for 32-bit");
        return value;
    }
    /**
     * Retrieves a variable-length LEB128 encoded number from the buffer as a 32-bit signed number.
     * @returns { Promise<Number> }
     */
    async getLEB128() {
        let value = 0;
        let shift = 0;
        let byte;
        let bytelimit = 5;
        let i = 0;
        do {
            byte = await this.getByte();
            value |= (byte & 0x7f) << shift;
            shift += 7;
            i++;
        } while ((byte & 0x80) && i < bytelimit);
        if ((byte & 0x80) && i === bytelimit) {
            throw new RangeError("LEB128 value too large for 32-bit");
        }
        if ((byte & 0x40) && i < bytelimit) {
            value |= -(1 << shift);
        }
        return value;
    }
    /**
     * Retrieves a variable-length LEB128 encoded number from the buffer as a 64-bit unsigned bigint.
     * @returns { Promise<BigInt> }
     */
    async getUnsignedLEB128BigInt() {
        let value = 0n;
        let shift = 0n;
        let byte;
        let bytelimit = 9;
        let i = 0;
        do {
            byte = await this.getByte();
            value |= BigInt((byte & 0x7f)) << shift;
            shift += 7n;
            i++;
        } while ((byte & 0x80) && i < bytelimit);
        if ((byte & 0x80) && i === bytelimit)
            throw new RangeError("LEB128 value too large for 64-bit");
        return value;
    }
    /**
     * Retrieves a variable-length LEB128 encoded number from the buffer as a 64-bit signed bigint.
     * @returns { Promise<BigInt> }
     */
    async getLEB128BigInt() {
        let value = 0n;
        let shift = 0n;
        let byte;
        let bytelimit = 9;
        let i = 0;
        do {
            byte = await this.getByte();
            value |= BigInt((byte & 0x7f)) << shift;
            shift += BigInt(7);
            i++;
        } while ((byte & 0x80) && i < bytelimit);
        if ((byte & 0x80) && i === bytelimit)
            throw new RangeError("LEB128 value too large for 64-bit");
        if ((byte & 0x40) && i < bytelimit)
            value |= -(1n << shift);
        return value;
    }
}
/**
 * The buffer store for the current environment.
 * @see {@link NodeBufferStore} and {@link BrowserBufferStore}
 */
exports.BufferStore = polyfill_1.polyfill.isNode ? NodeBufferStore : BrowserBufferStore;


/***/ }),

/***/ "./src/DBPF.ts":
/*!*********************!*\
  !*** ./src/DBPF.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * DBPF Parser
 *
 * DBPF is a file format used by Maxis in their games, including The Sims Series, SimCity, and Spore.
 * The following reader is an implementation of a DBPF reader in TypeScript.
 *
 * The community spec for DBPF can be found at [docs/spec/README.md](docs/spec/README.md).
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dbpf = exports.Plugins = exports.DBPFEntry = exports.DBPFIndexTable = exports.DBPF = exports.MagicNumberBE = exports.MagicNumberLE = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.mjs");
/**
 * @ignore
 */
const polyfill_1 = __webpack_require__(/*! ./polyfill */ "./src/polyfill.ts");
const polyfill_fs_1 = __webpack_require__(/*! ./polyfill.fs */ "./src/polyfill.fs.ts");
const polyfill_events_1 = __webpack_require__(/*! ./polyfill.events */ "./src/polyfill.events.ts");
const BufferStore_1 = __webpack_require__(/*! ./BufferStore */ "./src/BufferStore.ts");
const serde_1 = __webpack_require__(/*! ./serde */ "./src/serde.ts");
let polyfills = [
    {
        resolve: (...paths) => paths.join("/"),
        isAbsolute: (path) => /^[a-zA-Z]:[\\/]/.test(path)
    }
];
if (polyfill_1.polyfill.isNode)
    polyfills.push("node:path");
let { resolve, isAbsolute } = (0, polyfill_1.polyfill)(...polyfills);
const { assign: obj_assign, getOwnPropertyDescriptor: obj_descriptor, getPrototypeOf: obj_prototype, } = Object;
/**
 * A magic number generator for DBPF files in little-endian byte order.
 * - used in the DBPF header.
 * - see: [docs/spec/DBPF.md - Header](docs/spec/DBPF.md#header)
 *
 * @param string The string to convert to a 4-byte magic number.
 * @returns {Number} The magic number.
 */
function MagicNumberLE(string) {
    string = string.padEnd(4, '\0');
    let out = 0;
    string.split('').forEach((char, index) => {
        out |= char.charCodeAt(0) << (index * 8);
    });
    return out;
}
exports.MagicNumberLE = MagicNumberLE;
/**
 * A magic number generator for DBPF files in big-endian byte order.
 * - used in the DBPF header.
 * - see: [docs/spec/DBPF.md - Header](docs/spec/DBPF.md#header)
 *
 * @param string The string to convert to a 4-byte magic number.
 * @returns {Number} The magic number.
 */
function MagicNumberBE(string) {
    string = string.padEnd(4, '\0');
    let out = 0;
    string.split('').reverse().forEach((char, index) => {
        out |= char.charCodeAt(0) << (index * 8);
    });
    return out;
}
exports.MagicNumberBE = MagicNumberBE;
/**
 * The magic number for DBPF files. DBBF files may use a different magic number.
 * - used in the DBPF header.
 * - see: [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
 */
const MAGICNUMBER = MagicNumberLE("DBPF");
/**
 * The length of the DBPF header. This may need to change for different versions of the DBPF format.
 * - see: [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
 */
const HEADERLENGTH = 0x60; // 96 bytes
/**
 * The DBPF reader class.
 *
 * This is the main class for the project. It is derived from the [Community Spec](../docs/spec/DBPF.md).
 */
class DBPF extends polyfill_events_1.EventEmitter {
    /**
     * Creates a new DBPF reader asynchronously, evented.
     * @param { File | Blob | string } file The DBPF file to read.
     * @public
     */
    static create(file) {
        const dbpf = new DBPF(file);
        return new polyfill_events_1.EventedPromise((evented_resolve, evented_reject) => {
            dbpf.init()
                .then(() => evented_resolve(dbpf))
                .catch(evented_reject);
        }, {
            emit: dbpf.emit,
            events: {
                resolve: DBPF.ON_CREATE,
                reject: DBPF.ON_ERROR
            }
        });
    }
    /**
     * The internal constructor for the DBPF reader.
     *
     * In JS, the constructor is public, but it is not recommended to use it directly.
     * Instead, use {@link DBPF.create}.
     *
     * If you must use the constructor directly, ensure to await the {@link DBPF.init} method before using the instance.
     *
     * @param { File | Blob | string } file The DBPF file to read.
     * @internal @deprecated
     */
    constructor(file) {
        super();
        /**
         * The DBPFEntry plugins to apply to the DBPF file.
         *
         * These are applied in order to each entry in the DBPF file.
         * - @see {@link Plugins}
         * @readonly
         */
        this.plugins = (() => {
            const list = new PluginsList();
            list.push(...PluginsList.default);
            return list;
        })();
        if (!polyfill_1.polyfill.isNode && typeof file === "string")
            throw new TypeError("Cannot use string path in browser environment");
        if (typeof file === "string") {
            file = resolve(file);
            this._filepath = file;
            this._filesize = polyfill_fs_1.fs.statSync(file).size;
        }
        else {
            if (file instanceof File)
                this._filepath = file.name;
            else
                this._filepath = "Unnamed DBPF Blob";
            this._filesize = file.size;
        }
        this._store = new BufferStore_1.BufferStore(file);
    }
    /**
     * Initializes the DBPF reader asynchronously, evented. Only intended for internal use, but is exposed for advanced users.
     *
     * The body of this method contains the logic for reading the DBPF header and preparing the DBPF index table.
     * - see: [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
     * - see: [../docs/spec/DBPF.md - The Tables](../docs/spec/DBPF.md#the-tables)
     * @returns { EventedPromise<void> } An evented promise that resolves when the DBPF reader is initialized.
     * @public @deprecated use {@link DBPF.create} instead
     */
    init() {
        return this._init || (this._init = new polyfill_events_1.EventedPromise(async (evented_resolve, evented_reject) => {
            const reader = this._store.get(0, this.headerLength);
            const _magic = await reader.getInt();
            if (_magic !== this.magic)
                return evented_reject(new Error("Invalid magic number"));
            const major = await reader.getInt();
            const minor = await reader.getInt();
            const usermajor = await reader.getInt();
            const userminor = await reader.getInt();
            const unused = await reader.getInt();
            const created = await reader.getInt();
            const modified = await reader.getInt();
            const index_major = await reader.getInt();
            const index_count = await reader.getInt();
            const index_first = await reader.getInt();
            const index_size = await reader.getInt();
            const hole_count = await reader.getInt();
            const hole_offset = await reader.getInt();
            const hole_size = await reader.getInt();
            const index_minor = await reader.getInt();
            const index_offset = await reader.getInt();
            const _header_dbpf = {
                major,
                minor,
                usermajor,
                userminor,
                created,
                modified
            };
            const _header_index = {
                major: index_major,
                minor: index_minor,
                count: index_count,
                first: index_first,
                size: index_size,
                offset: index_offset
            };
            const _header_trash = {
                count: hole_count,
                offset: hole_offset,
                size: hole_size
            };
            this._header = {
                dbpf: _header_dbpf,
                index: _header_index,
                trash: _header_trash
            };
            (0, polyfill_1.deepFreeze)(this._header);
            this._table = await DBPFIndexTable.create(this);
            this._table.init()
                .then(evented_resolve)
                .catch(evented_reject);
        }, {
            emit: this.emit,
            events: {
                resolve: DBPF.ON_INIT,
                reject: DBPF.ON_ERROR
            }
        }));
    }
    /**
     * The length of the DBPF header.
     * - @see {@link HEADERLENGTH}
     * @readonly
     */
    get headerLength() {
        // extension-class-proofing
        const _proto = obj_prototype(this).constructor;
        return _proto.HEADERLENGTH;
    }
    static { this.HEADERLENGTH = HEADERLENGTH; }
    /**
     * The magic number for DBPF files.
     * - @see {@link MAGICNUMBER}
     * @readonly
     */
    get magic() {
        // extension-class-proofing
        const _proto = obj_prototype(this).constructor;
        return _proto.MAGICNUMBER;
    }
    static { this.MAGICNUMBER = MAGICNUMBER; }
    /**
     * The path to the DBPF file.
     * @remarks
     * In the browser environment, this and {@link DBPF.filename} are the same.
     * @readonly
     */
    get filepath() {
        return this._filepath;
    }
    /**
     * The name of the DBPF file.
     * @remarks
     * In the browser environment, this and {@link DBPF.filepath} are the same.
     * @readonly
     */
    get filename() {
        return this._filepath.split(/[\/\\]/).pop();
    }
    /**
     * The extension of the DBPF file.
     * @readonly
     */
    get extension() {
        const segments = this.filename.split('.');
        if (segments.length < 2)
            return "";
        return segments.pop();
    }
    /**
     * The size of the DBPF file.
     * @readonly
     */
    get filesize() {
        return this._filesize;
    }
    get header() {
        if (!this._header)
            throw new Error("DBPF not initialized. Try awaiting .init() first");
        return this._header;
    }
    /**
     * The DBPF Index Table.
     * - @see {@link DBPFIndexTable}
     * @readonly
     */
    get table() {
        if (!this._table)
            throw new Error("DBPF not initialized. Try awaiting .init() first");
        return this._table;
    }
    /**
     * Returns a {@link IBufferReader} from the DBPF file (using the LFU+TTL cache) at the specified offset and length.
     *
     * @param offset The offset to read from.
     * @param length The length to read.
     * @returns { IBufferReader } The buffer reader.
     */
    read(offset, length) {
        try {
            const out = this._store.get(offset, length);
            this.emit("read", out);
            return out;
        }
        catch (error) {
            this.emit("error", error);
            throw error;
        }
    }
    /**
     * The event name for when the DBPF reader is created properly.
     * @event
     */
    static { this.ON_CREATE = "create"; }
    /**
     * The event name for when the DBPF reader is initialized.
     * @event
     */
    static { this.ON_INIT = "init"; }
    /**
     * The event name for when the DBPF reader reads data.
     * @event
     */
    static { this.ON_READ = "read"; }
    /**
     * The event name for when the DBPF reader encounters an error.
     * @event
     */
    static { this.ON_ERROR = "error"; }
}
exports.DBPF = DBPF;
/**
 * The DBPF Index Table class.
 *
 * This class is a Map of DBPF entries.
 * - @see {@link DBPFEntry}
 *
 * It implements an EventEmitter interface.
 * - @see {@link EventEmitter}
 */
class DBPFIndexTable extends Map {
    /**
     * Creates a new DBPF Index Table asynchronously, evented.
     * @param DBPF The DBPF reader to read the index table from.
     * @returns { EventedPromise<DBPFIndexTable> } An evented promise that resolves when the DBPF Index Table is created.
     * @public
     */
    static create(DBPF) {
        const self = new DBPFIndexTable(DBPF);
        return new polyfill_events_1.EventedPromise((evented_resolve, evented_reject) => {
            self
                .init()
                .then(() => evented_resolve(self))
                .catch(evented_reject);
        }, {
            emit: self.emit,
            events: {
                resolve: DBPFIndexTable.ON_CREATE,
                reject: DBPFIndexTable.ON_ERROR
            }
        });
    }
    get size() {
        return this._size;
    }
    /**
     * The internal constructor for the DBPF Index Table.
     *
     * Much like the DBPF reader, this constructor is public, but it is not recommended to use it directly.
     * Instead, use {@link DBPF.create} which will create and await the DBPF Index Table for you.
     *
     * If you must use the constructor directly, ensure to await the {@link DBPFIndexTable.init} method before using the instance.
     *
     * @param DBPF The DBPF reader instance to read the index table from.
     * @internal @deprecated
     */
    constructor(DBPF) {
        super();
        this._DBPF = DBPF;
        this._offset = DBPF.header.dbpf.major === 1 ? DBPF.header.index.first : DBPF.header.index.offset;
        // prevent collision with `extends Map` properties
        this.length = DBPF.header.index.size;
        this._size = DBPF.header.index.count;
        this._reader = DBPF.read(this._offset, this.length);
        this._emitter = new polyfill_events_1.EventEmitter();
        this.on = (event, listener) => {
            this._emitter.on(event, listener);
            return this;
        };
        this.off = (event, listener) => {
            this._emitter.off(event, listener);
            return this;
        };
        this.emit = (event, ...args) => {
            let parent_emit;
            if (event === "error") {
                args = new polyfill_1.AggregateError(args, "DBPFIndexTable error");
                parent_emit = DBPF.emit("error", args);
            }
            else {
                parent_emit = DBPF.emit(`table_${event}`, ...args);
            }
            const self_emit = this._emitter.emit(event, ...args);
            return parent_emit && self_emit;
        };
        this.once = (event, listener) => {
            this._emitter.once(event, listener);
            return this;
        };
        // the rest is done by init() (called by static create) to handle async
    }
    /**
     * The DBPF v2.0 mode flag (AKA the "Index Table Type").
     * - see: [../docs/spec/DBPF.md - DBPF v2.0](../docs/spec/DBPF.md#dbpf-v20)
     *
     * @readonly
     */
    get mode() {
        if (this._mode_flag == null)
            throw new Error("DBPFIndexTable not initialized");
        return this._mode_flag;
    }
    /**
     * An array of indexes (in order) of where each header segment is reused in each entry.
     * - see: [../docs/spec/DBPF.md - DBPF v2.0](../docs/spec/DBPF.md#dbpf-v20)
     * - note: The header segments are shared segments between each entry, and are a way to save space in the DBPF file.
     *   - this means that the amount of bytes used by each entry is reduced by the amount of bytes used for the header segments.
     *
     * @readonly
     */
    get headerSegments() {
        if (!this._header_segments)
            throw new Error("DBPFIndexTable not initialized");
        return Array.from(this._header_segments.keys());
    }
    /**
     * The amount of memory used by each entry in the DBPF file.
     * - see: [../docs/spec/DBPF.md - DBPF v2.0](../docs/spec/DBPF.md#dbpf-v20)
     * - note: That this may not be the full 32 bytes, as the header segments are shared and reused in each entry.
     */
    get entryLength() {
        if (!this._entry_length)
            throw new Error("DBPFIndexTable not initialized");
        return this._entry_length;
    }
    /**
     * Initializes the DBPF Index Table asynchronously, evented.
     * @returns { EventedPromise<void> } An evented promise that resolves when the DBPF Index Table is initialized.
     * @public @deprecated use {@link DBPFIndexTable.create} instead
     */
    init() {
        return this._init || (this._init = new polyfill_events_1.EventedPromise(async (evented_resolve, evented_reject) => {
            if (this._DBPF.header.dbpf.major === 1) {
                if (this._DBPF.header.dbpf.minor === 1)
                    this._entry_length = 24;
                else
                    this._entry_length = 20;
            }
            else {
                try {
                    this._mode_flag = await this._reader.getInt(); // also referred to as type by other tools like SimPE and s4pi
                    // according to s4pi, the size of the header entry is determined by the number of set bits
                    // ... in the 4 least significant bits in the mode flag
                    // - the size is variable from 0 to 4 4-byte segments
                    // - see: https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi/Package/PackageIndex.cs#L38-L46
                    /*
                        According to s4pi, the resultant entries are of the same *total* size.
                        The amount of memory used by the entries (in the file) varies based on the above math.
                        
                        The first chunk of data after the mode flag is the header entry. This is a partial entry that
                            all full entries are based on.
        
                        The amount of 4-byte segments in the header entry is determined by the number of set bits in
                            the 4 least significant bits of the mode flag (note that the mode flag is 8 bytes or 32 bits long)
        
                        The bits for binary nums 8, 4, 2, and 1 (bit indexes 3, 2, 1, and 0 respectively) determine what parts of
                            each full entry are pulled from the partial header entry.
        
                        For example, for mode flag '3' (0b0011), 2 bits are set, so the header entry is only 2 4-byte segments long.
                        Since, the set bits are in bits 1 and 2 ("right-to-left" order),
                            the placement of the first and second header segments are the 1st and 2nd 4-byte
                            segments of each entry respectively.
                        
                        For mode flag '6' (0b0110), 2 bits are also set, so the header is 2 still just 4-byte segments long.
                        However, the set bits are in bits 2 and 3, so the placement of the first and second
                            shared header segments are in the 2nd and 3rd 4-byte segments of each entry respectively.
                            The first 4-byte segment is read normally from each entry iteration.
                    */
                    // binary math (based on s4pi):
                    const set_bits = Array
                        .from({ length: Uint32Array.BYTES_PER_ELEMENT }) // form an undefined[] array with a length based on sizeof(uint)
                        .map((unused, index) => index) // convert to an incrementing number array [0,1,2,...sizeof(uint)]
                        .filter(index => (this._mode_flag >> index) & 1); // filter the 4 least significant bits for set bits
                    // return their indexes
                    this._header_segments = new Map();
                    for (let bit of set_bits) {
                        const value = await this._reader.getInt();
                        this._header_segments.set(bit, value);
                    }
                    const total_header_length = 4 + (4 * set_bits.length); // 4 bytes for mode flag integer + 4 for each header segment
                    this._entry_length = (this.length - total_header_length) / this.size;
                    // ensure my math is right:
                    if (this._entry_length % 4)
                        throw new Error(`Invalid entry length: ${this._entry_length}`);
                }
                catch (error) {
                    evented_reject(error);
                }
            }
            evented_resolve();
        }, {
            emit: this.emit,
            events: {
                resolve: DBPFIndexTable.ON_INIT,
                reject: DBPFIndexTable.ON_ERROR
            }
        }));
    }
    /**
     * @override @deprecated No-ops. Implemented for Map interface.
     */
    set(key, value) {
        throw new Error("DBPFIndexTable is read-only");
    }
    /**
     * @override @deprecated No-ops. Implemented for Map interface.
     */
    delete(key) {
        throw new Error("DBPFIndexTable is read-only");
    }
    /**
     * @override @deprecated No-ops. Implemented for Map interface.
     */
    clear() {
        throw new Error("DBPFIndexTable is read-only");
    }
    /**
     * Gets a DBPF entry from the DBPF Index Table by index
     * @param key
     * @returns { EventedPromise<DBPFEntry> } An evented promise that resolves with the DBPF entry.
     * @override
     */
    get(key) {
        return new polyfill_events_1.EventedPromise(async (evented_resolve, evented_reject) => {
            const await_wrap = async (promise) => {
                if (!promise)
                    return;
                promise.catch(evented_reject);
                return await promise;
            };
            // TODO: This (and .init()) needs to be adapted for DBPF v1.x, currently this only supports v2.0 logic
            /*
            DBPF v1.x uses:
            - DBPF.header.index.first instead of DBPF.header.index.offset
            - entry size is determined by DBPF.header.index.minor instead of the mode flag
            - shorter entries (20/24 bytes instead of 32) often with 4 byte instances instead of 8
            */
            if (!this.has(key))
                throw new RangeError("Index out of bounds");
            await await_wrap(this.init());
            let entry = await await_wrap(super.get(key));
            if (!entry) {
                const v2_base_offset = this._DBPF.header.dbpf.major === 1 ? 0 : 4; // v1.x doesn't have a mode flag, and the offset is pulled from DBPF.header.index.first instead of DBPF.header.index.offset
                const v2_header_offset = 4 * (this._header_segments?.size || 0); // skip the header segments, since we already read them in init()
                this._reader.move(v2_base_offset + v2_header_offset); // move to the start of the first entry
                this._reader.advance(this.entryLength * key); // move to the start of the requested entry
                let type = this._header_segments?.get(0);
                if (type == null)
                    type = await await_wrap(this._reader.getInt());
                let group = this._header_segments?.get(1);
                if (group == null)
                    group = await await_wrap(this._reader.getInt());
                let instance_high = this._header_segments?.get(2);
                if (instance_high == null)
                    instance_high = await await_wrap(this._reader.getInt());
                if (this._DBPF.header.dbpf.major === 1) {
                    let instance_low;
                    if (this._DBPF.header.dbpf.minor === 1)
                        instance_low = (await await_wrap(this._reader.getInt()));
                    const offset = (await await_wrap(this._reader.getInt()));
                    const size_file = (await await_wrap(this._reader.getInt()));
                    const instance = instance_low != null ? (BigInt(instance_high) << 32n) | BigInt(instance_low) : instance_high;
                    entry = new DBPFEntry(this._DBPF, type, group, instance, offset, {
                        file: {
                            raw: size_file,
                            reduced: size_file & 0x7FFFFFFF
                        }
                    });
                }
                else {
                    let instance_low = this._header_segments.get(3);
                    if (instance_low == null)
                        instance_low = await await_wrap(this._reader.getInt());
                    const offset = (await await_wrap(this._reader.getInt()));
                    const size_file = (await await_wrap(this._reader.getInt()));
                    const size_memory = (await await_wrap(this._reader.getInt()));
                    const size_flag = (await await_wrap(this._reader.getShort()));
                    const unknown = (await await_wrap(this._reader.getShort()));
                    const instance = (BigInt(instance_high) << 32n) | BigInt(instance_low);
                    entry = new DBPFEntry(this._DBPF, type, group, instance, offset, {
                        file: {
                            raw: size_file,
                            reduced: size_file & 0x7FFFFFFF
                        },
                        memory: size_memory,
                        flag: size_flag
                    });
                }
                const init = new polyfill_events_1.EventedPromise(async (evented_resolve, evented_reject) => {
                    try {
                        for (let [index, plugin] of this._DBPF.plugins.entries()) {
                            entry = await plugin.parse(entry);
                        }
                    }
                    catch (error) {
                        evented_reject(error);
                    }
                    evented_resolve();
                }, {
                    emit: entry.emit,
                    events: {
                        resolve: DBPFEntry.ON_INIT,
                        reject: DBPFEntry.ON_ERROR
                    }
                });
                entry.init = () => init;
                super.set(key, Promise.resolve(entry));
            }
            evented_resolve(entry);
        }, {
            emit: this.emit,
            events: {
                resolve: DBPFIndexTable.ON_GET,
                reject: DBPFIndexTable.ON_ERROR
            }
        });
    }
    has(key) {
        return key >= 0 && key < this.size;
    }
    keys() {
        return Array.from({ length: this.size }, (_, index) => index).values();
    }
    values() {
        return Array.from({ length: this.size }, (_, index) => this.get(index)).values();
    }
    entries() {
        if (this.size !== super.size) {
            for (let index = 0; index < this.size; index++) {
                this.get(index);
            }
        }
        return super.entries();
    }
    forEach(callbackfn, thisArg) {
        if (this.size !== super.size) {
            for (let index = 0; index < this.size; index++) {
                this.get(index);
            }
        }
        super.forEach(callbackfn, thisArg);
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    /**
     * The event name for when the DBPF Index Table is created properly.
     * @event
     */
    static { this.ON_CREATE = "create"; }
    /**
     * The event name for when the DBPF Index Table is initialized.
     * @event
     */
    static { this.ON_INIT = "init"; }
    /**
     * The event name for when the DBPF Index Table retrieves an entry.
     */
    static { this.ON_GET = "get"; }
    /**
     * The event name for when the DBPF Index Table encounters an error.
     * @event
     */
    static { this.ON_ERROR = "error"; }
}
exports.DBPFIndexTable = DBPFIndexTable;
/**
 * The DBPF Entry class.
 *
 * It is a representation of a DBPF resource.
 * - see: [../docs/spec/DBPF.md - Table Entries (AKA "DBPF Resources")](../docs/spec/DBPF.md#table-entries-aka-dbpf-resources)
 */
class DBPFEntry extends polyfill_events_1.EventEmitter {
    /**
     * @param DBPF
     * @param type
     * @param group
     * @param instance
     * @param offset
     * @param size
     */
    constructor(DBPF, type, group, instance, offset, size) {
        super();
        /**
         * Retrive the DBPF resource as a Blob on demand. This is a memory-efficient way to handle the blobs read from the entry.
         *
         * NOTE: This method is designed to be overwritten by plugins. While it is an option, it is not recommended, as overwriting this method in one plugin may break it for other plugins.
         *
         * @param refresh Whether to refresh the blob. If set to `true`, the blob will be re-read from the entry.
         * @returns { Promise<Blob> } A promise that resolves with a Blob of the DBPF resource.
         */
        this.blob = async (refresh) => {
            // this is all done for memory efficiency
            // the reason this is necessary is because this blob is backed by in-process memory (buffer), instead of a file. Meaning that this blob will not be paged.
            if (this._blob && this.mimetype && !refresh) // if we already have the blob, the mimetype has been explicitly set, and we don't want to refresh, return the cached blob
                return this._blob;
            const out = new Blob([await this.reader.get()], { type: this.mimetype });
            if (this.mimetype) // only cache the blob if the mimetype is set. This ensures that the blob can be gc'd if it is unreferenced in the calling code.
                this._blob = out;
            return out;
        };
        this._DBPF = DBPF;
        this.type = type;
        this.group = group;
        this.instance = instance;
        this.offset = offset;
        this.size = size;
        this.reader = DBPF.read(offset, size.file.reduced);
        (0, polyfill_1.deepFreeze)(this.size);
    }
    /**
     * The event name for when the DBPF Entry is initialized.
     * @event
     */
    static { this.ON_INIT = "init"; }
    /**
     * The event name for when the DBPF Entry encounters an error.
     * @event
     */
    static { this.ON_ERROR = "error"; }
}
exports.DBPFEntry = DBPFEntry;
/**
 * This is the planned structure for the plugin system.
 *
 * This is a WIP.
 * @experimental
 */
class Plugin extends serde_1.Deserialized {
    /**
     * The function to parse the DBPF entry.
     *
     * When set, the provided function will automatically be bound to the plugin instance.
     */
    get parse() {
        return this._parse;
    }
    set parse(value) {
        this._parse = value.bind(this);
    }
    static from(obj) {
        const self = this instanceof Plugin ? this : new Plugin(undefined);
        return serde_1.Deserialized.from.call(self, obj);
    }
    static read(filepath) {
        filepath = (filepath ? resolve(filepath.trim()) : "");
        if (!filepath.length) {
            console.log(`Plugin-Deserializer: No file path provided`);
            return;
        }
        return new Plugin(filepath);
    }
    constructor(filepath) {
        super(filepath);
        this._parse = (entry) => Promise.resolve(entry);
        let script = filepath || "";
        script = script.trim();
        if (polyfill_1.polyfill.isNode && filepath) {
            script = isAbsolute(filepath) ? filepath : resolve(filepath);
        }
        this.parse = script.length ? polyfill_1.polyfill.require(script)?.plugin || this.parse : this.parse;
        this.path = script;
    }
}
/**
 * An array of {@link Plugin} instances.
 *
 * In addition to the [standard array methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array),
 * this class provides additional methods for convenience.
 *
 * Additionally, this class overrides and wraps some of the standard array methods to allow for string paths to be used in place of {@link Plugin} instances.
 *
 * @see {@link Plugin}
 * @experimental
 */
class PluginsList extends Array {
    /**
     * The default list of plugins to apply to DBPF files. To control the default list, a {@link Plugins} export is provided.
     *
     * Instances of the DBPF class contain a copy of this list, and can be modified separately. With that said, modifying this list will not propagate to existing DBPF instances.
     * However, note that the copy is shallow, so modifying the plugins themselves _will_ affect all instances.
     */
    static { this.default = new PluginsList(); }
    /**
     * Adds a plugin to the list. Accepts either a {@link Plugin} instance or a string path to a plugin file.
     *
     * @see [Array.push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     * @override
     */
    push(...items) {
        return super.push(...items.map(item => {
            if (typeof item === "string")
                return Plugin.read(item);
            return item;
        }));
    }
    /**
     * Alias for {@link PluginsList.push}
     */
    register(...items) {
        return this.push(...items);
    }
    /**
     * Adds a plugin to the beginning of the list. Accepts either a {@link Plugin} instance or a string path to a plugin file.
     *
     * @see [Array.unshift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     * @override
     */
    unshift(...items) {
        return super.unshift(...items.map(item => {
            if (typeof item === "string")
                return Plugin.read(item);
            return item;
        }));
    }
    /**
     * Alias for {@link PluginsList.unshift}
     */
    prioritize(...items) {
        return this.unshift(...items);
    }
    /**
     * Override for [Array.splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) to allow for string paths to be used in place of {@link Plugin} instances.
     *
     * @see [Array.splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     * @override
     */
    splice(start, deleteCount, ...rest) {
        rest = rest.map(item => {
            if (typeof item === "string")
                return Plugin.read(item);
            return item;
        });
        return super.splice(start, deleteCount, ...rest);
    }
    /**
     * Inserts a plugin at the specified index. Accepts either a {@link Plugin} instance or a string path to a plugin file.
     *
     * @param index The index to insert the plugin at.
     * @param plugins The plugins to insert.
     */
    insert(index, ...plugins) {
        this.splice(index, 0, ...plugins);
    }
    /**
     * Removes a plugin from the list. Accepts either a {@link Plugin} instance, a string path to a plugin file, or the index of the plugin to remove.
     *
     * @param plugins The plugins to remove. Can be a {@link Plugin} instance, a string path to a plugin file, or the index of the plugin to remove.
     */
    remove(...plugins) {
        const indeces = plugins.map(plugin => {
            if (typeof plugin === "number")
                return plugin;
            return this.indexOf(plugin);
        }).filter(index => index >= 0);
        indeces.forEach(index => this.splice(index, 1));
    }
    /**
     * Override for [Array.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) to allow for string paths to be used in place of {@link Plugin} instances.
     *
     * @see [Array.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     * @override
     */
    indexOf(item, fromIndex) {
        if (typeof item === "string")
            super.slice(fromIndex).findIndex(plugin => plugin.path === item);
        return super.indexOf(item, fromIndex);
    }
    /**
     * Override for [Array.lastIndexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf) to allow for string paths to be used in place of {@link Plugin} instances.
     *
     * @see [Array.lastIndexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     * @override
     */
    lastIndexOf(item, fromIndex) {
        if (typeof item === "string")
            super.slice(0, fromIndex)
                .map((plugin, index) => [plugin, index])
                .reverse()
                .find(([plugin]) => plugin.path === item)?.[1] || -1;
        return super.lastIndexOf(item, fromIndex);
    }
    /**
     * Override for [Array.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes) to allow for string paths to be used in place of {@link Plugin} instances.
     *
     * @see [Array.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     * @override
     */
    includes(item, fromIndex) {
        if (typeof item === "string")
            super.slice(fromIndex).some(plugin => plugin.path === item);
        return super.includes(item, fromIndex);
    }
    /**
     * @deprecated Throws. Do not use. Implemented for Array interface.
     */
    fill(value, start, end) {
        throw new Error("Do not mass-overwrite plugins");
    }
}
/**
 * @see {@link PluginsList.default}
 */
exports.Plugins = PluginsList.default;
/**
 * Constant export for UMD
 */
exports.dbpf = {
    Plugins: exports.Plugins,
    DBPF,
    DBPFEntry
};
// Plugins
const THUM = tslib_1.__importStar(__webpack_require__(/*! ./Plugins/ResourceTypes/THUM/plugin */ "./src/Plugins/ResourceTypes/THUM/plugin.ts"));
function handleInternalPlugin(path, internal_plugin) {
    const plugin = new Plugin();
    plugin.parse = internal_plugin.parse;
    plugin.path = "[internal] " + path;
    Object.freeze(plugin);
    exports.Plugins.push(plugin);
    return plugin;
}
Plugin.THUM = handleInternalPlugin("Plugins/ResourceTypes/THUM", THUM);


/***/ }),

/***/ "./src/LFUCache.ts":
/*!*************************!*\
  !*** ./src/LFUCache.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * LFUCache
 *
 * A simple implementation of a Least Frequently Used Cache with TTL
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LFUCache = void 0;
/**
 * LFUCache
 *
 * A simple implementation of a Least Frequently Used Cache with TTL
 */
class LFUCache {
    /**
     * @param capacity The amount of entries the cache can store
     * @param ttl The time-to-live of the cache entries
     */
    constructor(capacity, ttl) {
        this._capacity = capacity;
        this._ttl = ttl;
        this._cache = new Map();
        this._freq = new Map();
        this._minFreq = 0;
    }
    /**
     * The function used to evict entries from the cache
     * @param {CacheEntry<IndexType, CachedValueType>} [entry] If provided, evicts the provided entry, otherwise evicts the least recently used entry
     * @private
     */
    _evict(entry) {
        const frequency = entry?.freq || this._minFreq;
        const candidates = this._freq.get(frequency);
        if (!candidates)
            return;
        // remove the requested entry if provided, otherwise remove the least recently used
        const index = entry?.index || candidates.keys().next().value;
        // untrack from this freq
        candidates.delete(index);
        // untrack the entire frequency if no candidates left
        if (!candidates.size)
            this._freq.delete(frequency);
        // update min frequency
        if (this._minFreq === frequency)
            this._minFreq = this._freq.size ? this._freq.keys().next().value : 0;
        // remove from cache
        this._cache.delete(index);
    }
    /**
     * Increment the usage frequency of an entry
     * @param {CacheEntry<IndexType, CachedValueType>} entry The entry to increment the usage frequency of
     * @private
     */
    _increment(entry) {
        const { index, freq } = entry;
        // untrack from current frequency
        const frequency_family = this._freq.get(freq);
        frequency_family.delete(index);
        if (!frequency_family.size)
            this._freq.delete(freq);
        // track in new frequency
        const new_freq = ++entry.freq;
        this._minFreq = Math.min(this._minFreq, new_freq);
        const existing_frequency_family = this._freq.get(new_freq);
        if (existing_frequency_family)
            existing_frequency_family.add(index);
        else
            this._freq.set(new_freq, new Set([index]));
    }
    /**
     * Refresh the TTL of an entry
     * @param {CacheEntry<IndexType, CachedValueType>} entry The entry to refresh the TTL of
     * @private
     */
    _refresh(entry) {
        clearTimeout(entry.timer);
        entry.timer = setTimeout(() => this._evict(entry), this._ttl);
    }
    /**
     * The getter function to retrieve an entry from the cache
     * @param index The index of the entry to retrieve
     * @returns {CachedValueType | undefined} The value of the entry if found, otherwise undefined
     */
    get(index) {
        const entry = this._cache.get(index);
        if (!entry)
            return;
        this._increment(entry);
        this._refresh(entry);
        return entry.value;
    }
    /**
     * The setter function to set an entry in the cache
     * @param index The index of the entry to set
     * @param value The value of the entry to set
     * @returns {CachedValueType} The value of the entry
     */
    set(index, value) {
        if (this._capacity <= 0)
            return value;
        const existing_entry = this._cache.get(index);
        if (existing_entry) {
            existing_entry.value = value;
            this._increment(existing_entry);
            this._refresh(existing_entry);
            return value;
        }
        if (this._cache.size >= this._capacity)
            this._evict();
        const new_entry = {
            index,
            value,
            freq: 1,
            timer: setTimeout(() => this._evict(new_entry), this._ttl)
        };
        this._cache.set(index, new_entry);
        this._minFreq = 1;
        const frequency_family = this._freq.get(1);
        if (frequency_family)
            frequency_family.add(index);
        else
            this._freq.set(1, new Set([index]));
        return value;
    }
}
exports.LFUCache = LFUCache;


/***/ }),

/***/ "./src/Plugins/ResourceTypes/THUM/plugin.ts":
/*!**************************************************!*\
  !*** ./src/Plugins/ResourceTypes/THUM/plugin.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parse = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.mjs");
const details = tslib_1.__importStar(__webpack_require__(/*! ./details.json */ "./src/Plugins/ResourceTypes/THUM/details.json"));
const data = details.tables[0];
const ids = Object.keys(data);
const TAG = details.tag;
const LABEL = details.label;
const DOC = `https://anonhostpi.github.io/DBPF.js/docs/other/spec/sections/ResourceTypes#${TAG}---${LABEL}`;
const MAGIC = {
    PNG: 0x89504E47,
    JPG: 0xFFD8,
};
async function _parse(entry) {
    const _entry = entry;
    let magic;
    switch (_entry.details.type.trim()) {
        case "png":
            magic = await entry.reader.getBytesBE(4);
            if (magic !== MAGIC.PNG)
                console.warn(`DBPF Thumbnail Entry (0x${_entry.instance.toString(16)}) with non-compliant file type. Magic number:`, magic.toString(16), "Expected:", MAGIC.PNG.toString(16), `\n\nsee: ${DOC}`);
            break;
        case "jpg":
            magic = await entry.reader.getBytesBE(2);
            if (magic !== MAGIC.JPG)
                console.warn(`DBPF Thumbnail Entry (0x${_entry.instance.toString(16)}) with non-compliant file type. Magic number:`, magic.toString(16), "Expected:", MAGIC.JPG.toString(16), `\n\nsee: ${DOC}`);
            break;
        case "":
        case undefined:
            console.warn(`DBPF Thumbnail Entry (0x${_entry.instance.toString(16)}) with no type.`, `\n\nsee: ${DOC}`);
            magic = MAGIC.PNG;
            break;
        default:
            console.warn(`DBPF Thumbnail Entry (0x${_entry.instance.toString(16)}) with unrecognized type:`, _entry.details.type, `\n\nsee: ${DOC}`);
    }
    const isPNG = magic === MAGIC.PNG;
    const isJPG = magic?.toString(16).slice(0, 4).padStart(4, "0") === MAGIC.JPG.toString(16);
    if (!isPNG && !isJPG) {
        console.warn(`DBPF Thumbnail Entry (0x${_entry.instance.toString(16)}) file type not recognized. Entry will not be parsed.`, `\n\nsee: ${DOC}`);
        return;
    }
    const mimetype = isPNG ? "image/png" : "image/jpeg";
    _entry.mimetype = mimetype;
}
async function parse(entry, detailed) {
    const hex = "0x" + entry.type.toString(16).toUpperCase().padStart(8, "0");
    if (ids.includes(hex)) {
        // tag the entry
        entry.tag = TAG;
        // add metadata
        if (detailed)
            entry.details = data[hex];
        entry.details = {
            type: data[hex].type,
        };
        // begin parsing
        await _parse(entry);
    }
    return entry;
}
exports.parse = parse;


/***/ }),

/***/ "./src/imports.ts":
/*!************************!*\
  !*** ./src/imports.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * This file is generated by scripts/imports.js
 * Do NOT edit this file directly. Edit scripts/imports.js instead.
 *
 * This file is used to import all dependencies of the project.
 * This is necessary because Webpack does not support dynamic imports.
 */
__webpack_require__(/*! buffer */ "./node_modules/buffer/index.js");
__webpack_require__(/*! process */ "./node_modules/process/browser.js");


/***/ }),

/***/ "./src/polyfill.Buffer.ts":
/*!********************************!*\
  !*** ./src/polyfill.Buffer.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Polyfilled Buffer Types
 *
 * This module provides a polyfill for the Buffer class.
 *
 * @remarks
 * It also provides type definitions for BufferOffset and BufferLength.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Buffer = void 0;
const polyfill_1 = __webpack_require__(/*! ./polyfill */ "./src/polyfill.ts");
const buffer_1 = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js");
let polyfills = [
    { Buffer: buffer_1.Buffer }
];
if (polyfill_1.polyfill.isNode)
    polyfills.push("node:buffer");
const { Buffer: PolyfillBuffer } = (0, polyfill_1.polyfill)(...polyfills);
/**
 * The appropriate Buffer class for the current environment (browser or Node.js).
 */
exports.Buffer = PolyfillBuffer;


/***/ }),

/***/ "./src/polyfill.events.ts":
/*!********************************!*\
  !*** ./src/polyfill.events.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventedPromise = exports.EventEmitter = void 0;
const polyfill_1 = __webpack_require__(/*! ./polyfill */ "./src/polyfill.ts");
/**
 * A simple polyfill for the EventEmitter class from Node.js
 * - see: https://nodejs.org/api/events.html#class-eventemitter
 */
class _EventEmitter {
    constructor() {
        this.events = {}; // set as optional for the EventEmitter interface type
        this.emit = (event, ...args) => {
            if (!this.events[event])
                return false;
            this.events[event].forEach(listener => listener.apply(this, args));
            return true;
        };
    }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }
    off(event, listener) {
        if (!this.events[event])
            return this;
        this.events[event] = this.events[event].filter(l => l !== listener);
        return this;
    }
    once(event, listener) {
        const onceListener = (...args) => {
            this.off(event, onceListener);
            listener.apply(this, args);
        };
        this.on(event, onceListener);
        return this;
    }
}
let polyfills = [
    { EventEmitter: _EventEmitter }
];
if (polyfill_1.polyfill.isNode)
    polyfills.push("node:events");
exports.EventEmitter = (0, polyfill_1.polyfill)(...polyfills).EventEmitter;
/**
 * A Promise that emits events when resolved or rejected using a provided {@link EventEmitMethod} (EventEmitter.emit)
 */
class EventedPromise extends Promise {
    /**
     * @param executor The executor function to be passed to the Promise constructor
     * @param emit An {@link EventEmitMethod} or an object with an emit method and events object or a set of options for emitting:
     * - emit: The method to emit events. @see {@link EventEmitMethod}
     * - events: An object with the keys `resolve` and `reject` that specify the event names to emit when resolving and rejecting.
     */
    constructor(executor, emit = {
        emit: (event, ...args) => false,
        events: { resolve: "resolve", reject: "reject" }
    }) {
        const options = typeof emit === "function" ?
            { emit, events: { resolve: "resolve", reject: "reject" } } : emit;
        function wrapped_executor(engine_provided_resolve, engine_provided_reject) {
            function emitting_resolve(value) {
                engine_provided_resolve(value);
                options.emit(options.events.resolve, value);
            }
            ;
            function emitting_reject(reason) {
                engine_provided_reject(reason);
                options.emit(options.events.reject, reason);
            }
            ;
            try {
                const wrapped_out = executor(emitting_resolve, emitting_reject);
            }
            catch (e) {
                emitting_reject(e);
            }
        }
        super(wrapped_executor);
    }
}
exports.EventedPromise = EventedPromise;


/***/ }),

/***/ "./src/polyfill.fs.ts":
/*!****************************!*\
  !*** ./src/polyfill.fs.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fs = void 0;
const polyfill_1 = __webpack_require__(/*! ./polyfill */ "./src/polyfill.ts");
const polyfill_Buffer_1 = __webpack_require__(/*! ./polyfill.Buffer */ "./src/polyfill.Buffer.ts");
function assert(name, value, types) {
    let checks = types.map((type) => {
        if (typeof type === "string")
            return (value) => typeof value === type;
        else
            return (value) => value instanceof type;
    });
    if (!checks.some(check => check(value)))
        throw new TypeError(`Invalid argument for ${name}, expected one of:\n- ${types.join("\n- ")}`);
}
let polyfills = [
    {
        read: function (file, buffer, offset, length, position, callback) {
            if (typeof file === "number")
                throw new Error("FileDescriptor not supported in browser environment");
            assert("file", file, [Blob]);
            assert("buffer", buffer, [polyfill_Buffer_1.Buffer]);
            assert("offset", offset, ["number", "undefined"]);
            offset = offset === undefined ? 0 : offset;
            assert("length", length, ["number", "undefined"]);
            length = length === undefined ? buffer.length : length;
            assert("position", position, ["number", "undefined"]);
            position = position === undefined ? 0 : position;
            assert("callback", callback, ["function", "undefined"]);
            const adjusted_length = Math.min(buffer.length - offset, length);
            file.arrayBuffer().then((blobBuffer) => {
                blobBuffer = polyfill_Buffer_1.Buffer.from(blobBuffer);
                blobBuffer.copy(buffer, offset, position, position + adjusted_length);
            }).catch(callback).finally(() => {
                callback(null, adjusted_length, buffer);
            });
        },
        readSync: function (file, buffer, offset, length, position) {
            if (typeof file === "number")
                throw new Error("FileDescriptor not supported in browser environment");
            assert("file", file, [Blob]);
            assert("buffer", buffer, [polyfill_Buffer_1.Buffer]);
            assert("offset", offset, ["number", "undefined"]);
            offset = offset === undefined ? 0 : offset;
            assert("length", length, ["number", "undefined"]);
            length = length === undefined ? buffer.length : length;
            assert("position", position, ["number", "undefined"]);
            position = position === undefined ? 0 : position;
            const adjusted_length = Math.min(buffer.length - offset, length);
            const url = URL.createObjectURL(file);
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
            xhr.send();
            URL.revokeObjectURL(url);
            const byte_array = Array.from(xhr.responseText).map(char => char.charCodeAt(0) & 0xFF);
            const blobBuffer = polyfill_Buffer_1.Buffer.from(byte_array);
            blobBuffer.copy(buffer, offset, position, position + adjusted_length);
            return adjusted_length;
        }
    }
];
if (polyfill_1.polyfill.isNode)
    polyfills.push("node:fs");
const { read, readSync, open, openSync, openAsBlob, close, closeSync, statSync, existsSync } = (0, polyfill_1.polyfill)(...polyfills);
exports.fs = {
    read,
    readSync,
    open,
    openSync,
    openAsBlob,
    close,
    closeSync,
    statSync,
    existsSync
};


/***/ }),

/***/ "./src/polyfill.ts":
/*!*************************!*\
  !*** ./src/polyfill.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Polyfill Utility
 *
 * provides utilities for safely polyfilling modules and objects in JS
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AggregateError = exports.polyfill = exports.deepFreeze = void 0;
/**
 * Polyfill automatically loads the auto-generated imports file for Webpack.
 */
__webpack_require__(/*! ./imports */ "./src/imports.ts");
const { assign, defineProperty, freeze, getOwnPropertyNames } = Object;
const { hasOwnProperty } = Object.prototype;
/**
 * A utility function to deep freeze an object.
 *
 * @param object The object to freeze
 * @returns The frozen object
 */
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = getOwnPropertyNames(object);
    // Freeze properties before freezing the object itself
    for (const name of propNames) {
        const value = object[name];
        // If value is an object, recursively freeze it
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }
    // Freeze the object itself
    return freeze(object);
}
exports.deepFreeze = deepFreeze;
const hasRequire = typeof (globalThis.require || (typeof window !== "undefined" && window.require) || __webpack_require__("./src sync recursive")) === 'function';
const isNode = !!(typeof process !== "undefined" && process.versions && process.release);
const safe_require = hasRequire && typeof window === "undefined" ? (globalThis.require || __webpack_require__("./src sync recursive")) : (() => {
    const cache = {};
    const acceptable_js_responses = [
        // Javascript
        'application/x-javascript',
        'application/javascript',
        'text/javascript',
        'text/ecmascript',
        'application/ecmascript',
    ];
    const acceptable_json_responses = [
        // JSON
        'application/json',
        'text/json',
        'application/x-json',
        'text/x-json',
    ];
    return ((module) => {
        if (typeof safe_require.original !== "undefined") {
            try {
                const out = safe_require.original(module);
                if (out)
                    return out;
            }
            catch (err) {
                console.warn(err);
            }
        }
        if (!hasOwnProperty.call(cache, module)) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', module, false);
            try {
                xhr.send();
                if (xhr.status === 200) {
                    if (acceptable_js_responses.includes(xhr.getResponseHeader('Content-Type'))) {
                        const fnBody = 'var module = {}; var exports = module.exports = {};\n' + xhr.responseText + '\nreturn exports;';
                        cache[module] = (new Function(fnBody)).call({});
                    }
                    else if (acceptable_json_responses.includes(xhr.getResponseHeader('Content-Type'))) {
                        cache[module] = JSON.parse(xhr.responseText);
                    }
                }
            }
            catch (error) {
                console.warn(error);
            }
        }
        return cache[module];
    });
})();
if (hasRequire && typeof window !== "undefined") {
    safe_require.original = (globalThis.require || window.require || __webpack_require__("./src sync recursive"));
}
/**
 * The primary polyfill utility.
 *
 * It functions similarly to `Object.assign()`, but with the ability to load string arguments via `require()`.
 * @param {string | Object} modules The modules to merge/polyfill
 * @returns {Object} The merged/polyfilled object
 * @example
 * ```typescript
 * // merge two objects into a new one, like Object.assign()
 * const merged = polyfill( { a: 1, overwritten: 3 }, { b: 2, overwritten: 4 } );
 * // - out: { a: 1, b: 2, overwritten: 4 }
 *
 * // merge two modules into a new one
 * const fs_path_merged = polyfill('fs', 'path');
 * // - out: provides an fs-like module populated/overwritten with path's exports
 *
 * // provide browser polyfills and overwrite them with Node.js APIs, if those APIs are available:
 * const path = polyfill( 'path-browserify', 'path' );
 *
 * // provide your own polyfills
 * const { isAbsolute } = polyfill(
 *     {
 *         isAbsolute: (path: string) => /^[a-zA-Z]:[\\/]/.test(path)
 *     },
 *     "path"
 * )
 * ```
 */
const polyfill = (...modules) => {
    modules = modules.map((mod) => {
        switch (typeof mod) {
            case 'string':
                return safe_require(mod) || {};
            default:
                return mod;
        }
    });
    return assign({}, ...modules);
};
exports.polyfill = polyfill;
exports.polyfill.check = () => hasRequire;
exports.polyfill.require = safe_require;
defineProperty(exports.polyfill, 'isNode', {
    writable: false,
    configurable: false,
    value: isNode
});
/**
 * An AggregateError is an error that aggregates multiple errors into a single error.
 */
const { AggregateError } = (0, exports.polyfill)({
    AggregateError: class AggregateError extends Error {
        constructor(errors, message, options) {
            super(message);
            this.name = 'AggregateError';
            this.errors = errors;
        }
    }
}, globalThis);
exports.AggregateError = AggregateError;


/***/ }),

/***/ "./src/serde.ts":
/*!**********************!*\
  !*** ./src/serde.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Serde
 *
 * A TypeScript library for serializing and deserializing JSON files in a Rust-like manner.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Deserialized = void 0;
/**
 * @ignore
 */
const polyfill_1 = __webpack_require__(/*! ./polyfill */ "./src/polyfill.ts");
let polyfills = [
    {
        isAbsolute: (path) => /^[a-zA-Z]:[\\/]/.test(path),
        resolve: (...paths) => {
            paths = paths.map(path => path.replace(/\\/g, '/')).filter(path => path.length);
            return paths.join('/');
        },
        existsSync: () => true,
        writeFileSync: () => { }, // no-op
        cwd: () => ""
    }
];
if (polyfill_1.polyfill.isNode)
    polyfills.push("node:path", "node:fs");
if (globalThis.process)
    polyfills.push(globalThis.process);
const { 
// path
isAbsolute: isAbsolutePath, resolve: resolvePath, 
// fs
existsSync: fs_exists, writeFileSync: fs_write, 
// process
cwd } = (0, polyfill_1.polyfill)(...polyfills);
function validateEnumerableTemplate(obj, typeTemplate) {
    for (const key in typeTemplate) {
        if (typeof typeTemplate[key] === 'object' && typeTemplate[key] !== null) {
            if (!validateEnumerableTemplate(obj[key], typeTemplate[key])) {
                return false;
            }
        }
        else if (typeof obj[key] !== typeof typeTemplate[key]) {
            return false;
        }
    }
    return true;
}
function sanitize_path(unclean_path = "", exists = false, constructor_name = "JSON") {
    if (constructor_name === "Deserialized")
        constructor_name = "JSON";
    let cleaned = unclean_path.trim();
    if (!cleaned.length)
        return "";
    if (!polyfill_1.polyfill.check()) {
        console.warn("Node.js functionality is not available");
        return cleaned;
    }
    try {
        cleaned = isAbsolutePath(cleaned) ? cleaned : resolvePath(cwd(), cleaned);
        if (!cleaned.endsWith('.json')) {
            throw `${constructor_name}-Deserializer: Invalid file extension: ${cleaned}`;
        }
        if (exists && !fs_exists(cleaned)) {
            throw `${constructor_name}-Deserializer: File not found: ${cleaned}`;
        }
        return cleaned;
    }
    catch (error) {
        throw new polyfill_1.AggregateError([error], `${constructor_name}-Deserializer: Error sanitizing path: ${cleaned}`);
    }
}
/**
 * A class for deserializing JSON files.
 *
 * Based on how deserialization is implemented in the Rust programming language.
 */
class Deserialized {
    /**
     * @param filepath - The file path of the JSON file.
     */
    constructor(filepath) {
        this.log_name = this.constructor.name === "Deserialized" ? "JSON" : this.constructor.name;
        this.filepath = sanitize_path(filepath, false, this.log_name);
        if (!new.target) {
            if (!(this instanceof Deserialized))
                return new Deserialized(filepath);
        }
        if (this.filepath.length)
            this.load();
    }
    /**
     * The path to the underlying JSON file, if provided.
     */
    get json() {
        return this.filepath;
    }
    /**
     * Load the JSON file.
     *
     * @param new_path - The new file path to load, if different from the current file path.
     * @returns {Boolean} Whether the file was successfully loaded.
     */
    load(new_path) {
        new_path = sanitize_path(new_path, false, this.log_name);
        if (new_path.length)
            this.filepath = new_path;
        if (!this.filepath.length) {
            console.warn(`${this.log_name}-Deserializer: No file path provided`);
            return false;
        }
        try {
            const deserialized = polyfill_1.polyfill.require(this.filepath);
            Deserialized.from.call(this, deserialized);
            return true;
        }
        catch (err) {
            console.warn(`${this.log_name}-Deserializer: Error loading file: ${this.filepath}`, err);
            return false;
        }
    }
    /**
     * Save the JSON file.
     *
     * @param new_path - The new file path to save, if different from the current file path.
     * @returns {Boolean} Whether the file was successfully saved.
     */
    save(new_path) {
        new_path = sanitize_path(new_path, false, this.log_name);
        if (new_path.length)
            this.filepath = new_path;
        if (!this.filepath.length) {
            console.log(`${this.log_name}-Deserializer: No file path provided`);
            return false;
        }
        try {
            fs_write(this.filepath, JSON.stringify(this), 'utf8');
            return true;
        }
        catch (err) {
            console.warn(`${this.log_name}-Deserializer: Error saving file: ${this.filepath}`, err);
            return false;
        }
    }
    /**
     * Transform an object into a Deserialized instance.
     *
     * Commonly used by child classes to ensure that the object conforms to the class structure.
     *
     * @param {any} [this] The instance of the class to transform the object onto, if bound.
     * @param obj The object to transform.
     * @param strict Whether to strictly enforce the class structure by key.
     * @param typesafe Whether to strictly also enforce the class structure by type. Does nothing if `strict` is `false`.
     * @returns {Deserialized} The transformed object.
     */
    static { this.from = function (obj, strict = true, typesafe = true) {
        const self = this instanceof Deserialized ? this : new Deserialized();
        obj = JSON.parse(JSON.stringify(obj));
        const keys = Object.keys(self);
        for (const key in obj) {
            if (typeof self[key] !== "function") {
                if (strict && keys.includes(key)) {
                    if (typesafe) {
                        if (typeof self[key] === typeof obj[key]) {
                            if (typeof self[key] === "object") {
                                if (validateEnumerableTemplate(obj[key], self[key])) {
                                    self[key] = obj[key];
                                }
                            }
                            else {
                                self[key] = obj[key];
                            }
                        }
                    }
                    else {
                        self[key] = obj[key];
                    }
                }
                else if (!strict) {
                    self[key] = obj[key];
                }
            }
        }
        return self;
    }; }
    /**
     * A static method to create a new Deserialized instance from a path
     *
     * @param filepath The file path of the JSON file.
     * @returns {Deserialized} The Deserialized instance.
     */
    static read(filepath) {
        filepath = sanitize_path(filepath);
        if (!filepath.length) {
            throw `JSON-Deserializer: No file path provided`;
        }
        return new Deserialized(filepath);
    }
}
exports.Deserialized = Deserialized;


/***/ }),

/***/ "./src sync recursive":
/*!*******************!*\
  !*** ./src/ sync ***!
  \*******************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "./src sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "./node_modules/tslib/tslib.es6.mjs":
/*!******************************************!*\
  !*** ./node_modules/tslib/tslib.es6.mjs ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __addDisposableResource: () => (/* binding */ __addDisposableResource),
/* harmony export */   __assign: () => (/* binding */ __assign),
/* harmony export */   __asyncDelegator: () => (/* binding */ __asyncDelegator),
/* harmony export */   __asyncGenerator: () => (/* binding */ __asyncGenerator),
/* harmony export */   __asyncValues: () => (/* binding */ __asyncValues),
/* harmony export */   __await: () => (/* binding */ __await),
/* harmony export */   __awaiter: () => (/* binding */ __awaiter),
/* harmony export */   __classPrivateFieldGet: () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   __classPrivateFieldIn: () => (/* binding */ __classPrivateFieldIn),
/* harmony export */   __classPrivateFieldSet: () => (/* binding */ __classPrivateFieldSet),
/* harmony export */   __createBinding: () => (/* binding */ __createBinding),
/* harmony export */   __decorate: () => (/* binding */ __decorate),
/* harmony export */   __disposeResources: () => (/* binding */ __disposeResources),
/* harmony export */   __esDecorate: () => (/* binding */ __esDecorate),
/* harmony export */   __exportStar: () => (/* binding */ __exportStar),
/* harmony export */   __extends: () => (/* binding */ __extends),
/* harmony export */   __generator: () => (/* binding */ __generator),
/* harmony export */   __importDefault: () => (/* binding */ __importDefault),
/* harmony export */   __importStar: () => (/* binding */ __importStar),
/* harmony export */   __makeTemplateObject: () => (/* binding */ __makeTemplateObject),
/* harmony export */   __metadata: () => (/* binding */ __metadata),
/* harmony export */   __param: () => (/* binding */ __param),
/* harmony export */   __propKey: () => (/* binding */ __propKey),
/* harmony export */   __read: () => (/* binding */ __read),
/* harmony export */   __rest: () => (/* binding */ __rest),
/* harmony export */   __runInitializers: () => (/* binding */ __runInitializers),
/* harmony export */   __setFunctionName: () => (/* binding */ __setFunctionName),
/* harmony export */   __spread: () => (/* binding */ __spread),
/* harmony export */   __spreadArray: () => (/* binding */ __spreadArray),
/* harmony export */   __spreadArrays: () => (/* binding */ __spreadArrays),
/* harmony export */   __values: () => (/* binding */ __values),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
  function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
  function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  function next() {
    while (env.stack.length) {
      var rec = env.stack.pop();
      try {
        var result = rec.dispose && rec.dispose.call(rec.value);
        if (rec.async) return Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
      }
      catch (e) {
          fail(e);
      }
    }
    if (env.hasError) throw env.error;
  }
  return next();
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
});


/***/ }),

/***/ "./src/Plugins/ResourceTypes/THUM/details.json":
/*!*****************************************************!*\
  !*** ./src/Plugins/ResourceTypes/THUM/details.json ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"tag":"THUM","label":"Thumbnail","tables":[{"0x3C1AF1F2":{"value":"0X3C1AF1F2","type":"png","description":"CAS Part Thumbnail","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L30","https://github.com/sims4toolkit/models/blob/4345132fab79a92516095d22d9458b0db334dce5/src/lib/enums/binary-resources.ts#L12"]},"0x5B282D45":{"value":"0X5B282D45","type":"png","description":"Body Part Thumbnail","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L31","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L182"]},"0x9C925813":{"value":"0X9C925813","type":"png","description":"Sim Preset Thumbnail","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L41","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L1218"]},"0xCD9DE247":{"value":"0XCD9DE247","type":"png","description":"Sim Featured Outfilt Thumbnail","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L44","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L1168"]},"0x0580A2B4":{"value":"0X0580A2B4","type":"png","description":"Catalog Object\\\\* - 32x32","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L1","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L43","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x0580A2B5":{"value":"0X0580A2B5","type":"png","description":"Catalog Object\\\\* - 128x128","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L2","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L43","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x0580A2B6":{"value":"0X0580A2B6","type":"png","description":"Catalog Object\\\\* - 256x256","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L3","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L43","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x0589DC44":{"value":"0X0589DC44","type":"png","description":"Catalog Wall/Floor Pattern - 32x32","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L7","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L55","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x0589DC45":{"value":"0X0589DC45","type":"png","description":"Catalog Wall/Floor Pattern - 128x128","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L8","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L55","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x0589DC46":{"value":"0X0589DC46","type":"png","description":"Catalog Wall/Floor Pattern - 256x256","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L9","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L55","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x0589DC47":{"value":"0X0589DC47","type":"png","description":"Wallpaper Texture","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L10","https://modthesims.info/download.php?p=3078566#post3078566"]},"0x05B17698":{"value":"0X05B17698","type":"png","description":"Catalog Fireplace - 32x32","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L11","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L51","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x05B17699":{"value":"0X05B17699","type":"png","description":"Catalog Fireplace - 128x128","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L12","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L51","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x05B1769A":{"value":"0X05B1769A","type":"png","description":"Catalog Fireplace - 256x256","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L13","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L51","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x05B1B524":{"value":"0X05B1B524","type":"png","description":"Catalog Terrain Paint Brush - 32x32","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L14","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L50","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x05B1B525":{"value":"0X05B1B525","type":"png","description":"Catalog Terrain Paint Brush - 128x128","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L15","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L50","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x05B1B526":{"value":"0X05B1B526","type":"png","description":"Catalog Terrain Paint Brush - 256x256","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L16","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L50","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x2653E3C8":{"value":"0X2653E3C8","type":"png","description":"Catalog Fence - 32x32","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L18","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L45","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x2653E3C9":{"value":"0X2653E3C9","type":"png","description":"Catalog Fence - 128x128","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L19","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L45","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x2653E3CA":{"value":"0X2653E3CA","type":"png","description":"Catalog Fence - 256x256","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L20","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L45","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x2D4284F0":{"value":"0X2D4284F0","type":"png","description":"Catalog Railing - 32x32","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L21","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L49","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x2D4284F1":{"value":"0X2D4284F1","type":"png","description":"Catalog Railing - 128x128","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L22","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L49","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x2D4284F2":{"value":"0X2D4284F2","type":"png","description":"Catalog Railing - 256x256","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L23","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L49","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x5DE9DBA0":{"value":"0X5DE9DBA0","type":"png","description":"Catalog Stairs - 32x32","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L32","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L46","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x5DE9DBA1":{"value":"0X5DE9DBA1","type":"png","description":"Catalog Stairs - 128x128","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L33","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L46","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x5DE9DBA2":{"value":"0X5DE9DBA2","type":"png","description":"Catalog Stairs - 256x256","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L34","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L46","https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail"]},"0x626F60CC":{"value":"0X626F60CC","type":"png","description":"Create-a-Sim Color Preset - 32x32","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L35","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L42","https://pandemonium91.wixsite.com/pandemonic-art/create-cas-presets-easily#5.%20Changing%20thumbnails%20and%20deleting%20extras:~:text=Once%20again%2C%20open%20your%20item%20in%20S3PE%20and%20look%20for%20the%20THUM%20resources.%20Normally%2C%20the%20game%20will%20generate%203%20sizes%20of%20thumbnails%3A%2032x32%20px%20(THUM%200x626F60CC)%2C%20128x128%20px%20(THUM%200x626F60CD)%20and%20256x256%20px%20(THUM%200x626F60CE)%20%E2%80%94%20we%20are%20only%20interested%20in%20the%20third%20type."]},"0x626F60CD":{"value":"0X626F60CD","type":"png","description":"Create-a-Sim Color Preset - 128x128","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L35","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L42","https://pandemonium91.wixsite.com/pandemonic-art/create-cas-presets-easily#5.%20Changing%20thumbnails%20and%20deleting%20extras:~:text=Once%20again%2C%20open%20your%20item%20in%20S3PE%20and%20look%20for%20the%20THUM%20resources.%20Normally%2C%20the%20game%20will%20generate%203%20sizes%20of%20thumbnails%3A%2032x32%20px%20(THUM%200x626F60CC)%2C%20128x128%20px%20(THUM%200x626F60CD)%20and%20256x256%20px%20(THUM%200x626F60CE)%20%E2%80%94%20we%20are%20only%20interested%20in%20the%20third%20type."]},"0x626F60CE":{"value":"0X626F60CE","type":"png","description":"Create-a-Sim Color Preset - 256x256","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L35","https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L42","https://pandemonium91.wixsite.com/pandemonic-art/create-cas-presets-easily#5.%20Changing%20thumbnails%20and%20deleting%20extras:~:text=Once%20again%2C%20open%20your%20item%20in%20S3PE%20and%20look%20for%20the%20THUM%20resources.%20Normally%2C%20the%20game%20will%20generate%203%20sizes%20of%20thumbnails%3A%2032x32%20px%20(THUM%200x626F60CC)%2C%20128x128%20px%20(THUM%200x626F60CD)%20and%20256x256%20px%20(THUM%200x626F60CE)%20%E2%80%94%20we%20are%20only%20interested%20in%20the%20third%20type."]},"0xFCEAB65B":{"value":"0XFCEAB65B","type":"png","description":"Custom Colourswatch","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L48","https://github.com/kitlith/sims3-rs/blob/c841e7ac71f7f9a01e7e828b2501b243371ff752/src/dbpf/filetypes.rs#L115","https://modthesims.info/wiki.php?title=Sims_3:TestTable#:~:text=Thumbnail%20for%20packaged%20custom%20colourswatch"]},"0xAD366F95":{"value":"0XAD366F95","type":"png","description":"Ingredients/Seed","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L42","https://modthesims.info/download.php?p=3078566#post3078566","https://modthesims.info/showthread.php?p=4613964#post4613964"]},"0xAD366F96":{"value":"0XAD366F96","type":"png","description":"Plate with a Sandwich","sources":["https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L43","https://modthesims.info/download.php?p=3078566#post3078566"]},"0x0D338A3A":{"value":"0X0D338A3A","type":"jpg","description":"Lot Preview Thumbnail","sources":["https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L97","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L687"]},"0x16CCF748":{"value":"0X16CCF748","type":"jpg","description":"Sim Portrait Thumbnail","sources":["https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L99","https://modthesims.info/showthread.php?p=4970712#post4970712"]},"0x3C2A8647":{"value":"0X3C2A8647","type":"jpg","description":"Buy/Build Mode Thumbnail","sources":["https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L125","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L235"]},"0xA1FF2FC4":{"value":"0XA1FF2FC4","type":"jpg","description":"Worldmap Lot Thumbnail","sources":["https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L160","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L1810"]},"0xE18CAEE2":{"value":"0XE18CAEE2","type":"jpg","description":"Sim Portrait Thumbnail","sources":["https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L191","https://modthesims.info/showthread.php?p=4970712#post4970712"]},"0xE254AE6E":{"value":"0XE254AE6E","type":"jpg","description":"Sim Portrait Thumbnail","sources":["https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L193","https://modthesims.info/showthread.php?p=4970712#post4970712"]},"0x8E71065D":{"value":"0X8E71065D","type":"png","description":"Pet Breed Thumbnail","sources":["https://github.com/s4ptacle/Sims4Tools/blob/b5db166dd4b935abc9f47c4c998fce98c61bd4de/s4pi%20Extras/Extensions/Extensions.txt#L172","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L885"]},"0xB67673A2":{"value":"0XB67673A2","type":"png","description":"Pet Face Preset Thumbnail","sources":["https://github.com/s4ptacle/Sims4Tools/blob/b5db166dd4b935abc9f47c4c998fce98c61bd4de/s4pi%20Extras/Extensions/Extensions.txt#L210","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L901"]},"0xAB19BCBA":{"value":"0XAB19BCBA","type":"png","description":"Apartment Thumbnail 1","sources":["https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L87"]},"0xBD491726":{"value":"0XBD491726","type":"png","description":"Apartment Thumbnail 2","sources":["https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L93"]},"0x0119B36D":{"value":"0X0119B36D","type":"png","description":"","sources":["https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L923"]},"0x2F7D0004":{"value":"0X2F7D0004","type":"png","description":"Moodlet Background Blends","sources":["https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L929","https://github.com/Sims4Group/Sims4Group.github.io/blob/e993a6a5f917bea91763b8061b95725d6e224ab2/Sims-4---Packed-File-Types.mediawiki?plain=1#L52","https://github.com/Echoweaver/Sims3Game/blob/ac087794c787d33c953688f13cf490b543b3ecd8/WarriorCats/Apprentice/MentorMedicine.cs#L89-L90","https://github.com/Echoweaver/Sims3Game/blob/ac087794c787d33c953688f13cf490b543b3ecd8/Echoweaver.Sims3Game.PetFighting/EWPetSuccumbToWounds.cs#L31-L48","https://github.com/kitlith/sims3-rs/blob/c841e7ac71f7f9a01e7e828b2501b243371ff752/src/dbpf/filetypes.rs#L97"]},"0x3BD45407":{"value":"0X3BD45407","type":"png","description":"Sim Household Thumbnail","sources":["https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L123","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L1185"]},"0xD33C281E":{"value":"0XD33C281E","type":"png","description":"Blueprint Image","sources":["https://github.com/s4ptacle/Sims4Tools/blob/b5db166dd4b935abc9f47c4c998fce98c61bd4de/s4pi%20Extras/Extensions/Extensions.txt#L238","https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L176"]}}]}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/DBPF.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});