"use strict";
var __initSpacetimeDBBridge = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray2;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1)
          validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray2(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/spacetimedb/dist/index.browser.mjs
  var import_base64_js = __toESM(require_base64_js(), 1);
  var _a;
  var TimeDuration = (_a = class {
    constructor(micros) {
      __publicField(this, "__time_duration_micros__");
      this.__time_duration_micros__ = micros;
    }
    /**
     * Get the algebraic type representation of the {@link TimeDuration} type.
     * @returns The algebraic type representation of the type.
     */
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [
          {
            name: "__time_duration_micros__",
            algebraicType: AlgebraicType.I64
          }
        ]
      });
    }
    get micros() {
      return this.__time_duration_micros__;
    }
    get millis() {
      return Number(this.micros / _a.MICROS_PER_MILLIS);
    }
    static fromMillis(millis) {
      return new _a(BigInt(millis) * _a.MICROS_PER_MILLIS);
    }
    /** This outputs the same string format that we use in the host and in Rust modules */
    toString() {
      const micros = this.micros;
      const sign = micros < 0 ? "-" : "+";
      const pos = micros < 0 ? -micros : micros;
      const secs = pos / 1000000n;
      const micros_remaining = pos % 1000000n;
      return `${sign}${secs}.${String(micros_remaining).padStart(6, "0")}`;
    }
  }, __publicField(_a, "MICROS_PER_MILLIS", 1000n), _a);
  var _a2;
  var Timestamp = (_a2 = class {
    constructor(micros) {
      __publicField(this, "__timestamp_micros_since_unix_epoch__");
      this.__timestamp_micros_since_unix_epoch__ = micros;
    }
    get microsSinceUnixEpoch() {
      return this.__timestamp_micros_since_unix_epoch__;
    }
    /**
     * Get the algebraic type representation of the {@link Timestamp} type.
     * @returns The algebraic type representation of the type.
     */
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [
          {
            name: "__timestamp_micros_since_unix_epoch__",
            algebraicType: AlgebraicType.I64
          }
        ]
      });
    }
    /**
     * Get a `Timestamp` representing the execution environment's belief of the current moment in time.
     */
    static now() {
      return _a2.fromDate(/* @__PURE__ */ new Date());
    }
    /**
     * Get a `Timestamp` representing the same point in time as `date`.
     */
    static fromDate(date) {
      const millis = date.getTime();
      const micros = BigInt(millis) * _a2.MICROS_PER_MILLIS;
      return new _a2(micros);
    }
    /**
     * Get a `Date` representing approximately the same point in time as `this`.
     *
     * This method truncates to millisecond precision,
     * and throws `RangeError` if the `Timestamp` is outside the range representable as a `Date`.
     */
    toDate() {
      const micros = this.__timestamp_micros_since_unix_epoch__;
      const millis = micros / _a2.MICROS_PER_MILLIS;
      if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) {
        throw new RangeError(
          "Timestamp is outside of the representable range of JS's Date"
        );
      }
      return new Date(Number(millis));
    }
    since(other) {
      return new TimeDuration(
        this.__timestamp_micros_since_unix_epoch__ - other.__timestamp_micros_since_unix_epoch__
      );
    }
  }, __publicField(_a2, "MICROS_PER_MILLIS", 1000n), /**
   * The Unix epoch, the midnight at the beginning of January 1, 1970, UTC.
   */
  __publicField(_a2, "UNIX_EPOCH", new _a2(0n)), _a2);
  var _buffer, _view, _offset, _expandBuffer, expandBuffer_fn, _a3;
  var BinaryWriter = (_a3 = class {
    constructor(size) {
      __privateAdd(this, _expandBuffer);
      __privateAdd(this, _buffer, void 0);
      __privateAdd(this, _view, void 0);
      __privateAdd(this, _offset, 0);
      __privateSet(this, _buffer, new Uint8Array(size));
      __privateSet(this, _view, new DataView(__privateGet(this, _buffer).buffer));
    }
    toBase64() {
      return (0, import_base64_js.fromByteArray)(__privateGet(this, _buffer).subarray(0, __privateGet(this, _offset)));
    }
    getBuffer() {
      return __privateGet(this, _buffer).slice(0, __privateGet(this, _offset));
    }
    get offset() {
      return __privateGet(this, _offset);
    }
    writeUInt8Array(value) {
      const length = value.length;
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 4 + length);
      this.writeU32(length);
      __privateGet(this, _buffer).set(value, __privateGet(this, _offset));
      __privateSet(this, _offset, __privateGet(this, _offset) + value.length);
    }
    writeBool(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 1);
      __privateGet(this, _view).setUint8(__privateGet(this, _offset), value ? 1 : 0);
      __privateSet(this, _offset, __privateGet(this, _offset) + 1);
    }
    writeByte(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 1);
      __privateGet(this, _view).setUint8(__privateGet(this, _offset), value);
      __privateSet(this, _offset, __privateGet(this, _offset) + 1);
    }
    writeI8(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 1);
      __privateGet(this, _view).setInt8(__privateGet(this, _offset), value);
      __privateSet(this, _offset, __privateGet(this, _offset) + 1);
    }
    writeU8(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 1);
      __privateGet(this, _view).setUint8(__privateGet(this, _offset), value);
      __privateSet(this, _offset, __privateGet(this, _offset) + 1);
    }
    writeI16(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 2);
      __privateGet(this, _view).setInt16(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 2);
    }
    writeU16(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 2);
      __privateGet(this, _view).setUint16(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 2);
    }
    writeI32(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 4);
      __privateGet(this, _view).setInt32(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 4);
    }
    writeU32(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 4);
      __privateGet(this, _view).setUint32(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 4);
    }
    writeI64(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 8);
      __privateGet(this, _view).setBigInt64(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 8);
    }
    writeU64(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 8);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 8);
    }
    writeU128(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 16);
      const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
      const upperPart = value >> BigInt(64);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset), lowerPart, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8, upperPart, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 16);
    }
    writeI128(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 16);
      const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
      const upperPart = value >> BigInt(64);
      __privateGet(this, _view).setBigInt64(__privateGet(this, _offset), lowerPart, true);
      __privateGet(this, _view).setBigInt64(__privateGet(this, _offset) + 8, upperPart, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 16);
    }
    writeU256(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 32);
      const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
      const p0 = value & low_64_mask;
      const p1 = value >> BigInt(64 * 1) & low_64_mask;
      const p2 = value >> BigInt(64 * 2) & low_64_mask;
      const p3 = value >> BigInt(64 * 3);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 0, p0, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 1, p1, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 2, p2, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 3, p3, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 32);
    }
    writeI256(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 32);
      const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
      const p0 = value & low_64_mask;
      const p1 = value >> BigInt(64 * 1) & low_64_mask;
      const p2 = value >> BigInt(64 * 2) & low_64_mask;
      const p3 = value >> BigInt(64 * 3);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 0, p0, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 1, p1, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 2, p2, true);
      __privateGet(this, _view).setBigInt64(__privateGet(this, _offset) + 8 * 3, p3, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 32);
    }
    writeF32(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 4);
      __privateGet(this, _view).setFloat32(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 4);
    }
    writeF64(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 8);
      __privateGet(this, _view).setFloat64(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 8);
    }
    writeString(value) {
      const encoder = new TextEncoder();
      const encodedString = encoder.encode(value);
      this.writeU32(encodedString.length);
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, encodedString.length);
      __privateGet(this, _buffer).set(encodedString, __privateGet(this, _offset));
      __privateSet(this, _offset, __privateGet(this, _offset) + encodedString.length);
    }
  }, _buffer = new WeakMap(), _view = new WeakMap(), _offset = new WeakMap(), _expandBuffer = new WeakSet(), expandBuffer_fn = function(additionalCapacity) {
    const minCapacity = __privateGet(this, _offset) + additionalCapacity + 1;
    if (minCapacity <= __privateGet(this, _buffer).length)
      return;
    let newCapacity = __privateGet(this, _buffer).length * 2;
    if (newCapacity < minCapacity)
      newCapacity = minCapacity;
    const newBuffer = new Uint8Array(newCapacity);
    newBuffer.set(__privateGet(this, _buffer));
    __privateSet(this, _buffer, newBuffer);
    __privateSet(this, _view, new DataView(__privateGet(this, _buffer).buffer));
  }, _a3);
  var _view2, _offset2, _ensure, ensure_fn, _a4;
  var BinaryReader = (_a4 = class {
    constructor(input) {
      /** Ensure we have at least `n` bytes left to read */
      __privateAdd(this, _ensure);
      /**
       * The DataView used to read values from the binary data.
       *
       * Note: The DataView's `byteOffset` is relative to the beginning of the
       * underlying ArrayBuffer, not the start of the provided Uint8Array input.
       * This `BinaryReader`'s `#offset` field is used to track the current read position
       * relative to the start of the provided Uint8Array input.
       */
      __privateAdd(this, _view2, void 0);
      /**
       * Represents the offset (in bytes) relative to the start of the DataView
       * and provided Uint8Array input.
       *
       * Note: This is *not* the absolute byte offset within the underlying ArrayBuffer.
       */
      __privateAdd(this, _offset2, 0);
      __privateSet(this, _view2, new DataView(input.buffer, input.byteOffset, input.byteLength));
      __privateSet(this, _offset2, 0);
    }
    get offset() {
      return __privateGet(this, _offset2);
    }
    get remaining() {
      return __privateGet(this, _view2).byteLength - __privateGet(this, _offset2);
    }
    readUInt8Array() {
      const length = this.readU32();
      __privateMethod(this, _ensure, ensure_fn).call(this, length);
      return this.readBytes(length);
    }
    readBool() {
      const value = __privateGet(this, _view2).getUint8(__privateGet(this, _offset2));
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 1);
      return value !== 0;
    }
    readByte() {
      const value = __privateGet(this, _view2).getUint8(__privateGet(this, _offset2));
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 1);
      return value;
    }
    readBytes(length) {
      const array = new Uint8Array(
        __privateGet(this, _view2).buffer,
        __privateGet(this, _view2).byteOffset + __privateGet(this, _offset2),
        length
      );
      __privateSet(this, _offset2, __privateGet(this, _offset2) + length);
      return array;
    }
    readI8() {
      const value = __privateGet(this, _view2).getInt8(__privateGet(this, _offset2));
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 1);
      return value;
    }
    readU8() {
      return this.readByte();
    }
    readI16() {
      const value = __privateGet(this, _view2).getInt16(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 2);
      return value;
    }
    readU16() {
      const value = __privateGet(this, _view2).getUint16(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 2);
      return value;
    }
    readI32() {
      const value = __privateGet(this, _view2).getInt32(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 4);
      return value;
    }
    readU32() {
      const value = __privateGet(this, _view2).getUint32(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 4);
      return value;
    }
    readI64() {
      const value = __privateGet(this, _view2).getBigInt64(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 8);
      return value;
    }
    readU64() {
      const value = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 8);
      return value;
    }
    readU128() {
      const lowerPart = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      const upperPart = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 8, true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 16);
      return (upperPart << BigInt(64)) + lowerPart;
    }
    readI128() {
      const lowerPart = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      const upperPart = __privateGet(this, _view2).getBigInt64(__privateGet(this, _offset2) + 8, true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 16);
      return (upperPart << BigInt(64)) + lowerPart;
    }
    readU256() {
      const p0 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      const p1 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 8, true);
      const p2 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 16, true);
      const p3 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 24, true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 32);
      return (p3 << BigInt(3 * 64)) + (p2 << BigInt(2 * 64)) + (p1 << BigInt(1 * 64)) + p0;
    }
    readI256() {
      const p0 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      const p1 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 8, true);
      const p2 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 16, true);
      const p3 = __privateGet(this, _view2).getBigInt64(__privateGet(this, _offset2) + 24, true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 32);
      return (p3 << BigInt(3 * 64)) + (p2 << BigInt(2 * 64)) + (p1 << BigInt(1 * 64)) + p0;
    }
    readF32() {
      const value = __privateGet(this, _view2).getFloat32(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 4);
      return value;
    }
    readF64() {
      const value = __privateGet(this, _view2).getFloat64(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 8);
      return value;
    }
    readString() {
      const uint8Array = this.readUInt8Array();
      return new TextDecoder("utf-8").decode(uint8Array);
    }
  }, _view2 = new WeakMap(), _offset2 = new WeakMap(), _ensure = new WeakSet(), ensure_fn = function(n) {
    if (__privateGet(this, _offset2) + n > __privateGet(this, _view2).byteLength) {
      throw new RangeError(
        `Tried to read ${n} byte(s) at relative offset ${__privateGet(this, _offset2)}, but only ${this.remaining} byte(s) remain`
      );
    }
  }, _a4);
  function toPascalCase(s) {
    const str = s.replace(/([-_][a-z])/gi, ($1) => {
      return $1.toUpperCase().replace("-", "").replace("_", "");
    });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function deepEqual(obj1, obj2) {
    if (obj1 === obj2)
      return true;
    if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
      return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length)
      return false;
    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }
  function uint8ArrayToHexString(array) {
    return Array.prototype.map.call(array.reverse(), (x) => ("00" + x.toString(16)).slice(-2)).join("");
  }
  function uint8ArrayToU128(array) {
    if (array.length != 16) {
      throw new Error(`Uint8Array is not 16 bytes long: ${array}`);
    }
    return new BinaryReader(array).readU128();
  }
  function uint8ArrayToU256(array) {
    if (array.length != 32) {
      throw new Error(`Uint8Array is not 32 bytes long: [${array}]`);
    }
    return new BinaryReader(array).readU256();
  }
  function hexStringToUint8Array(str) {
    if (str.startsWith("0x")) {
      str = str.slice(2);
    }
    const matches = str.match(/.{1,2}/g) || [];
    const data = Uint8Array.from(
      matches.map((byte) => parseInt(byte, 16))
    );
    return data.reverse();
  }
  function hexStringToU128(str) {
    return uint8ArrayToU128(hexStringToUint8Array(str));
  }
  function hexStringToU256(str) {
    return uint8ArrayToU256(hexStringToUint8Array(str));
  }
  function u128ToUint8Array(data) {
    const writer = new BinaryWriter(16);
    writer.writeU128(data);
    return writer.getBuffer();
  }
  function u128ToHexString(data) {
    return uint8ArrayToHexString(u128ToUint8Array(data));
  }
  function u256ToUint8Array(data) {
    const writer = new BinaryWriter(32);
    writer.writeU256(data);
    return writer.getBuffer();
  }
  function u256ToHexString(data) {
    return uint8ArrayToHexString(u256ToUint8Array(data));
  }
  function toCamelCase(str) {
    return str.replace(/[-_]+/g, "_").replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
  }
  function bsatnBaseSize(typespace, ty) {
    const assumedArrayLength = 4;
    while (ty.tag === "Ref")
      ty = typespace.types[ty.value];
    if (ty.tag === "Product") {
      let sum = 0;
      for (const { algebraicType: elem } of ty.value.elements) {
        sum += bsatnBaseSize(typespace, elem);
      }
      return sum;
    } else if (ty.tag === "Sum") {
      let min = Infinity;
      for (const { algebraicType: vari } of ty.value.variants) {
        const vSize = bsatnBaseSize(typespace, vari);
        if (vSize < min)
          min = vSize;
      }
      if (min === Infinity)
        min = 0;
      return 4 + min;
    } else if (ty.tag == "Array") {
      return 4 + assumedArrayLength * bsatnBaseSize(typespace, ty.value);
    }
    return {
      String: 4 + assumedArrayLength,
      Sum: 1,
      Bool: 1,
      I8: 1,
      U8: 1,
      I16: 2,
      U16: 2,
      I32: 4,
      U32: 4,
      F32: 4,
      I64: 8,
      U64: 8,
      F64: 8,
      I128: 16,
      U128: 16,
      I256: 32,
      U256: 32
    }[ty.tag];
  }
  var Identity = class _Identity {
    /**
     * Creates a new `Identity`.
     *
     * `data` can be a hexadecimal string or a `bigint`.
     */
    constructor(data) {
      __publicField(this, "__identity__");
      this.__identity__ = typeof data === "string" ? hexStringToU256(data) : data;
    }
    /**
     * Get the algebraic type representation of the {@link Identity} type.
     * @returns The algebraic type representation of the type.
     */
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [{ name: "__identity__", algebraicType: AlgebraicType.U256 }]
      });
    }
    /**
     * Check if two identities are equal.
     */
    isEqual(other) {
      return this.toHexString() === other.toHexString();
    }
    /**
     * Check if two identities are equal.
     */
    equals(other) {
      return this.isEqual(other);
    }
    /**
     * Print the identity as a hexadecimal string.
     */
    toHexString() {
      return u256ToHexString(this.__identity__);
    }
    /**
     * Convert the address to a Uint8Array.
     */
    toUint8Array() {
      return u256ToUint8Array(this.__identity__);
    }
    /**
     * Parse an Identity from a hexadecimal string.
     */
    static fromString(str) {
      return new _Identity(str);
    }
    /**
     * Zero identity (0x0000000000000000000000000000000000000000000000000000000000000000)
     */
    static zero() {
      return new _Identity(0n);
    }
    toString() {
      return this.toHexString();
    }
  };
  var AlgebraicType = {
    Ref: (value) => ({ tag: "Ref", value }),
    Sum: (value) => ({
      tag: "Sum",
      value
    }),
    Product: (value) => ({
      tag: "Product",
      value
    }),
    Array: (value) => ({
      tag: "Array",
      value
    }),
    String: { tag: "String" },
    Bool: { tag: "Bool" },
    I8: { tag: "I8" },
    U8: { tag: "U8" },
    I16: { tag: "I16" },
    U16: { tag: "U16" },
    I32: { tag: "I32" },
    U32: { tag: "U32" },
    I64: { tag: "I64" },
    U64: { tag: "U64" },
    I128: { tag: "I128" },
    U128: { tag: "U128" },
    I256: { tag: "I256" },
    U256: { tag: "U256" },
    F32: { tag: "F32" },
    F64: { tag: "F64" },
    serializeValue(writer, ty, value, typespace) {
      if (ty.tag === "Ref") {
        if (!typespace)
          throw new Error("cannot serialize refs without a typespace");
        while (ty.tag === "Ref")
          ty = typespace.types[ty.value];
      }
      switch (ty.tag) {
        case "Product":
          ProductType.serializeValue(writer, ty.value, value, typespace);
          break;
        case "Sum":
          SumType.serializeValue(writer, ty.value, value, typespace);
          break;
        case "Array":
          if (ty.value.tag === "U8") {
            writer.writeUInt8Array(value);
          } else {
            const elemType = ty.value;
            writer.writeU32(value.length);
            for (const elem of value) {
              AlgebraicType.serializeValue(writer, elemType, elem, typespace);
            }
          }
          break;
        case "Bool":
          writer.writeBool(value);
          break;
        case "I8":
          writer.writeI8(value);
          break;
        case "U8":
          writer.writeU8(value);
          break;
        case "I16":
          writer.writeI16(value);
          break;
        case "U16":
          writer.writeU16(value);
          break;
        case "I32":
          writer.writeI32(value);
          break;
        case "U32":
          writer.writeU32(value);
          break;
        case "I64":
          writer.writeI64(value);
          break;
        case "U64":
          writer.writeU64(value);
          break;
        case "I128":
          writer.writeI128(value);
          break;
        case "U128":
          writer.writeU128(value);
          break;
        case "I256":
          writer.writeI256(value);
          break;
        case "U256":
          writer.writeU256(value);
          break;
        case "F32":
          writer.writeF32(value);
          break;
        case "F64":
          writer.writeF64(value);
          break;
        case "String":
          writer.writeString(value);
          break;
      }
    },
    deserializeValue: function(reader, ty, typespace) {
      if (ty.tag === "Ref") {
        if (!typespace)
          throw new Error("cannot deserialize refs without a typespace");
        while (ty.tag === "Ref")
          ty = typespace.types[ty.value];
      }
      switch (ty.tag) {
        case "Product":
          return ProductType.deserializeValue(reader, ty.value, typespace);
        case "Sum":
          return SumType.deserializeValue(reader, ty.value, typespace);
        case "Array":
          if (ty.value.tag === "U8") {
            return reader.readUInt8Array();
          } else {
            const elemType = ty.value;
            const length = reader.readU32();
            const result = [];
            for (let i = 0; i < length; i++) {
              result.push(
                AlgebraicType.deserializeValue(reader, elemType, typespace)
              );
            }
            return result;
          }
        case "Bool":
          return reader.readBool();
        case "I8":
          return reader.readI8();
        case "U8":
          return reader.readU8();
        case "I16":
          return reader.readI16();
        case "U16":
          return reader.readU16();
        case "I32":
          return reader.readI32();
        case "U32":
          return reader.readU32();
        case "I64":
          return reader.readI64();
        case "U64":
          return reader.readU64();
        case "I128":
          return reader.readI128();
        case "U128":
          return reader.readU128();
        case "I256":
          return reader.readI256();
        case "U256":
          return reader.readU256();
        case "F32":
          return reader.readF32();
        case "F64":
          return reader.readF64();
        case "String":
          return reader.readString();
      }
    },
    /**
     * Convert a value of the algebraic type into something that can be used as a key in a map.
     * There are no guarantees about being able to order it.
     * This is only guaranteed to be comparable to other values of the same type.
     * @param value A value of the algebraic type
     * @returns Something that can be used as a key in a map.
     */
    intoMapKey: function(ty, value) {
      switch (ty.tag) {
        case "U8":
        case "U16":
        case "U32":
        case "U64":
        case "U128":
        case "U256":
        case "I8":
        case "I16":
        case "I32":
        case "I64":
        case "I128":
        case "I256":
        case "F32":
        case "F64":
        case "String":
        case "Bool":
          return value;
        case "Product":
          return ProductType.intoMapKey(ty.value, value);
        default: {
          const writer = new BinaryWriter(10);
          AlgebraicType.serializeValue(writer, ty, value);
          return writer.toBase64();
        }
      }
    }
  };
  var ProductType = {
    serializeValue(writer, ty, value, typespace) {
      for (const element of ty.elements) {
        AlgebraicType.serializeValue(
          writer,
          element.algebraicType,
          value[element.name],
          typespace
        );
      }
    },
    deserializeValue(reader, ty, typespace) {
      const result = {};
      if (ty.elements.length === 1) {
        if (ty.elements[0].name === "__time_duration_micros__") {
          return new TimeDuration(reader.readI64());
        }
        if (ty.elements[0].name === "__timestamp_micros_since_unix_epoch__") {
          return new Timestamp(reader.readI64());
        }
        if (ty.elements[0].name === "__identity__") {
          return new Identity(reader.readU256());
        }
        if (ty.elements[0].name === "__connection_id__") {
          return new ConnectionId(reader.readU128());
        }
      }
      for (const element of ty.elements) {
        result[element.name] = AlgebraicType.deserializeValue(
          reader,
          element.algebraicType,
          typespace
        );
      }
      return result;
    },
    intoMapKey(ty, value) {
      if (ty.elements.length === 1) {
        if (ty.elements[0].name === "__time_duration_micros__") {
          return value.__time_duration_micros__;
        }
        if (ty.elements[0].name === "__timestamp_micros_since_unix_epoch__") {
          return value.__timestamp_micros_since_unix_epoch__;
        }
        if (ty.elements[0].name === "__identity__") {
          return value.__identity__;
        }
        if (ty.elements[0].name === "__connection_id__") {
          return value.__connection_id__;
        }
      }
      const writer = new BinaryWriter(10);
      AlgebraicType.serializeValue(writer, AlgebraicType.Product(ty), value);
      return writer.toBase64();
    }
  };
  var SumType = {
    serializeValue: function(writer, ty, value, typespace) {
      if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
        if (value !== null && value !== void 0) {
          writer.writeByte(0);
          AlgebraicType.serializeValue(
            writer,
            ty.variants[0].algebraicType,
            value,
            typespace
          );
        } else {
          writer.writeByte(1);
        }
      } else {
        const variant = value["tag"];
        const index = ty.variants.findIndex((v) => v.name === variant);
        if (index < 0) {
          throw `Can't serialize a sum type, couldn't find ${value.tag} tag ${JSON.stringify(value)} in variants ${JSON.stringify(ty)}`;
        }
        writer.writeU8(index);
        AlgebraicType.serializeValue(
          writer,
          ty.variants[index].algebraicType,
          value["value"],
          typespace
        );
      }
    },
    deserializeValue: function(reader, ty, typespace) {
      const tag = reader.readU8();
      if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
        if (tag === 0) {
          return AlgebraicType.deserializeValue(
            reader,
            ty.variants[0].algebraicType,
            typespace
          );
        } else if (tag === 1) {
          return void 0;
        } else {
          throw `Can't deserialize an option type, couldn't find ${tag} tag`;
        }
      } else {
        const variant = ty.variants[tag];
        const value = AlgebraicType.deserializeValue(
          reader,
          variant.algebraicType,
          typespace
        );
        return { tag: variant.name, value };
      }
    }
  };
  var ConnectionId = class _ConnectionId {
    /**
     * Creates a new `ConnectionId`.
     */
    constructor(data) {
      __publicField(this, "__connection_id__");
      this.__connection_id__ = data;
    }
    /**
     * Get the algebraic type representation of the {@link ConnectionId} type.
     * @returns The algebraic type representation of the type.
     */
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [
          { name: "__connection_id__", algebraicType: AlgebraicType.U128 }
        ]
      });
    }
    isZero() {
      return this.__connection_id__ === BigInt(0);
    }
    static nullIfZero(addr) {
      if (addr.isZero()) {
        return null;
      } else {
        return addr;
      }
    }
    static random() {
      function randomU8() {
        return Math.floor(Math.random() * 255);
      }
      let result = BigInt(0);
      for (let i = 0; i < 16; i++) {
        result = result << BigInt(8) | BigInt(randomU8());
      }
      return new _ConnectionId(result);
    }
    /**
     * Compare two connection IDs for equality.
     */
    isEqual(other) {
      return this.__connection_id__ == other.__connection_id__;
    }
    /**
     * Check if two connection IDs are equal.
     */
    equals(other) {
      return this.isEqual(other);
    }
    /**
     * Print the connection ID as a hexadecimal string.
     */
    toHexString() {
      return u128ToHexString(this.__connection_id__);
    }
    /**
     * Convert the connection ID to a Uint8Array.
     */
    toUint8Array() {
      return u128ToUint8Array(this.__connection_id__);
    }
    /**
     * Parse a connection ID from a hexadecimal string.
     */
    static fromString(str) {
      return new _ConnectionId(hexStringToU128(str));
    }
    static fromStringOrNull(str) {
      const addr = _ConnectionId.fromString(str);
      if (addr.isZero()) {
        return null;
      } else {
        return addr;
      }
    }
  };
  var ScheduleAt = {
    interval(value) {
      return Interval(value);
    },
    time(value) {
      return Time(value);
    },
    getAlgebraicType() {
      return AlgebraicType.Sum({
        variants: [
          {
            name: "Interval",
            algebraicType: TimeDuration.getAlgebraicType()
          },
          { name: "Time", algebraicType: Timestamp.getAlgebraicType() }
        ]
      });
    }
  };
  var Interval = (micros) => ({
    tag: "Interval",
    value: new TimeDuration(micros)
  });
  var Time = (microsSinceUnixEpoch) => ({
    tag: "Time",
    value: new Timestamp(microsSinceUnixEpoch)
  });
  var schedule_at_default = ScheduleAt;
  var Option = {
    getAlgebraicType(innerType) {
      return AlgebraicType.Sum({
        variants: [
          { name: "some", algebraicType: innerType },
          {
            name: "none",
            algebraicType: AlgebraicType.Product({ elements: [] })
          }
        ]
      });
    }
  };
  function set(x, t2) {
    return { ...x, ...t2 };
  }
  var TypeBuilder = class {
    constructor(algebraicType) {
      /**
       * The TypeScript phantom type. This is not stored at runtime,
       * but is visible to the compiler
       */
      __publicField(this, "type");
      /**
       * The SpacetimeDB algebraic type (run‑time value). In addition to storing
       * the runtime representation of the `AlgebraicType`, it also captures
       * the TypeScript type information of the `AlgebraicType`. That is to say
       * the value is not merely an `AlgebraicType`, but is constructed to be
       * the corresponding concrete `AlgebraicType` for the TypeScript type `Type`.
       *
       * e.g. `string` corresponds to `AlgebraicType.String`
       */
      __publicField(this, "algebraicType");
      this.algebraicType = algebraicType;
    }
    optional() {
      return new OptionBuilder(this);
    }
    serialize(writer, value) {
      AlgebraicType.serializeValue(writer, this.algebraicType, value);
    }
    deserialize(reader) {
      return AlgebraicType.deserializeValue(reader, this.algebraicType);
    }
  };
  var U8Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U8);
    }
    index(algorithm = "btree") {
      return new U8ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new U8ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U8ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U8ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var U16Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U16);
    }
    index(algorithm = "btree") {
      return new U16ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new U16ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U16ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U16ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var U32Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U32);
    }
    index(algorithm = "btree") {
      return new U32ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new U32ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U32ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U32ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var U64Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U64);
    }
    index(algorithm = "btree") {
      return new U64ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new U64ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U64ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U64ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var U128Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U128);
    }
    index(algorithm = "btree") {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var U256Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U256);
    }
    index(algorithm = "btree") {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var I8Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I8);
    }
    index(algorithm = "btree") {
      return new I8ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new I8ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I8ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I8ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var I16Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I16);
    }
    index(algorithm = "btree") {
      return new I16ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new I16ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I16ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I16ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var I32Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I32);
    }
    index(algorithm = "btree") {
      return new I32ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new I32ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I32ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I32ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var I64Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I64);
    }
    index(algorithm = "btree") {
      return new I64ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new I64ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I64ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I64ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var I128Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I128);
    }
    index(algorithm = "btree") {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var I256Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I256);
    }
    index(algorithm = "btree") {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var F32Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.F32);
    }
    default(value) {
      return new F32ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var F64Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.F64);
    }
    default(value) {
      return new F64ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var BoolBuilder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.Bool);
    }
    index(algorithm = "btree") {
      return new BoolColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new BoolColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new BoolColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new BoolColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var StringBuilder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.String);
    }
    index(algorithm = "btree") {
      return new StringColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new StringColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new StringColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new StringColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var ArrayBuilder = class extends TypeBuilder {
    constructor(element) {
      super(AlgebraicType.Array(element.algebraicType));
      __publicField(this, "element");
      this.element = element;
    }
    default(value) {
      return new ArrayColumnBuilder(
        this.element,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var ByteArrayBuilder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.Array(AlgebraicType.U8));
    }
    default(value) {
      return new ByteArrayColumnBuilder(
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var OptionBuilder = class extends TypeBuilder {
    constructor(value) {
      super(Option.getAlgebraicType(value.algebraicType));
      __publicField(this, "value");
      this.value = value;
    }
    default(value) {
      return new OptionColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var ProductBuilder = class extends TypeBuilder {
    constructor(elements, name) {
      function elementsArrayFromElementsObj(obj) {
        return Object.keys(obj).map((key) => ({
          name: key,
          // Lazily resolve the underlying object's algebraicType.
          // This will call obj[key].algebraicType only when someone
          // actually reads this property.
          get algebraicType() {
            return obj[key].algebraicType;
          }
        }));
      }
      super(
        AlgebraicType.Product({
          elements: elementsArrayFromElementsObj(elements)
        })
      );
      __publicField(this, "typeName");
      __publicField(this, "elements");
      this.typeName = name;
      this.elements = elements;
    }
    default(value) {
      return new ProductColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var UnitBuilder = class extends TypeBuilder {
    constructor() {
      super({ tag: "Product", value: { elements: [] } });
    }
  };
  var RowBuilder = class extends TypeBuilder {
    constructor(row, name) {
      const mappedRow = Object.fromEntries(
        Object.entries(row).map(([colName, builder]) => [
          colName,
          builder instanceof ColumnBuilder ? builder : new ColumnBuilder(builder, {})
        ])
      );
      const elements = Object.keys(mappedRow).map((name2) => ({
        name: name2,
        get algebraicType() {
          return mappedRow[name2].typeBuilder.algebraicType;
        }
      }));
      super(AlgebraicType.Product({ elements }));
      __publicField(this, "row");
      __publicField(this, "typeName");
      this.row = mappedRow;
      this.typeName = name;
    }
  };
  var SumBuilderImpl = class extends TypeBuilder {
    constructor(variants, name) {
      function variantsArrayFromVariantsObj(variants2) {
        return Object.keys(variants2).map((key) => ({
          name: key,
          // Lazily resolve the underlying object's algebraicType.
          // This will call obj[key].algebraicType only when someone
          // actually reads this property.
          get algebraicType() {
            return variants2[key].algebraicType;
          }
        }));
      }
      super(
        AlgebraicType.Sum({
          variants: variantsArrayFromVariantsObj(variants)
        })
      );
      __publicField(this, "variants");
      __publicField(this, "typeName");
      this.variants = variants;
      this.typeName = name;
      for (const key of Object.keys(variants)) {
        const desc = Object.getOwnPropertyDescriptor(variants, key);
        const isAccessor = !!desc && (typeof desc.get === "function" || typeof desc.set === "function");
        let isUnit2 = false;
        if (!isAccessor) {
          const variant = variants[key];
          isUnit2 = variant instanceof UnitBuilder;
        }
        if (isUnit2) {
          const constant = this.create(key);
          Object.defineProperty(this, key, {
            value: constant,
            writable: false,
            enumerable: true,
            configurable: false
          });
        } else {
          const fn = (value) => this.create(key, value);
          Object.defineProperty(this, key, {
            value: fn,
            writable: false,
            enumerable: true,
            configurable: false
          });
        }
      }
    }
    create(tag, value) {
      return value === void 0 ? { tag } : { tag, value };
    }
    default(value) {
      return new SumColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var SumBuilder = SumBuilderImpl;
  var SimpleSumBuilderImpl = class extends SumBuilderImpl {
    index(algorithm = "btree") {
      return new SimpleSumColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    primaryKey() {
      return new SimpleSumColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
  };
  var IdentityBuilder = class extends TypeBuilder {
    constructor() {
      super(Identity.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var ConnectionIdBuilder = class extends TypeBuilder {
    constructor() {
      super(ConnectionId.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var TimestampBuilder = class extends TypeBuilder {
    constructor() {
      super(Timestamp.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var TimeDurationBuilder = class extends TypeBuilder {
    constructor() {
      super(TimeDuration.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var defaultMetadata = {};
  var ColumnBuilder = class {
    constructor(typeBuilder, metadata) {
      __publicField(this, "typeBuilder");
      __publicField(this, "columnMetadata");
      this.typeBuilder = typeBuilder;
      this.columnMetadata = metadata;
    }
    serialize(writer, value) {
      AlgebraicType.serializeValue(writer, this.typeBuilder.algebraicType, value);
    }
    deserialize(reader) {
      return AlgebraicType.deserializeValue(
        reader,
        this.typeBuilder.algebraicType
      );
    }
  };
  var U8ColumnBuilder = class _U8ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var U16ColumnBuilder = class _U16ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var U32ColumnBuilder = class _U32ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var U64ColumnBuilder = class _U64ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var U128ColumnBuilder = class _U128ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var U256ColumnBuilder = class _U256ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var I8ColumnBuilder = class _I8ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var I16ColumnBuilder = class _I16ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var I32ColumnBuilder = class _I32ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var I64ColumnBuilder = class _I64ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var I128ColumnBuilder = class _I128ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var I256ColumnBuilder = class _I256ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var F32ColumnBuilder = class _F32ColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _F32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var F64ColumnBuilder = class _F64ColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _F64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var BoolColumnBuilder = class _BoolColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var StringColumnBuilder = class _StringColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var ArrayColumnBuilder = class _ArrayColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _ArrayColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var ByteArrayColumnBuilder = class extends ColumnBuilder {
    constructor(metadata) {
      super(new TypeBuilder(AlgebraicType.Array(AlgebraicType.U8)), metadata);
    }
  };
  var OptionColumnBuilder = class _OptionColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _OptionColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var ProductColumnBuilder = class _ProductColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _ProductColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
  };
  var SumColumnBuilder = class _SumColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _SumColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
  };
  var SimpleSumColumnBuilder = class _SimpleSumColumnBuilder extends SumColumnBuilder {
    index(algorithm = "btree") {
      return new _SimpleSumColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    primaryKey() {
      return new _SimpleSumColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
  };
  var IdentityColumnBuilder = class _IdentityColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
  };
  var ConnectionIdColumnBuilder = class _ConnectionIdColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
  };
  var TimestampColumnBuilder = class _TimestampColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
  };
  var TimeDurationColumnBuilder = class _TimeDurationColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
  };
  var RefBuilder = class extends TypeBuilder {
    constructor(ref) {
      super(AlgebraicType.Ref(ref));
      __publicField(this, "ref");
      /** The phantom type of the pointee of this ref. */
      __publicField(this, "__spacetimeType");
      this.ref = ref;
    }
  };
  var enumImpl = (nameOrObj, maybeObj) => {
    let obj = nameOrObj;
    let name = void 0;
    if (typeof nameOrObj === "string") {
      if (!maybeObj) {
        throw new TypeError(
          "When providing a name, you must also provide the variants object or array."
        );
      }
      obj = maybeObj;
      name = nameOrObj;
    }
    if (Array.isArray(obj)) {
      const simpleVariantsObj = {};
      for (const variant of obj) {
        simpleVariantsObj[variant] = new UnitBuilder();
      }
      return new SimpleSumBuilderImpl(simpleVariantsObj, name);
    }
    return new SumBuilder(obj, name);
  };
  var t = {
    /**
     * Creates a new `Bool` {@link AlgebraicType} to be used in table definitions
     * Represented as `boolean` in TypeScript.
     * @returns A new {@link BoolBuilder} instance
     */
    bool: () => new BoolBuilder(),
    /**
     * Creates a new `String` {@link AlgebraicType} to be used in table definitions
     * Represented as `string` in TypeScript.
     * @returns A new {@link StringBuilder} instance
     */
    string: () => new StringBuilder(),
    /**
     * Creates a new `F64` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link F64Builder} instance
     */
    number: () => new F64Builder(),
    /**
     * Creates a new `I8` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link I8Builder} instance
     */
    i8: () => new I8Builder(),
    /**
     * Creates a new `U8` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link U8Builder} instance
     */
    u8: () => new U8Builder(),
    /**
     * Creates a new `I16` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link I16Builder} instance
     */
    i16: () => new I16Builder(),
    /**
     * Creates a new `U16` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link U16Builder} instance
     */
    u16: () => new U16Builder(),
    /**
     * Creates a new `I32` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link I32Builder} instance
     */
    i32: () => new I32Builder(),
    /**
     * Creates a new `U32` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link U32Builder} instance
     */
    u32: () => new U32Builder(),
    /**
     * Creates a new `I64` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link I64Builder} instance
     */
    i64: () => new I64Builder(),
    /**
     * Creates a new `U64` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link U64Builder} instance
     */
    u64: () => new U64Builder(),
    /**
     * Creates a new `I128` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link I128Builder} instance
     */
    i128: () => new I128Builder(),
    /**
     * Creates a new `U128` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link U128Builder} instance
     */
    u128: () => new U128Builder(),
    /**
     * Creates a new `I256` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link I256Builder} instance
     */
    i256: () => new I256Builder(),
    /**
     * Creates a new `U256` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link U256Builder} instance
     */
    u256: () => new U256Builder(),
    /**
     * Creates a new `F32` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link F32Builder} instance
     */
    f32: () => new F32Builder(),
    /**
     * Creates a new `F64` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link F64Builder} instance
     */
    f64: () => new F64Builder(),
    /**
     * Creates a new `Product` {@link AlgebraicType} to be used in table definitions. Product types in SpacetimeDB
     * are essentially the same as objects in JavaScript/TypeScript.
     * Properties of the object must also be {@link TypeBuilder}s.
     * Represented as an object with specific properties in TypeScript.
     *
     * @param name (optional) A display name for the product type. If omitted, an anonymous product type is created.
     * @param obj The object defining the properties of the type, whose property
     * values must be {@link TypeBuilder}s.
     * @returns A new {@link ProductBuilder} instance.
     */
    object: (nameOrObj, maybeObj) => {
      if (typeof nameOrObj === "string") {
        if (!maybeObj) {
          throw new TypeError(
            "When providing a name, you must also provide the object."
          );
        }
        return new ProductBuilder(maybeObj, nameOrObj);
      }
      return new ProductBuilder(nameOrObj, void 0);
    },
    /**
     * Creates a new `Row` {@link AlgebraicType} to be used in table definitions. Row types in SpacetimeDB
     * are similar to `Product` types, but are specifically used to define the schema of a table row.
     * Properties of the object must also be {@link TypeBuilder} or {@link ColumnBuilder}s.
     *
     * You can represent a `Row` as either a {@link RowObj} or an {@link RowBuilder} type when
     * defining a table schema.
     *
     * The {@link RowBuilder} type is useful when you want to create a type which can be used anywhere
     * a {@link TypeBuilder} is accepted, such as in nested objects or arrays, or as the argument
     * to a scheduled function.
     *
     * @param obj The object defining the properties of the row, whose property
     * values must be {@link TypeBuilder}s or {@link ColumnBuilder}s.
     * @returns A new {@link RowBuilder} instance
     */
    row: (nameOrObj, maybeObj) => {
      const [obj, name] = typeof nameOrObj === "string" ? [maybeObj, nameOrObj] : [nameOrObj, void 0];
      return new RowBuilder(obj, name);
    },
    /**
     * Creates a new `Array` {@link AlgebraicType} to be used in table definitions.
     * Represented as an array in TypeScript.
     * @param element The element type of the array, which must be a `TypeBuilder`.
     * @returns A new {@link ArrayBuilder} instance
     */
    array(e) {
      return new ArrayBuilder(e);
    },
    enum: enumImpl,
    /**
     * This is a special helper function for conveniently creating {@link Product} type columns with no fields.
     *
     * @returns A new {@link ProductBuilder} instance with no fields.
     */
    unit() {
      return new UnitBuilder();
    },
    /**
     * Creates a lazily-evaluated {@link TypeBuilder}. This is useful for creating
     * recursive types, such as a tree or linked list.
     * @param thunk A function that returns a {@link TypeBuilder}.
     * @returns A proxy {@link TypeBuilder} that evaluates the thunk on first access.
     */
    lazy(thunk) {
      let cached = null;
      const get = () => cached ?? (cached = thunk());
      const proxy = new Proxy({}, {
        get(_t, prop, recv) {
          const target = get();
          const val = Reflect.get(target, prop, recv);
          return typeof val === "function" ? val.bind(target) : val;
        },
        set(_t, prop, value, recv) {
          return Reflect.set(get(), prop, value, recv);
        },
        has(_t, prop) {
          return prop in get();
        },
        ownKeys() {
          return Reflect.ownKeys(get());
        },
        getOwnPropertyDescriptor(_t, prop) {
          return Object.getOwnPropertyDescriptor(get(), prop);
        },
        getPrototypeOf() {
          return Object.getPrototypeOf(get());
        }
      });
      return proxy;
    },
    /**
     * This is a special helper function for conveniently creating {@link ScheduleAt} type columns.
     * @returns A new ColumnBuilder instance with the {@link ScheduleAt} type.
     */
    scheduleAt: () => {
      return new ColumnBuilder(
        new TypeBuilder(schedule_at_default.getAlgebraicType()),
        set(defaultMetadata, { isScheduleAt: true })
      );
    },
    /**
     * This is a convenience method for creating a column with the {@link Option} type.
     * You can create a column of the same type by constructing an enum with a `some` and `none` variant.
     * @param value The type of the value contained in the `some` variant of the `Option`.
     * @returns A new {@link OptionBuilder} instance with the {@link Option} type.
     */
    option(value) {
      return new OptionBuilder(value);
    },
    /**
     * This is a convenience method for creating a column with the {@link Identity} type.
     * You can create a column of the same type by constructing an `object` with a single `__identity__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link Identity} type.
     */
    identity: () => {
      return new IdentityBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link ConnectionId} type.
     * You can create a column of the same type by constructing an `object` with a single `__connection_id__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link ConnectionId} type.
     */
    connectionId: () => {
      return new ConnectionIdBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link Timestamp} type.
     * You can create a column of the same type by constructing an `object` with a single `__timestamp_micros_since_unix_epoch__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link Timestamp} type.
     */
    timestamp: () => {
      return new TimestampBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link TimeDuration} type.
     * You can create a column of the same type by constructing an `object` with a single `__time_duration_micros__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link TimeDuration} type.
     */
    timeDuration: () => {
      return new TimeDurationBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link ByteArray} type.
     * You can create a column of the same type by constructing an `array` of `u8`.
     * The TypeScript representation is {@link Uint8Array}.
     * @returns A new {@link ByteArrayBuilder} instance with the {@link ByteArray} type.
     */
    byteArray: () => {
      return new ByteArrayBuilder();
    }
  };
  var RowSizeHint = t.enum("RowSizeHint", {
    FixedSize: t.u16(),
    RowOffsets: t.array(t.u64())
  });
  var row_size_hint_type_default = RowSizeHint;
  var bsatn_row_list_type_default = t.object("BsatnRowList", {
    get sizeHint() {
      return row_size_hint_type_default;
    },
    rowsData: t.byteArray()
  });
  var call_reducer_type_default = t.object("CallReducer", {
    reducer: t.string(),
    args: t.byteArray(),
    requestId: t.u32(),
    flags: t.u8()
  });
  var subscribe_type_default = t.object("Subscribe", {
    queryStrings: t.array(t.string()),
    requestId: t.u32()
  });
  var one_off_query_type_default = t.object("OneOffQuery", {
    messageId: t.byteArray(),
    queryString: t.string()
  });
  var query_id_type_default = t.object("QueryId", {
    id: t.u32()
  });
  var subscribe_single_type_default = t.object("SubscribeSingle", {
    query: t.string(),
    requestId: t.u32(),
    get queryId() {
      return query_id_type_default;
    }
  });
  var subscribe_multi_type_default = t.object("SubscribeMulti", {
    queryStrings: t.array(t.string()),
    requestId: t.u32(),
    get queryId() {
      return query_id_type_default;
    }
  });
  var unsubscribe_type_default = t.object("Unsubscribe", {
    requestId: t.u32(),
    get queryId() {
      return query_id_type_default;
    }
  });
  var unsubscribe_multi_type_default = t.object("UnsubscribeMulti", {
    requestId: t.u32(),
    get queryId() {
      return query_id_type_default;
    }
  });
  var call_procedure_type_default = t.object("CallProcedure", {
    procedure: t.string(),
    args: t.byteArray(),
    requestId: t.u32(),
    flags: t.u8()
  });
  var ClientMessage = t.enum("ClientMessage", {
    get CallReducer() {
      return call_reducer_type_default;
    },
    get Subscribe() {
      return subscribe_type_default;
    },
    get OneOffQuery() {
      return one_off_query_type_default;
    },
    get SubscribeSingle() {
      return subscribe_single_type_default;
    },
    get SubscribeMulti() {
      return subscribe_multi_type_default;
    },
    get Unsubscribe() {
      return unsubscribe_type_default;
    },
    get UnsubscribeMulti() {
      return unsubscribe_multi_type_default;
    },
    get CallProcedure() {
      return call_procedure_type_default;
    }
  });
  var client_message_type_default = ClientMessage;
  var query_update_type_default = t.object("QueryUpdate", {
    get deletes() {
      return bsatn_row_list_type_default;
    },
    get inserts() {
      return bsatn_row_list_type_default;
    }
  });
  var CompressableQueryUpdate = t.enum("CompressableQueryUpdate", {
    get Uncompressed() {
      return query_update_type_default;
    },
    Brotli: t.byteArray(),
    Gzip: t.byteArray()
  });
  var compressable_query_update_type_default = CompressableQueryUpdate;
  var table_update_type_default = t.object("TableUpdate", {
    tableId: t.u32(),
    tableName: t.string(),
    numRows: t.u64(),
    get updates() {
      return t.array(compressable_query_update_type_default);
    }
  });
  var database_update_type_default = t.object("DatabaseUpdate", {
    get tables() {
      return t.array(table_update_type_default);
    }
  });
  var initial_subscription_type_default = t.object("InitialSubscription", {
    get databaseUpdate() {
      return database_update_type_default;
    },
    requestId: t.u32(),
    totalHostExecutionDuration: t.timeDuration()
  });
  var UpdateStatus = t.enum("UpdateStatus", {
    get Committed() {
      return database_update_type_default;
    },
    Failed: t.string(),
    OutOfEnergy: t.unit()
  });
  var update_status_type_default = UpdateStatus;
  var reducer_call_info_type_default = t.object("ReducerCallInfo", {
    reducerName: t.string(),
    reducerId: t.u32(),
    args: t.byteArray(),
    requestId: t.u32()
  });
  var energy_quanta_type_default = t.object("EnergyQuanta", {
    quanta: t.u128()
  });
  var transaction_update_type_default = t.object("TransactionUpdate", {
    get status() {
      return update_status_type_default;
    },
    timestamp: t.timestamp(),
    callerIdentity: t.identity(),
    callerConnectionId: t.connectionId(),
    get reducerCall() {
      return reducer_call_info_type_default;
    },
    get energyQuantaUsed() {
      return energy_quanta_type_default;
    },
    totalHostExecutionDuration: t.timeDuration()
  });
  var transaction_update_light_type_default = t.object("TransactionUpdateLight", {
    requestId: t.u32(),
    get update() {
      return database_update_type_default;
    }
  });
  var identity_token_type_default = t.object("IdentityToken", {
    identity: t.identity(),
    token: t.string(),
    connectionId: t.connectionId()
  });
  var one_off_table_type_default = t.object("OneOffTable", {
    tableName: t.string(),
    get rows() {
      return bsatn_row_list_type_default;
    }
  });
  var one_off_query_response_type_default = t.object("OneOffQueryResponse", {
    messageId: t.byteArray(),
    error: t.option(t.string()),
    get tables() {
      return t.array(one_off_table_type_default);
    },
    totalHostExecutionDuration: t.timeDuration()
  });
  var subscribe_rows_type_default = t.object("SubscribeRows", {
    tableId: t.u32(),
    tableName: t.string(),
    get tableRows() {
      return table_update_type_default;
    }
  });
  var subscribe_applied_type_default = t.object("SubscribeApplied", {
    requestId: t.u32(),
    totalHostExecutionDurationMicros: t.u64(),
    get queryId() {
      return query_id_type_default;
    },
    get rows() {
      return subscribe_rows_type_default;
    }
  });
  var unsubscribe_applied_type_default = t.object("UnsubscribeApplied", {
    requestId: t.u32(),
    totalHostExecutionDurationMicros: t.u64(),
    get queryId() {
      return query_id_type_default;
    },
    get rows() {
      return subscribe_rows_type_default;
    }
  });
  var subscription_error_type_default = t.object("SubscriptionError", {
    totalHostExecutionDurationMicros: t.u64(),
    requestId: t.option(t.u32()),
    queryId: t.option(t.u32()),
    tableId: t.option(t.u32()),
    error: t.string()
  });
  var subscribe_multi_applied_type_default = t.object("SubscribeMultiApplied", {
    requestId: t.u32(),
    totalHostExecutionDurationMicros: t.u64(),
    get queryId() {
      return query_id_type_default;
    },
    get update() {
      return database_update_type_default;
    }
  });
  var unsubscribe_multi_applied_type_default = t.object("UnsubscribeMultiApplied", {
    requestId: t.u32(),
    totalHostExecutionDurationMicros: t.u64(),
    get queryId() {
      return query_id_type_default;
    },
    get update() {
      return database_update_type_default;
    }
  });
  var ProcedureStatus = t.enum("ProcedureStatus", {
    Returned: t.byteArray(),
    OutOfEnergy: t.unit(),
    InternalError: t.string()
  });
  var procedure_status_type_default = ProcedureStatus;
  var procedure_result_type_default = t.object("ProcedureResult", {
    get status() {
      return procedure_status_type_default;
    },
    timestamp: t.timestamp(),
    totalHostExecutionDuration: t.timeDuration(),
    requestId: t.u32()
  });
  var ServerMessage = t.enum("ServerMessage", {
    get InitialSubscription() {
      return initial_subscription_type_default;
    },
    get TransactionUpdate() {
      return transaction_update_type_default;
    },
    get TransactionUpdateLight() {
      return transaction_update_light_type_default;
    },
    get IdentityToken() {
      return identity_token_type_default;
    },
    get OneOffQueryResponse() {
      return one_off_query_response_type_default;
    },
    get SubscribeApplied() {
      return subscribe_applied_type_default;
    },
    get UnsubscribeApplied() {
      return unsubscribe_applied_type_default;
    },
    get SubscriptionError() {
      return subscription_error_type_default;
    },
    get SubscribeMultiApplied() {
      return subscribe_multi_applied_type_default;
    },
    get UnsubscribeMultiApplied() {
      return unsubscribe_multi_applied_type_default;
    },
    get ProcedureResult() {
      return procedure_result_type_default;
    }
  });
  var server_message_type_default = ServerMessage;
  var _events, _a5;
  var EventEmitter = (_a5 = class {
    constructor() {
      __privateAdd(this, _events, /* @__PURE__ */ new Map());
    }
    on(event, callback) {
      let callbacks = __privateGet(this, _events).get(event);
      if (!callbacks) {
        callbacks = /* @__PURE__ */ new Set();
        __privateGet(this, _events).set(event, callbacks);
      }
      callbacks.add(callback);
    }
    off(event, callback) {
      const callbacks = __privateGet(this, _events).get(event);
      if (!callbacks) {
        return;
      }
      callbacks.delete(callback);
    }
    emit(event, ...args) {
      const callbacks = __privateGet(this, _events).get(event);
      if (!callbacks) {
        return;
      }
      for (const callback of callbacks) {
        callback(...args);
      }
    }
  }, _events = new WeakMap(), _a5);
  var LogLevelIdentifierIcon = {
    component: "\u{1F4E6}",
    info: "\u2139\uFE0F",
    warn: "\u26A0\uFE0F",
    error: "\u274C",
    debug: "\u{1F41B}"
  };
  var LogStyle = {
    component: "color: #fff; background-color: #8D6FDD; padding: 2px 5px; border-radius: 3px;",
    info: "color: #fff; background-color: #007bff; padding: 2px 5px; border-radius: 3px;",
    warn: "color: #fff; background-color: #ffc107; padding: 2px 5px; border-radius: 3px;",
    error: "color: #fff; background-color: #dc3545; padding: 2px 5px; border-radius: 3px;",
    debug: "color: #fff; background-color: #28a745; padding: 2px 5px; border-radius: 3px;"
  };
  var LogTextStyle = {
    component: "color: #8D6FDD;",
    info: "color: #007bff;",
    warn: "color: #ffc107;",
    error: "color: #dc3545;",
    debug: "color: #28a745;"
  };
  var stdbLogger = (level, message) => {
    console.log(
      `%c${LogLevelIdentifierIcon[level]} ${level.toUpperCase()}%c ${message}`,
      LogStyle[level],
      LogTextStyle[level]
    );
  };
  var scalarCompare = (x, y) => {
    if (x === y)
      return 0;
    return x < y ? -1 : 1;
  };
  var _makeReadonlyIndex, makeReadonlyIndex_fn, _a6;
  var TableCacheImpl = (_a6 = class {
    /**
     * @param name the table name
     * @param primaryKeyCol column index designated as `#[primarykey]`
     * @param primaryKey column name designated as `#[primarykey]`
     * @param entityClass the entityClass
     */
    constructor(tableDef) {
      // TODO: this just scans the whole table; we should build proper index structures
      __privateAdd(this, _makeReadonlyIndex);
      __publicField(this, "rows");
      __publicField(this, "tableDef");
      __publicField(this, "emitter");
      __publicField(this, "applyOperations", (operations, ctx) => {
        const pendingCallbacks = [];
        const hasPrimaryKey = Object.values(this.tableDef.columns).some(
          (col) => col.columnMetadata.isPrimaryKey === true
        );
        if (hasPrimaryKey) {
          const insertMap = /* @__PURE__ */ new Map();
          const deleteMap = /* @__PURE__ */ new Map();
          for (const op of operations) {
            if (op.type === "insert") {
              const [_, prevCount] = insertMap.get(op.rowId) || [op, 0];
              insertMap.set(op.rowId, [op, prevCount + 1]);
            } else {
              const [_, prevCount] = deleteMap.get(op.rowId) || [op, 0];
              deleteMap.set(op.rowId, [op, prevCount + 1]);
            }
          }
          for (const [primaryKey, [insertOp, refCount]] of insertMap) {
            const deleteEntry = deleteMap.get(primaryKey);
            if (deleteEntry) {
              const [_, deleteCount] = deleteEntry;
              const refCountDelta = refCount - deleteCount;
              const maybeCb = this.update(
                ctx,
                primaryKey,
                insertOp.row,
                refCountDelta
              );
              if (maybeCb) {
                pendingCallbacks.push(maybeCb);
              }
              deleteMap.delete(primaryKey);
            } else {
              const maybeCb = this.insert(ctx, insertOp, refCount);
              if (maybeCb) {
                pendingCallbacks.push(maybeCb);
              }
            }
          }
          for (const [deleteOp, refCount] of deleteMap.values()) {
            const maybeCb = this.delete(ctx, deleteOp, refCount);
            if (maybeCb) {
              pendingCallbacks.push(maybeCb);
            }
          }
        } else {
          for (const op of operations) {
            if (op.type === "insert") {
              const maybeCb = this.insert(ctx, op);
              if (maybeCb) {
                pendingCallbacks.push(maybeCb);
              }
            } else {
              const maybeCb = this.delete(ctx, op);
              if (maybeCb) {
                pendingCallbacks.push(maybeCb);
              }
            }
          }
        }
        return pendingCallbacks;
      });
      __publicField(this, "update", (ctx, rowId, newRow, refCountDelta = 0) => {
        const existingEntry = this.rows.get(rowId);
        if (!existingEntry) {
          stdbLogger(
            "error",
            `Updating a row that was not present in the cache. Table: ${this.tableDef.name}, RowId: ${rowId}`
          );
          return void 0;
        }
        const [oldRow, previousCount] = existingEntry;
        const refCount = Math.max(1, previousCount + refCountDelta);
        if (previousCount + refCountDelta <= 0) {
          stdbLogger(
            "error",
            `Negative reference count for in table ${this.tableDef.name} row ${rowId} (${previousCount} + ${refCountDelta})`
          );
          return void 0;
        }
        this.rows.set(rowId, [newRow, refCount]);
        if (previousCount === 0) {
          stdbLogger(
            "error",
            `Updating a row id in table ${this.tableDef.name} which was not present in the cache (rowId: ${rowId})`
          );
          return {
            type: "insert",
            table: this.tableDef.name,
            cb: () => {
              this.emitter.emit("insert", ctx, newRow);
            }
          };
        }
        return {
          type: "update",
          table: this.tableDef.name,
          cb: () => {
            this.emitter.emit("update", ctx, oldRow, newRow);
          }
        };
      });
      __publicField(this, "insert", (ctx, operation, count = 1) => {
        const [_, previousCount] = this.rows.get(operation.rowId) || [
          operation.row,
          0
        ];
        this.rows.set(operation.rowId, [operation.row, previousCount + count]);
        if (previousCount === 0) {
          return {
            type: "insert",
            table: this.tableDef.name,
            cb: () => {
              this.emitter.emit("insert", ctx, operation.row);
            }
          };
        }
        return void 0;
      });
      __publicField(this, "delete", (ctx, operation, count = 1) => {
        const [_, previousCount] = this.rows.get(operation.rowId) || [
          operation.row,
          0
        ];
        if (previousCount === 0) {
          stdbLogger("warn", "Deleting a row that was not present in the cache");
          return void 0;
        }
        if (previousCount <= count) {
          this.rows.delete(operation.rowId);
          return {
            type: "delete",
            table: this.tableDef.name,
            cb: () => {
              this.emitter.emit("delete", ctx, operation.row);
            }
          };
        }
        this.rows.set(operation.rowId, [operation.row, previousCount - count]);
        return void 0;
      });
      /**
       * Register a callback for when a row is newly inserted into the database.
       *
       * ```ts
       * ctx.db.user.onInsert((reducerEvent, user) => {
       *   if (reducerEvent) {
       *      console.log("New user on reducer", reducerEvent, user);
       *   } else {
       *      console.log("New user received during subscription update on insert", user);
       *  }
       * });
       * ```
       *
       * @param cb Callback to be called when a new row is inserted
       */
      __publicField(this, "onInsert", (cb) => {
        this.emitter.on("insert", cb);
      });
      /**
       * Register a callback for when a row is deleted from the database.
       *
       * ```ts
       * ctx.db.user.onDelete((reducerEvent, user) => {
       *   if (reducerEvent) {
       *      console.log("Deleted user on reducer", reducerEvent, user);
       *   } else {
       *      console.log("Deleted user received during subscription update on update", user);
       *  }
       * });
       * ```
       *
       * @param cb Callback to be called when a new row is inserted
       */
      __publicField(this, "onDelete", (cb) => {
        this.emitter.on("delete", cb);
      });
      /**
       * Register a callback for when a row is updated into the database.
       *
       * ```ts
       * ctx.db.user.onInsert((reducerEvent, oldUser, user) => {
       *   if (reducerEvent) {
       *      console.log("Updated user on reducer", reducerEvent, user);
       *   } else {
       *      console.log("Updated user received during subscription update on delete", user);
       *  }
       * });
       * ```
       *
       * @param cb Callback to be called when a new row is inserted
       */
      __publicField(this, "onUpdate", (cb) => {
        this.emitter.on("update", cb);
      });
      /**
       * Remove a callback for when a row is newly inserted into the database.
       *
       * @param cb Callback to be removed
       */
      __publicField(this, "removeOnInsert", (cb) => {
        this.emitter.off("insert", cb);
      });
      /**
       * Remove a callback for when a row is deleted from the database.
       *
       * @param cb Callback to be removed
       */
      __publicField(this, "removeOnDelete", (cb) => {
        this.emitter.off("delete", cb);
      });
      /**
       * Remove a callback for when a row is updated into the database.
       *
       * @param cb Callback to be removed
       */
      __publicField(this, "removeOnUpdate", (cb) => {
        this.emitter.off("update", cb);
      });
      this.tableDef = tableDef;
      this.rows = /* @__PURE__ */ new Map();
      this.emitter = new EventEmitter();
      const indexesDef = this.tableDef.indexes || {};
      for (const idx of indexesDef) {
        const idxDef = idx;
        const index = __privateMethod(this, _makeReadonlyIndex, makeReadonlyIndex_fn).call(this, this.tableDef, idxDef);
        this[idx.name] = index;
      }
    }
    /**
     * @returns number of rows in the table
     */
    count() {
      return BigInt(this.rows.size);
    }
    /**
     * @returns The values of the rows in the table
     */
    iter() {
      function* generator(rows) {
        for (const [row] of rows.values()) {
          yield row;
        }
      }
      return generator(this.rows);
    }
    /**
     * Allows iteration over the rows in the table
     * @returns An iterator over the rows in the table
     */
    [Symbol.iterator]() {
      return this.iter();
    }
  }, _makeReadonlyIndex = new WeakSet(), makeReadonlyIndex_fn = function(tableDef, idx) {
    if (idx.algorithm !== "btree") {
      throw new Error("Only btree indexes are supported in TableCacheImpl");
    }
    const columns = idx.columns;
    const getKey = (row) => columns.map((c) => row[c]);
    const matchRange = (row, rangeArg) => {
      const key = getKey(row);
      const arr = Array.isArray(rangeArg) ? rangeArg : [rangeArg];
      const prefixLen = Math.max(0, arr.length - 1);
      for (let i = 0; i < prefixLen; i++) {
        if (!deepEqual(key[i], arr[i]))
          return false;
      }
      const lastProvided = arr[arr.length - 1];
      const kLast = key[prefixLen];
      if (lastProvided && typeof lastProvided === "object" && "from" in lastProvided && "to" in lastProvided) {
        const from = lastProvided.from;
        const to = lastProvided.to;
        if (from.tag !== "unbounded") {
          const c = scalarCompare(kLast, from.value);
          if (c < 0)
            return false;
          if (c === 0 && from.tag === "excluded")
            return false;
        }
        if (to.tag !== "unbounded") {
          const c = scalarCompare(kLast, to.value);
          if (c > 0)
            return false;
          if (c === 0 && to.tag === "excluded")
            return false;
        }
        return true;
      } else {
        if (!deepEqual(kLast, lastProvided))
          return false;
        return true;
      }
    };
    const isUnique = tableDef.constraints.some((constraint) => {
      if (constraint.constraint !== "unique") {
        return false;
      }
      return deepEqual(constraint.columns, idx.columns);
    });
    const self = this;
    if (isUnique) {
      const impl = {
        find: (colVal) => {
          const expected = Array.isArray(colVal) ? colVal : [colVal];
          for (const row of self.iter()) {
            if (deepEqual(getKey(row), expected))
              return row;
          }
          return null;
        }
      };
      return impl;
    } else {
      const impl = {
        *filter(range) {
          for (const row of self.iter()) {
            if (matchRange(row, range))
              yield row;
          }
        }
      };
      return impl;
    }
  }, _a6);
  var TableMap = class {
    constructor() {
      __publicField(this, "map", /* @__PURE__ */ new Map());
    }
    get(key) {
      return this.map.get(key);
    }
    set(key, value) {
      this.map.set(key, value);
      return this;
    }
    has(key) {
      return this.map.has(key);
    }
    delete(key) {
      return this.map.delete(key);
    }
    // optional: iteration stays broadly typed (cannot express per-key relation here)
    keys() {
      return this.map.keys();
    }
    values() {
      return this.map.values();
    }
    entries() {
      return this.map.entries();
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  };
  var ClientCache = class {
    constructor() {
      /**
       * The tables in the database.
       */
      __publicField(this, "tables", new TableMap());
    }
    /**
     * Returns the table with the given name.
     * - If SchemaDef is a concrete schema, `name` is constrained to known table names,
     *   and the return type matches that table.
     * - If SchemaDef is undefined, `name` is string and the return type is untyped.
     */
    getTable(name) {
      const table2 = this.tables.get(name);
      if (!table2) {
        console.error(
          "The table has not been registered for this client. Please register the table before using it. If you have registered global tables using the SpacetimeDBClient.registerTables() or `registerTable()` method, please make sure that is executed first!"
        );
        throw new Error(`Table ${String(name)} does not exist`);
      }
      return table2;
    }
    /**
     * Returns the table with the given name, creating it if needed.
     * - Typed mode: `tableTypeInfo.tableName` is constrained to known names and
     *   the return type matches that table.
     * - Untyped mode: accepts any string and returns an untyped TableCache.
     */
    getOrCreateTable(tableDef) {
      const name = tableDef.name;
      const table2 = this.tables.get(name);
      if (table2) {
        return table2;
      }
      const newTable = new TableCacheImpl(
        tableDef
      );
      this.tables.set(name, newTable);
      return newTable;
    }
  };
  function comparePreReleases(a, b) {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const aPart = a[i];
      const bPart = b[i];
      if (aPart === bPart)
        continue;
      if (typeof aPart === "number" && typeof bPart === "number") {
        return aPart - bPart;
      }
      if (typeof aPart === "string" && typeof bPart === "string") {
        return aPart.localeCompare(bPart);
      }
      return typeof aPart === "string" ? 1 : -1;
    }
    return a.length - b.length;
  }
  var SemanticVersion = class _SemanticVersion {
    constructor(major, minor, patch, preRelease = null, buildInfo = null) {
      __publicField(this, "major");
      __publicField(this, "minor");
      __publicField(this, "patch");
      __publicField(this, "preRelease");
      __publicField(this, "buildInfo");
      this.major = major;
      this.minor = minor;
      this.patch = patch;
      this.preRelease = preRelease;
      this.buildInfo = buildInfo;
    }
    toString() {
      let versionString = `${this.major}.${this.minor}.${this.patch}`;
      if (this.preRelease) {
        versionString += `-${this.preRelease.join(".")}`;
      }
      if (this.buildInfo) {
        versionString += `+${this.buildInfo}`;
      }
      return versionString;
    }
    compare(other) {
      if (this.major !== other.major) {
        return this.major - other.major;
      }
      if (this.minor !== other.minor) {
        return this.minor - other.minor;
      }
      if (this.patch !== other.patch) {
        return this.patch - other.patch;
      }
      if (this.preRelease && other.preRelease) {
        return comparePreReleases(this.preRelease, other.preRelease);
      }
      if (this.preRelease) {
        return -1;
      }
      if (other.preRelease) {
        return -1;
      }
      return 0;
    }
    clone() {
      return new _SemanticVersion(
        this.major,
        this.minor,
        this.patch,
        this.preRelease ? [...this.preRelease] : null,
        this.buildInfo
      );
    }
    static parseVersionString(version) {
      const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/;
      const match = version.match(regex);
      if (!match) {
        throw new Error(`Invalid version string: ${version}`);
      }
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      const patch = parseInt(match[3], 10);
      const preRelease = match[4] ? match[4].split(".").map((id) => isNaN(Number(id)) ? id : Number(id)) : null;
      const buildInfo = match[5] || null;
      return new _SemanticVersion(major, minor, patch, preRelease, buildInfo);
    }
  };
  var _MINIMUM_CLI_VERSION = new SemanticVersion(
    1,
    4,
    0
  );
  function ensureMinimumVersionOrThrow(versionString) {
    if (versionString === void 0) {
      throw new Error(versionErrorMessage(versionString));
    }
    const version = SemanticVersion.parseVersionString(versionString);
    if (version.compare(_MINIMUM_CLI_VERSION) < 0) {
      throw new Error(versionErrorMessage(versionString));
    }
  }
  function versionErrorMessage(incompatibleVersion) {
    return `Module code was generated with an incompatible version of the spacetimedb cli (${incompatibleVersion}). Update the cli version to at least ${_MINIMUM_CLI_VERSION.toString()} and regenerate the bindings. You can upgrade to the latest cli version by running: spacetime version upgrade`;
  }
  async function decompress(buffer, type, chunkSize = 128 * 1024) {
    let offset = 0;
    const readableStream = new ReadableStream({
      pull(controller) {
        if (offset < buffer.length) {
          const chunk = buffer.subarray(
            offset,
            Math.min(offset + chunkSize, buffer.length)
          );
          controller.enqueue(chunk);
          offset += chunkSize;
        } else {
          controller.close();
        }
      }
    });
    const decompressionStream = new DecompressionStream(type);
    const decompressedStream = readableStream.pipeThrough(decompressionStream);
    const reader = decompressedStream.getReader();
    const chunks = [];
    let totalLength = 0;
    let result;
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
      totalLength += result.value.length;
    }
    const decompressedArray = new Uint8Array(totalLength);
    let chunkOffset = 0;
    for (const chunk of chunks) {
      decompressedArray.set(chunk, chunkOffset);
      chunkOffset += chunk.length;
    }
    return decompressedArray;
  }
  async function resolveWS() {
    if (typeof globalThis.WebSocket !== "undefined") {
      return globalThis.WebSocket;
    }
    const dynamicImport = new Function("m", "return import(m)");
    try {
      const { WebSocket: UndiciWS } = await dynamicImport("undici");
      return UndiciWS;
    } catch (err) {
      console.warn(
        "[spacetimedb-sdk] No global WebSocket found. On Node 18\u201321, please install `undici` (npm install undici) to enable WebSocket support."
      );
      throw err;
    }
  }
  var _ws, _handleOnMessage, handleOnMessage_fn, _handleOnOpen, handleOnOpen_fn, _handleOnError, handleOnError_fn, _handleOnClose, handleOnClose_fn, _a7;
  var WebsocketDecompressAdapter = (_a7 = class {
    constructor(ws) {
      __privateAdd(this, _handleOnMessage);
      __privateAdd(this, _handleOnOpen);
      __privateAdd(this, _handleOnError);
      __privateAdd(this, _handleOnClose);
      __publicField(this, "onclose");
      __publicField(this, "onopen");
      __publicField(this, "onmessage");
      __publicField(this, "onerror");
      __privateAdd(this, _ws, void 0);
      this.onmessage = void 0;
      this.onopen = void 0;
      this.onmessage = void 0;
      this.onerror = void 0;
      ws.onmessage = __privateMethod(this, _handleOnMessage, handleOnMessage_fn).bind(this);
      ws.onerror = __privateMethod(this, _handleOnError, handleOnError_fn).bind(this);
      ws.onclose = __privateMethod(this, _handleOnClose, handleOnClose_fn).bind(this);
      ws.onopen = __privateMethod(this, _handleOnOpen, handleOnOpen_fn).bind(this);
      ws.binaryType = "arraybuffer";
      __privateSet(this, _ws, ws);
    }
    send(msg) {
      __privateGet(this, _ws).send(msg);
    }
    close() {
      __privateGet(this, _ws).close();
    }
    static async createWebSocketFn({
      url,
      nameOrAddress,
      wsProtocol,
      authToken,
      compression,
      lightMode,
      confirmedReads
    }) {
      const headers = new Headers();
      const WS = await resolveWS();
      let temporaryAuthToken = void 0;
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
        const tokenUrl = new URL("v1/identity/websocket-token", url);
        tokenUrl.protocol = url.protocol === "wss:" ? "https:" : "http:";
        const response = await fetch(tokenUrl, { method: "POST", headers });
        if (response.ok) {
          const { token } = await response.json();
          temporaryAuthToken = token;
        } else {
          return Promise.reject(
            new Error(`Failed to verify token: ${response.statusText}`)
          );
        }
      }
      const databaseUrl = new URL(`v1/database/${nameOrAddress}/subscribe`, url);
      if (temporaryAuthToken) {
        databaseUrl.searchParams.set("token", temporaryAuthToken);
      }
      databaseUrl.searchParams.set(
        "compression",
        compression === "gzip" ? "Gzip" : "None"
      );
      if (lightMode) {
        databaseUrl.searchParams.set("light", "true");
      }
      if (confirmedReads !== void 0) {
        databaseUrl.searchParams.set("confirmed", confirmedReads.toString());
      }
      const ws = new WS(databaseUrl.toString(), wsProtocol);
      return new _a7(ws);
    }
  }, _ws = new WeakMap(), _handleOnMessage = new WeakSet(), handleOnMessage_fn = async function(msg) {
    const buffer = new Uint8Array(msg.data);
    let decompressed;
    if (buffer[0] === 0) {
      decompressed = buffer.slice(1);
    } else if (buffer[0] === 1) {
      throw new Error(
        "Brotli Compression not supported. Please use gzip or none compression in withCompression method on DbConnection."
      );
    } else if (buffer[0] === 2) {
      decompressed = await decompress(buffer.slice(1), "gzip");
    } else {
      throw new Error(
        "Unexpected Compression Algorithm. Please use `gzip` or `none`"
      );
    }
    this.onmessage?.({ data: decompressed });
  }, _handleOnOpen = new WeakSet(), handleOnOpen_fn = function(msg) {
    this.onopen?.(msg);
  }, _handleOnError = new WeakSet(), handleOnError_fn = function(msg) {
    this.onerror?.(msg);
  }, _handleOnClose = new WeakSet(), handleOnClose_fn = function(msg) {
    this.onclose?.(msg);
  }, _a7);
  var _uri, _nameOrAddress, _identity, _token, _emitter, _compression, _lightMode, _confirmedReads, _createWSFn, _a8;
  var DbConnectionBuilder = (_a8 = class {
    /**
     * Creates a new `DbConnectionBuilder` database client and set the initial parameters.
     *
     * Users are not expected to call this constructor directly. Instead, use the static method `DbConnection.builder()`.
     *
     * @param remoteModule The remote module to use to connect to the SpacetimeDB server.
     * @param dbConnectionConstructor The constructor to use to create a new `DbConnection`.
     */
    constructor(remoteModule, dbConnectionCtor) {
      __privateAdd(this, _uri, void 0);
      __privateAdd(this, _nameOrAddress, void 0);
      __privateAdd(this, _identity, void 0);
      __privateAdd(this, _token, void 0);
      __privateAdd(this, _emitter, new EventEmitter());
      __privateAdd(this, _compression, "gzip");
      __privateAdd(this, _lightMode, false);
      __privateAdd(this, _confirmedReads, void 0);
      __privateAdd(this, _createWSFn, void 0);
      this.remoteModule = remoteModule;
      this.dbConnectionCtor = dbConnectionCtor;
      __privateSet(this, _createWSFn, WebsocketDecompressAdapter.createWebSocketFn);
    }
    /**
     * Set the URI of the SpacetimeDB server to connect to.
     *
     * @param uri The URI of the SpacetimeDB server to connect to.
     *
     **/
    withUri(uri) {
      __privateSet(this, _uri, new URL(uri));
      return this;
    }
    /**
     * Set the name or Identity of the database module to connect to.
     *
     * @param nameOrAddress
     *
     * @returns The `DbConnectionBuilder` instance.
     */
    withModuleName(nameOrAddress) {
      __privateSet(this, _nameOrAddress, nameOrAddress);
      return this;
    }
    /**
     * Set the identity of the client to connect to the database.
     *
     * @param token The credentials to use to authenticate with SpacetimeDB. This
     * is optional. You can store the token returned by the `onConnect` callback
     * to use in future connections.
     *
     * @returns The `DbConnectionBuilder` instance.
     */
    withToken(token) {
      __privateSet(this, _token, token);
      return this;
    }
    withWSFn(createWSFn) {
      __privateSet(this, _createWSFn, createWSFn);
      return this;
    }
    /**
     * Set the compression algorithm to use for the connection.
     *
     * @param compression The compression algorithm to use for the connection.
     */
    withCompression(compression) {
      __privateSet(this, _compression, compression);
      return this;
    }
    /**
     * Sets the connection to operate in light mode.
     *
     * Light mode is a mode that reduces the amount of data sent over the network.
     *
     * @param lightMode The light mode for the connection.
     */
    withLightMode(lightMode) {
      __privateSet(this, _lightMode, lightMode);
      return this;
    }
    /**
     * Sets the connection to use confirmed reads.
     *
     * When enabled, the server will send query results only after they are
     * confirmed to be durable.
     *
     * What durable means depends on the server configuration: a single node
     * server may consider a transaction durable once it is `fsync`'ed to disk,
     * whereas a cluster may require that some number of replicas have
     * acknowledge that they have stored the transactions.
     *
     * Note that enabling confirmed reads will increase the latency between a
     * reducer call and the corresponding subscription update arriving at the
     * client.
     *
     * If this method is not called, not preference is sent to the server, and
     * the server will choose the default.
     *
     * @param confirmedReads `true` to enable confirmed reads, `false` to disable.
     */
    withConfirmedReads(confirmedReads) {
      __privateSet(this, _confirmedReads, confirmedReads);
      return this;
    }
    /**
     * Register a callback to be invoked upon authentication with the database.
     *
     * @param identity A unique identifier for a client connected to a database.
     * @param token The credentials to use to authenticate with SpacetimeDB.
     *
     * @returns The `DbConnectionBuilder` instance.
     *
     * The callback will be invoked with the `Identity` and private authentication `token` provided by the database to identify this connection.
     *
     * If credentials were supplied to connect, those passed to the callback will be equivalent to the ones used to connect.
     *
     * If the initial connection was anonymous, a new set of credentials will be generated by the database to identify this user.
     *
     * The credentials passed to the callback can be saved and used to authenticate the same user in future connections.
     *
     * @example
     *
     * ```ts
     * DbConnection.builder().onConnect((ctx, identity, token) => {
     *  console.log("Connected to SpacetimeDB with identity:", identity.toHexString());
     * });
     * ```
     */
    onConnect(callback) {
      __privateGet(this, _emitter).on("connect", callback);
      return this;
    }
    /**
     * Register a callback to be invoked upon an error.
     *
     * @example
     *
     * ```ts
     * DbConnection.builder().onConnectError((ctx, error) => {
     *   console.log("Error connecting to SpacetimeDB:", error);
     * });
     * ```
     */
    onConnectError(callback) {
      __privateGet(this, _emitter).on("connectError", callback);
      return this;
    }
    /**
     * Registers a callback to run when a {@link DbConnection} whose connection initially succeeded
     * is disconnected, either after a {@link DbConnection.disconnect} call or due to an error.
     *
     * If the connection ended because of an error, the error is passed to the callback.
     *
     * The `callback` will be installed on the `DbConnection` created by `build`
     * before initiating the connection, ensuring there's no opportunity for the disconnect to happen
     * before the callback is installed.
     *
     * Note that this does not trigger if `build` fails
     * or in cases where {@link DbConnectionBuilder.onConnectError} would trigger.
     * This callback only triggers if the connection closes after `build` returns successfully
     * and {@link DbConnectionBuilder.onConnect} is invoked, i.e., after the `IdentityToken` is received.
     *
     * To simplify SDK implementation, at most one such callback can be registered.
     * Calling `onDisconnect` on the same `DbConnectionBuilder` multiple times throws an error.
     *
     * Unlike callbacks registered via {@link DbConnection},
     * no mechanism is provided to unregister the provided callback.
     * This is a concession to ergonomics; there's no clean place to return a `CallbackId` from this method
     * or from `build`.
     *
     * @param {function(error?: Error): void} callback - The callback to invoke upon disconnection.
     * @throws {Error} Throws an error if called multiple times on the same `DbConnectionBuilder`.
     */
    onDisconnect(callback) {
      __privateGet(this, _emitter).on("disconnect", callback);
      return this;
    }
    /**
     * Builds a new `DbConnection` with the parameters set on this `DbConnectionBuilder` and attempts to connect to the SpacetimeDB server.
     *
     * @returns A new `DbConnection` with the parameters set on this `DbConnectionBuilder`.
     *
     * @example
     *
     * ```ts
     * const host = "http://localhost:3000";
     * const name_or_address = "database_name"
     * const auth_token = undefined;
     * DbConnection.builder().withUri(host).withModuleName(name_or_address).withToken(auth_token).build();
     * ```
     */
    build() {
      if (!__privateGet(this, _uri)) {
        throw new Error("URI is required to connect to SpacetimeDB");
      }
      if (!__privateGet(this, _nameOrAddress)) {
        throw new Error(
          "Database name or address is required to connect to SpacetimeDB"
        );
      }
      ensureMinimumVersionOrThrow(this.remoteModule.versionInfo?.cliVersion);
      return this.dbConnectionCtor({
        uri: __privateGet(this, _uri),
        nameOrAddress: __privateGet(this, _nameOrAddress),
        identity: __privateGet(this, _identity),
        token: __privateGet(this, _token),
        emitter: __privateGet(this, _emitter),
        compression: __privateGet(this, _compression),
        lightMode: __privateGet(this, _lightMode),
        confirmedReads: __privateGet(this, _confirmedReads),
        createWSFn: __privateGet(this, _createWSFn),
        remoteModule: this.remoteModule
      });
    }
  }, _uri = new WeakMap(), _nameOrAddress = new WeakMap(), _identity = new WeakMap(), _token = new WeakMap(), _emitter = new WeakMap(), _compression = new WeakMap(), _lightMode = new WeakMap(), _confirmedReads = new WeakMap(), _createWSFn = new WeakMap(), _a8);
  var _onApplied, _onError, _a9;
  var SubscriptionBuilderImpl = (_a9 = class {
    constructor(db) {
      __privateAdd(this, _onApplied, void 0);
      __privateAdd(this, _onError, void 0);
      this.db = db;
    }
    /**
     * Registers `callback` to run when this query is successfully added to our subscribed set,
     * I.e. when its `SubscriptionApplied` message is received.
     *
     * The database state exposed via the `&EventContext` argument
     * includes all the rows added to the client cache as a result of the new subscription.
     *
     * The event in the `&EventContext` argument is `Event::SubscribeApplied`.
     *
     * Multiple `on_applied` callbacks for the same query may coexist.
     * No mechanism for un-registering `on_applied` callbacks is exposed.
     *
     * @param cb - Callback to run when the subscription is applied.
     * @returns The current `SubscriptionBuilder` instance.
     */
    onApplied(cb) {
      __privateSet(this, _onApplied, cb);
      return this;
    }
    /**
     * Registers `callback` to run when this query either:
     * - Fails to be added to our subscribed set.
     * - Is unexpectedly removed from our subscribed set.
     *
     * If the subscription had previously started and has been unexpectedly removed,
     * the database state exposed via the `&EventContext` argument contains no rows
     * from any subscriptions removed within the same error event.
     * As proposed, it must therefore contain no rows.
     *
     * The event in the `&EventContext` argument is `Event::SubscribeError`,
     * containing a dynamic error object with a human-readable description of the error
     * for diagnostic purposes.
     *
     * Multiple `on_error` callbacks for the same query may coexist.
     * No mechanism for un-registering `on_error` callbacks is exposed.
     *
     * @param cb - Callback to run when there is an error in subscription.
     * @returns The current `SubscriptionBuilder` instance.
     */
    onError(cb) {
      __privateSet(this, _onError, cb);
      return this;
    }
    /**
     * Subscribe to a single query. The results of the query will be merged into the client
     * cache and deduplicated on the client.
     *
     * @param query_sql A `SQL` query to subscribe to.
     *
     * @example
     *
     * ```ts
     * const subscription = connection.subscriptionBuilder().onApplied(() => {
     *   console.log("SDK client cache initialized.");
     * }).subscribe("SELECT * FROM User");
     *
     * subscription.unsubscribe();
     * ```
     */
    subscribe(query_sql) {
      const queries = Array.isArray(query_sql) ? query_sql : [query_sql];
      if (queries.length === 0) {
        throw new Error("Subscriptions must have at least one query");
      }
      return new SubscriptionHandleImpl(
        this.db,
        queries,
        __privateGet(this, _onApplied),
        __privateGet(this, _onError)
      );
    }
    /**
     * Subscribes to all rows from all tables.
     *
     * This method is intended as a convenience
     * for applications where client-side memory use and network bandwidth are not concerns.
     * Applications where these resources are a constraint
     * should register more precise queries via `subscribe`
     * in order to replicate only the subset of data which the client needs to function.
     *
     * This method should not be combined with `subscribe` on the same `DbConnection`.
     * A connection may either `subscribe` to particular queries,
     * or `subscribeToAllTables`, but not both.
     * Attempting to call `subscribe`
     * on a `DbConnection` that has previously used `subscribeToAllTables`,
     * or vice versa, may misbehave in any number of ways,
     * including dropping subscriptions, corrupting the client cache, or throwing errors.
     */
    subscribeToAllTables() {
      this.subscribe("SELECT * FROM *");
    }
  }, _onApplied = new WeakMap(), _onError = new WeakMap(), _a9);
  var SubscriptionManager = class {
    constructor() {
      __publicField(this, "subscriptions", /* @__PURE__ */ new Map());
    }
  };
  var _queryId, _unsubscribeCalled, _endedState, _activeState, _emitter2, _a10;
  var SubscriptionHandleImpl = (_a10 = class {
    constructor(db, querySql, onApplied, onError) {
      __privateAdd(this, _queryId, void 0);
      __privateAdd(this, _unsubscribeCalled, false);
      __privateAdd(this, _endedState, false);
      __privateAdd(this, _activeState, false);
      __privateAdd(this, _emitter2, new EventEmitter());
      this.db = db;
      __privateGet(this, _emitter2).on(
        "applied",
        (ctx) => {
          __privateSet(this, _activeState, true);
          if (onApplied) {
            onApplied(ctx);
          }
        }
      );
      __privateGet(this, _emitter2).on(
        "error",
        (ctx, error) => {
          __privateSet(this, _activeState, false);
          __privateSet(this, _endedState, true);
          if (onError) {
            onError(ctx, error);
          }
        }
      );
      __privateSet(this, _queryId, this.db.registerSubscription(this, __privateGet(this, _emitter2), querySql));
    }
    /**
     * Consumes self and issues an `Unsubscribe` message,
     * removing this query from the client's set of subscribed queries.
     * It is only valid to call this method if `is_active()` is `true`.
     */
    unsubscribe() {
      if (__privateGet(this, _unsubscribeCalled)) {
        throw new Error("Unsubscribe has already been called");
      }
      __privateSet(this, _unsubscribeCalled, true);
      this.db.unregisterSubscription(__privateGet(this, _queryId));
      __privateGet(this, _emitter2).on(
        "end",
        (_ctx) => {
          __privateSet(this, _endedState, true);
          __privateSet(this, _activeState, false);
        }
      );
    }
    /**
     * Unsubscribes and also registers a callback to run upon success.
     * I.e. when an `UnsubscribeApplied` message is received.
     *
     * If `Unsubscribe` returns an error,
     * or if the `on_error` callback(s) are invoked before this subscription would end normally,
     * the `on_end` callback is not invoked.
     *
     * @param onEnd - Callback to run upon successful unsubscribe.
     */
    unsubscribeThen(onEnd) {
      if (__privateGet(this, _endedState)) {
        throw new Error("Subscription has already ended");
      }
      if (__privateGet(this, _unsubscribeCalled)) {
        throw new Error("Unsubscribe has already been called");
      }
      __privateSet(this, _unsubscribeCalled, true);
      this.db.unregisterSubscription(__privateGet(this, _queryId));
      __privateGet(this, _emitter2).on(
        "end",
        (ctx) => {
          __privateSet(this, _endedState, true);
          __privateSet(this, _activeState, false);
          onEnd(ctx);
        }
      );
    }
    /**
     * True if this `SubscriptionHandle` has ended,
     * either due to an error or a call to `unsubscribe`.
     *
     * This is initially false, and becomes true when either the `on_end` or `on_error` callback is invoked.
     * A subscription which has not yet been applied is not active, but is also not ended.
     */
    isEnded() {
      return __privateGet(this, _endedState);
    }
    /**
     * True if this `SubscriptionHandle` is active, meaning it has been successfully applied
     * and has not since ended, either due to an error or a complete `unsubscribe` request-response pair.
     *
     * This corresponds exactly to the interval bounded at the start by the `on_applied` callback
     * and at the end by either the `on_end` or `on_error` callback.
     */
    isActive() {
      return __privateGet(this, _activeState);
    }
  }, _queryId = new WeakMap(), _unsubscribeCalled = new WeakMap(), _endedState = new WeakMap(), _activeState = new WeakMap(), _emitter2 = new WeakMap(), _a10);
  function callReducerFlagsToNumber(flags) {
    switch (flags) {
      case "FullUpdate":
        return 0;
      case "NoSuccessNotify":
        return 1;
    }
  }
  var _queryId2, _emitter3, _reducerEmitter, _onApplied2, _messageQueue, _subscriptionManager, _remoteModule, _callReducerFlags, _getNextQueryId, _makeDbView, makeDbView_fn, _makeReducers, makeReducers_fn, _makeSetReducerFlags, makeSetReducerFlags_fn, _makeEventContext, makeEventContext_fn, _processParsedMessage, processParsedMessage_fn, _sendMessage, sendMessage_fn, _handleOnOpen2, handleOnOpen_fn2, _applyTableUpdates, applyTableUpdates_fn, _processMessage, processMessage_fn, _handleOnMessage2, handleOnMessage_fn2, _a11;
  var DbConnectionImpl = (_a11 = class {
    constructor({
      uri,
      nameOrAddress,
      identity,
      token,
      emitter,
      remoteModule,
      createWSFn,
      compression,
      lightMode,
      confirmedReads
    }) {
      __privateAdd(this, _makeDbView);
      __privateAdd(this, _makeReducers);
      __privateAdd(this, _makeSetReducerFlags);
      __privateAdd(this, _makeEventContext);
      // This function is async because we decompress the message async
      __privateAdd(this, _processParsedMessage);
      __privateAdd(this, _sendMessage);
      /**
       * Handles WebSocket onOpen event.
       */
      __privateAdd(this, _handleOnOpen2);
      __privateAdd(this, _applyTableUpdates);
      __privateAdd(this, _processMessage);
      /**
       * Handles WebSocket onMessage event.
       * @param wsMessage MessageEvent object.
       */
      __privateAdd(this, _handleOnMessage2);
      /**
       * Whether or not the connection is active.
       */
      __publicField(this, "isActive", false);
      /**
       * This connection's public identity.
       */
      __publicField(this, "identity");
      /**
       * This connection's private authentication token.
       */
      __publicField(this, "token");
      /**
       * The accessor field to access the tables in the database and associated
       * callback functions.
       */
      __publicField(this, "db");
      /**
       * The accessor field to access the reducers in the database and associated
       * callback functions.
       */
      __publicField(this, "reducers");
      /**
       * The accessor field to access functions related to setting flags on
       * reducers regarding how the server should handle the reducer call and
       * the events that it sends back to the client.
       */
      __publicField(this, "setReducerFlags");
      /**
       * The `ConnectionId` of the connection to to the database.
       */
      __publicField(this, "connectionId", ConnectionId.random());
      // These fields are meant to be strictly private.
      __privateAdd(this, _queryId2, 0);
      __privateAdd(this, _emitter3, void 0);
      __privateAdd(this, _reducerEmitter, new EventEmitter());
      __privateAdd(this, _onApplied2, void 0);
      __privateAdd(this, _messageQueue, Promise.resolve());
      __privateAdd(this, _subscriptionManager, new SubscriptionManager());
      __privateAdd(this, _remoteModule, void 0);
      __privateAdd(this, _callReducerFlags, /* @__PURE__ */ new Map());
      // These fields are not part of the public API, but in a pinch you
      // could use JavaScript to access them by bypassing TypeScript's
      // private fields.
      // We use them in testing.
      __publicField(this, "clientCache");
      __publicField(this, "ws");
      __publicField(this, "wsPromise");
      __privateAdd(this, _getNextQueryId, () => {
        const queryId = __privateGet(this, _queryId2);
        __privateSet(this, _queryId2, __privateGet(this, _queryId2) + 1);
        return queryId;
      });
      // NOTE: This is very important!!! This is the actual function that
      // gets called when you call `connection.subscriptionBuilder()`.
      // The `subscriptionBuilder` function which is generated, just shadows
      // this function in the type system, but not the actual implementation!
      // Do not remove this function, or shoot yourself in the foot please.
      // It's not clear what would be a better way to do this at this exact
      // moment.
      __publicField(this, "subscriptionBuilder", () => {
        return new SubscriptionBuilderImpl(this);
      });
      stdbLogger("info", "Connecting to SpacetimeDB WS...");
      const url = new URL(uri.toString());
      if (!/^wss?:/.test(uri.protocol)) {
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      }
      this.identity = identity;
      this.token = token;
      __privateSet(this, _remoteModule, remoteModule);
      __privateSet(this, _emitter3, emitter);
      const connectionId = this.connectionId.toHexString();
      url.searchParams.set("connection_id", connectionId);
      this.clientCache = new ClientCache();
      this.db = __privateMethod(this, _makeDbView, makeDbView_fn).call(this, remoteModule);
      this.reducers = __privateMethod(this, _makeReducers, makeReducers_fn).call(this, remoteModule);
      this.setReducerFlags = __privateMethod(this, _makeSetReducerFlags, makeSetReducerFlags_fn).call(this, remoteModule);
      this.wsPromise = createWSFn({
        url,
        nameOrAddress,
        wsProtocol: "v1.bsatn.spacetimedb",
        authToken: token,
        compression,
        lightMode,
        confirmedReads
      }).then((v) => {
        this.ws = v;
        this.ws.onclose = () => {
          __privateGet(this, _emitter3).emit("disconnect", this);
          this.isActive = false;
        };
        this.ws.onerror = (e) => {
          __privateGet(this, _emitter3).emit("connectError", this, e);
          this.isActive = false;
        };
        this.ws.onopen = __privateMethod(this, _handleOnOpen2, handleOnOpen_fn2).bind(this);
        this.ws.onmessage = __privateMethod(this, _handleOnMessage2, handleOnMessage_fn2).bind(this);
        return v;
      }).catch((e) => {
        stdbLogger("error", "Error connecting to SpacetimeDB WS");
        __privateGet(this, _emitter3).emit("connectError", this, e);
        return void 0;
      });
    }
    registerSubscription(handle, handleEmitter, querySql) {
      const queryId = __privateGet(this, _getNextQueryId).call(this);
      __privateGet(this, _subscriptionManager).subscriptions.set(queryId, {
        handle,
        emitter: handleEmitter
      });
      __privateMethod(this, _sendMessage, sendMessage_fn).call(this, client_message_type_default.SubscribeMulti({
        queryStrings: querySql,
        queryId: { id: queryId },
        // The TypeScript SDK doesn't currently track `request_id`s,
        // so always use 0.
        requestId: 0
      }));
      return queryId;
    }
    unregisterSubscription(queryId) {
      __privateMethod(this, _sendMessage, sendMessage_fn).call(this, client_message_type_default.UnsubscribeMulti({
        queryId: { id: queryId },
        // The TypeScript SDK doesn't currently track `request_id`s,
        // so always use 0.
        requestId: 0
      }));
    }
    /**
     * Call a reducer on your SpacetimeDB module.
     *
     * @param reducerName The name of the reducer to call
     * @param argsSerializer The arguments to pass to the reducer
     */
    callReducer(reducerName, argsBuffer, flags) {
      const message = client_message_type_default.CallReducer({
        reducer: reducerName,
        args: argsBuffer,
        // The TypeScript SDK doesn't currently track `request_id`s,
        // so always use 0.
        requestId: 0,
        flags: callReducerFlagsToNumber(flags)
      });
      __privateMethod(this, _sendMessage, sendMessage_fn).call(this, message);
    }
    /**
     * Call a reducer on your SpacetimeDB module with typed arguments.
     * @param reducerSchema The schema of the reducer to call
     * @param callReducerFlags The flags for the reducer call
     * @param params The arguments to pass to the reducer
     */
    callReducerWithParams(reducerName, paramsType, params, flags) {
      const writer = new BinaryWriter(1024);
      ProductType.serializeValue(writer, paramsType, params);
      const argsBuffer = writer.getBuffer();
      this.callReducer(reducerName, argsBuffer, flags);
    }
    /**
     * Close the current connection.
     *
     * @example
     *
     * ```ts
     * const connection = DbConnection.builder().build();
     * connection.disconnect()
     * ```
     */
    disconnect() {
      this.wsPromise.then((wsResolved) => {
        if (wsResolved) {
          wsResolved.close();
        }
      });
    }
    on(eventName, callback) {
      __privateGet(this, _emitter3).on(eventName, callback);
    }
    off(eventName, callback) {
      __privateGet(this, _emitter3).off(eventName, callback);
    }
    onConnect(callback) {
      __privateGet(this, _emitter3).on("connect", callback);
    }
    onDisconnect(callback) {
      __privateGet(this, _emitter3).on("disconnect", callback);
    }
    onConnectError(callback) {
      __privateGet(this, _emitter3).on("connectError", callback);
    }
    removeOnConnect(callback) {
      __privateGet(this, _emitter3).off("connect", callback);
    }
    removeOnDisconnect(callback) {
      __privateGet(this, _emitter3).off("disconnect", callback);
    }
    removeOnConnectError(callback) {
      __privateGet(this, _emitter3).off("connectError", callback);
    }
    // Note: This is required to be public because it needs to be
    // called from the `RemoteReducers` class.
    onReducer(reducerName, callback) {
      __privateGet(this, _reducerEmitter).on(reducerName, callback);
    }
    // Note: This is required to be public because it needs to be
    // called from the `RemoteReducers` class.
    offReducer(reducerName, callback) {
      __privateGet(this, _reducerEmitter).off(reducerName, callback);
    }
  }, _queryId2 = new WeakMap(), _emitter3 = new WeakMap(), _reducerEmitter = new WeakMap(), _onApplied2 = new WeakMap(), _messageQueue = new WeakMap(), _subscriptionManager = new WeakMap(), _remoteModule = new WeakMap(), _callReducerFlags = new WeakMap(), _getNextQueryId = new WeakMap(), _makeDbView = new WeakSet(), makeDbView_fn = function(def) {
    const view = /* @__PURE__ */ Object.create(null);
    for (const tbl of def.tables) {
      const key = tbl.accessorName;
      Object.defineProperty(view, key, {
        enumerable: true,
        configurable: false,
        get: () => {
          return this.clientCache.getOrCreateTable(tbl);
        }
      });
    }
    return view;
  }, _makeReducers = new WeakSet(), makeReducers_fn = function(def) {
    const out = {};
    for (const reducer2 of def.reducers) {
      const key = toCamelCase(reducer2.name);
      out[key] = (params) => {
        const flags = __privateGet(this, _callReducerFlags).get(reducer2.name) ?? "FullUpdate";
        this.callReducerWithParams(
          reducer2.name,
          reducer2.paramsType,
          params,
          flags
        );
      };
      const onReducerEventKey = `on${toPascalCase(reducer2.name)}`;
      out[onReducerEventKey] = (callback) => {
        this.onReducer(reducer2.name, callback);
      };
      const offReducerEventKey = `removeOn${toPascalCase(reducer2.name)}`;
      out[offReducerEventKey] = (callback) => {
        this.offReducer(reducer2.name, callback);
      };
    }
    return out;
  }, _makeSetReducerFlags = new WeakSet(), makeSetReducerFlags_fn = function(defs) {
    const out = /* @__PURE__ */ Object.create(null);
    for (const r of defs.reducers) {
      const key = toCamelCase(r.name);
      Object.defineProperty(out, key, {
        enumerable: true,
        configurable: false,
        value: (flags) => {
          __privateGet(this, _callReducerFlags).set(r.name, flags);
        }
      });
    }
    return out;
  }, _makeEventContext = new WeakSet(), makeEventContext_fn = function(event) {
    return {
      db: this.db,
      reducers: this.reducers,
      setReducerFlags: this.setReducerFlags,
      isActive: this.isActive,
      subscriptionBuilder: this.subscriptionBuilder.bind(this),
      disconnect: this.disconnect.bind(this),
      event
    };
  }, _processParsedMessage = new WeakSet(), processParsedMessage_fn = async function(message) {
    const parseRowList = (type, tableName, rowList) => {
      const buffer = rowList.rowsData;
      const reader = new BinaryReader(buffer);
      const rows = [];
      const table2 = __privateGet(this, _remoteModule).tables.find((t2) => t2.name === tableName);
      const rowType = table2.rowType;
      const columnsArray = Object.entries(table2.columns);
      const primaryKeyColumnEntry = columnsArray.find(
        (col) => col[1].columnMetadata.isPrimaryKey
      );
      let previousOffset = 0;
      while (reader.remaining > 0) {
        const row = ProductType.deserializeValue(reader, rowType);
        let rowId = void 0;
        if (primaryKeyColumnEntry !== void 0) {
          const primaryKeyColName = primaryKeyColumnEntry[0];
          const primaryKeyColType = primaryKeyColumnEntry[1].typeBuilder.algebraicType;
          rowId = AlgebraicType.intoMapKey(
            primaryKeyColType,
            row[primaryKeyColName]
          );
        } else {
          const rowBytes = buffer.subarray(previousOffset, reader.offset);
          const asBase64 = (0, import_base64_js.fromByteArray)(rowBytes);
          rowId = asBase64;
        }
        previousOffset = reader.offset;
        rows.push({
          type,
          rowId,
          row
        });
      }
      return rows;
    };
    const parseTableUpdate = async (rawTableUpdate) => {
      const tableName = rawTableUpdate.tableName;
      let operations = [];
      for (const update of rawTableUpdate.updates) {
        let decompressed;
        if (update.tag === "Gzip") {
          const decompressedBuffer = await decompress(update.value, "gzip");
          decompressed = AlgebraicType.deserializeValue(
            new BinaryReader(decompressedBuffer),
            query_update_type_default.algebraicType
          );
        } else if (update.tag === "Brotli") {
          throw new Error(
            "Brotli compression not supported. Please use gzip or none compression in withCompression method on DbConnection."
          );
        } else {
          decompressed = update.value;
        }
        operations = operations.concat(
          parseRowList("insert", tableName, decompressed.inserts)
        );
        operations = operations.concat(
          parseRowList("delete", tableName, decompressed.deletes)
        );
      }
      return {
        tableName,
        operations
      };
    };
    const parseDatabaseUpdate = async (dbUpdate) => {
      const tableUpdates = [];
      for (const rawTableUpdate of dbUpdate.tables) {
        tableUpdates.push(await parseTableUpdate(rawTableUpdate));
      }
      return tableUpdates;
    };
    switch (message.tag) {
      case "InitialSubscription": {
        const dbUpdate = message.value.databaseUpdate;
        const tableUpdates = await parseDatabaseUpdate(dbUpdate);
        const subscriptionUpdate = {
          tag: "InitialSubscription",
          tableUpdates
        };
        return subscriptionUpdate;
      }
      case "TransactionUpdateLight": {
        const dbUpdate = message.value.update;
        const tableUpdates = await parseDatabaseUpdate(dbUpdate);
        const subscriptionUpdate = {
          tag: "TransactionUpdateLight",
          tableUpdates
        };
        return subscriptionUpdate;
      }
      case "TransactionUpdate": {
        const txUpdate = message.value;
        const identity = txUpdate.callerIdentity;
        const connectionId = ConnectionId.nullIfZero(
          txUpdate.callerConnectionId
        );
        const reducerName = txUpdate.reducerCall.reducerName;
        const args = txUpdate.reducerCall.args;
        const energyQuantaUsed = txUpdate.energyQuantaUsed;
        let tableUpdates = [];
        let errMessage = "";
        switch (txUpdate.status.tag) {
          case "Committed":
            tableUpdates = await parseDatabaseUpdate(txUpdate.status.value);
            break;
          case "Failed":
            tableUpdates = [];
            errMessage = txUpdate.status.value;
            break;
          case "OutOfEnergy":
            tableUpdates = [];
            break;
        }
        if (reducerName === "<none>") {
          const errorMessage = errMessage;
          console.error(`Received an error from the database: ${errorMessage}`);
          return;
        }
        let reducerInfo;
        if (reducerName !== "") {
          reducerInfo = {
            reducerName,
            args
          };
        }
        const transactionUpdate = {
          tag: "TransactionUpdate",
          tableUpdates,
          identity,
          connectionId,
          reducerInfo,
          status: txUpdate.status,
          energyConsumed: energyQuantaUsed.quanta,
          message: errMessage,
          timestamp: txUpdate.timestamp
        };
        return transactionUpdate;
      }
      case "IdentityToken": {
        const identityTokenMessage = {
          tag: "IdentityToken",
          identity: message.value.identity,
          token: message.value.token,
          connectionId: message.value.connectionId
        };
        return identityTokenMessage;
      }
      case "OneOffQueryResponse": {
        throw new Error(
          `TypeScript SDK never sends one-off queries, but got OneOffQueryResponse ${message}`
        );
      }
      case "SubscribeMultiApplied": {
        const parsedTableUpdates = await parseDatabaseUpdate(
          message.value.update
        );
        const subscribeAppliedMessage = {
          tag: "SubscribeApplied",
          queryId: message.value.queryId.id,
          tableUpdates: parsedTableUpdates
        };
        return subscribeAppliedMessage;
      }
      case "UnsubscribeMultiApplied": {
        const parsedTableUpdates = await parseDatabaseUpdate(
          message.value.update
        );
        const unsubscribeAppliedMessage = {
          tag: "UnsubscribeApplied",
          queryId: message.value.queryId.id,
          tableUpdates: parsedTableUpdates
        };
        return unsubscribeAppliedMessage;
      }
      case "SubscriptionError": {
        return {
          tag: "SubscriptionError",
          queryId: message.value.queryId,
          error: message.value.error
        };
      }
    }
  }, _sendMessage = new WeakSet(), sendMessage_fn = function(message) {
    this.wsPromise.then((wsResolved) => {
      if (wsResolved) {
        const writer = new BinaryWriter(1024);
        AlgebraicType.serializeValue(
          writer,
          client_message_type_default.algebraicType,
          message
        );
        const encoded = writer.getBuffer();
        wsResolved.send(encoded);
      }
    });
  }, _handleOnOpen2 = new WeakSet(), handleOnOpen_fn2 = function() {
    this.isActive = true;
  }, _applyTableUpdates = new WeakSet(), applyTableUpdates_fn = function(tableUpdates, eventContext) {
    const pendingCallbacks = [];
    for (const tableUpdate of tableUpdates) {
      const tableName = tableUpdate.tableName;
      const tableDef = __privateGet(this, _remoteModule).tables.find(
        (t2) => t2.name === tableName
      );
      const table2 = this.clientCache.getOrCreateTable(tableDef);
      const newCallbacks = table2.applyOperations(
        tableUpdate.operations,
        eventContext
      );
      for (const callback of newCallbacks) {
        pendingCallbacks.push(callback);
      }
    }
    return pendingCallbacks;
  }, _processMessage = new WeakSet(), processMessage_fn = async function(data) {
    var _a12;
    const serverMessage = AlgebraicType.deserializeValue(
      new BinaryReader(data),
      server_message_type_default.algebraicType
    );
    const message = await __privateMethod(this, _processParsedMessage, processParsedMessage_fn).call(this, serverMessage);
    if (!message) {
      return;
    }
    switch (message.tag) {
      case "InitialSubscription": {
        const event = { tag: "SubscribeApplied" };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        if (__privateGet(this, _emitter3)) {
          (_a12 = __privateGet(this, _onApplied2)) == null ? void 0 : _a12.call(this, subscriptionEventContext);
        }
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "TransactionUpdateLight": {
        const event = { tag: "UnknownTransaction" };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "TransactionUpdate": {
        let reducerInfo = message.reducerInfo;
        let unknownTransaction = false;
        let reducerArgs;
        const reducer2 = __privateGet(this, _remoteModule).reducers.find(
          (t2) => t2.name === reducerInfo.reducerName
        );
        if (!reducerInfo) {
          unknownTransaction = true;
        } else {
          try {
            const reader = new BinaryReader(reducerInfo.args);
            reducerArgs = ProductType.deserializeValue(
              reader,
              reducer2?.paramsType
            );
          } catch {
            console.debug("Failed to deserialize reducer arguments");
            unknownTransaction = true;
          }
        }
        if (unknownTransaction) {
          const event2 = { tag: "UnknownTransaction" };
          const eventContext2 = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event2);
          const callbacks2 = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext2);
          for (const callback of callbacks2) {
            callback.cb();
          }
          return;
        }
        reducerInfo = reducerInfo;
        reducerArgs = reducerArgs;
        const reducerEvent = {
          callerIdentity: message.identity,
          status: message.status,
          callerConnectionId: message.connectionId,
          timestamp: message.timestamp,
          energyConsumed: message.energyConsumed,
          reducer: {
            name: reducerInfo.reducerName,
            args: reducerArgs
          }
        };
        const event = {
          tag: "Reducer",
          value: reducerEvent
        };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const reducerEventContext = {
          ...eventContext,
          event: reducerEvent
        };
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        const argsArray = [];
        reducer2.paramsType.elements.forEach((element) => {
          argsArray.push(reducerArgs[element.name]);
        });
        __privateGet(this, _reducerEmitter).emit(
          reducerInfo.reducerName,
          reducerEventContext,
          ...argsArray
        );
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "IdentityToken": {
        this.identity = message.identity;
        if (!this.token && message.token) {
          this.token = message.token;
        }
        this.connectionId = message.connectionId;
        __privateGet(this, _emitter3).emit("connect", this, this.identity, this.token);
        break;
      }
      case "SubscribeApplied": {
        const subscription = __privateGet(this, _subscriptionManager).subscriptions.get(
          message.queryId
        );
        if (subscription === void 0) {
          stdbLogger(
            "error",
            `Received SubscribeApplied for unknown queryId ${message.queryId}.`
          );
          break;
        }
        const event = { tag: "SubscribeApplied" };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        subscription?.emitter.emit("applied", subscriptionEventContext);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "UnsubscribeApplied": {
        const subscription = __privateGet(this, _subscriptionManager).subscriptions.get(
          message.queryId
        );
        if (subscription === void 0) {
          stdbLogger(
            "error",
            `Received UnsubscribeApplied for unknown queryId ${message.queryId}.`
          );
          break;
        }
        const event = { tag: "UnsubscribeApplied" };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        subscription?.emitter.emit("end", subscriptionEventContext);
        __privateGet(this, _subscriptionManager).subscriptions.delete(message.queryId);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "SubscriptionError": {
        const error = Error(message.error);
        const event = { tag: "Error", value: error };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const errorContext = {
          ...eventContext,
          event: error
        };
        if (message.queryId !== void 0) {
          __privateGet(this, _subscriptionManager).subscriptions.get(message.queryId)?.emitter.emit("error", errorContext, error);
          __privateGet(this, _subscriptionManager).subscriptions.delete(message.queryId);
        } else {
          console.error("Received an error message without a queryId: ", error);
          __privateGet(this, _subscriptionManager).subscriptions.forEach(({ emitter }) => {
            emitter.emit("error", errorContext, error);
          });
        }
      }
    }
  }, _handleOnMessage2 = new WeakSet(), handleOnMessage_fn2 = function(wsMessage) {
    __privateSet(this, _messageQueue, __privateGet(this, _messageQueue).then(() => {
      return __privateMethod(this, _processMessage, processMessage_fn).call(this, wsMessage.data);
    }));
  }, _a11);
  var Lifecycle = t.enum("Lifecycle", {
    Init: t.unit(),
    OnConnect: t.unit(),
    OnDisconnect: t.unit()
  });
  var lifecycle_type_default = Lifecycle;
  function pushReducer(name, params, fn, lifecycle) {
    if (existingReducers.has(name)) {
      throw new TypeError(`There is already a reducer with the name '${name}'`);
    }
    existingReducers.add(name);
    if (!(params instanceof RowBuilder)) {
      params = new RowBuilder(params);
    }
    if (params.typeName === void 0) {
      params.typeName = toPascalCase(name);
    }
    const ref = registerTypesRecursively(params);
    const paramsType = resolveType(MODULE_DEF.typespace, ref).value;
    MODULE_DEF.reducers.push({
      name,
      params: paramsType,
      lifecycle
      // <- lifecycle flag lands here
    });
  }
  var existingReducers = /* @__PURE__ */ new Set();
  function reducer(name, params, fn) {
    pushReducer(name, params);
  }
  function init(name, params, fn) {
    pushReducer(name, params, fn, lifecycle_type_default.Init);
  }
  function clientConnected(name, params, fn) {
    pushReducer(name, params, fn, lifecycle_type_default.OnConnect);
  }
  function clientDisconnected(name, params, fn) {
    pushReducer(name, params, fn, lifecycle_type_default.OnDisconnect);
  }
  var Reducers = class {
    constructor(handles) {
      __publicField(this, "reducersType");
      this.reducersType = reducersToSchema(handles);
    }
  };
  function reducersToSchema(reducers22) {
    const mapped = reducers22.map((r) => {
      const paramsRow = r.params.row;
      return {
        name: r.reducerName,
        // Prefer the schema's own accessorName if present at runtime; otherwise derive it.
        accessorName: r.accessorName,
        params: paramsRow,
        paramsType: r.paramsSpacetimeType
      };
    });
    const result = { reducers: mapped };
    return result;
  }
  function reducers(...args) {
    const handles = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    return new Reducers(handles);
  }
  function reducerSchema(name, params) {
    const paramType = {
      elements: Object.entries(params).map(([n, c]) => ({
        name: n,
        algebraicType: "typeBuilder" in c ? c.typeBuilder.algebraicType : c.algebraicType
      }))
    };
    return {
      reducerName: name,
      accessorName: toCamelCase(name),
      params: new RowBuilder(params),
      paramsSpacetimeType: paramType,
      reducerDef: {
        name,
        params: paramType,
        lifecycle: void 0
      }
    };
  }
  function defineView(opts, anon, params, ret, fn) {
    const paramsBuilder = new RowBuilder(params, toPascalCase(opts.name));
    let returnType = registerTypesRecursively(ret).algebraicType;
    const { value: paramType } = resolveType(
      MODULE_DEF.typespace,
      registerTypesRecursively(paramsBuilder)
    );
    MODULE_DEF.miscExports.push({
      tag: "View",
      value: {
        name: opts.name,
        index: (anon ? ANON_VIEWS : VIEWS).length,
        isPublic: opts.public,
        isAnonymous: anon,
        params: paramType,
        returnType
      }
    });
    if (returnType.tag == "Sum") {
      const originalFn = fn;
      fn = (ctx, args) => {
        const ret2 = originalFn(ctx, args);
        return ret2 == null ? [] : [ret2];
      };
      returnType = AlgebraicType.Array(
        returnType.value.variants[0].algebraicType
      );
    }
    (anon ? ANON_VIEWS : VIEWS).push({
      fn,
      params: paramType,
      returnType,
      returnTypeBaseSize: bsatnBaseSize(MODULE_DEF.typespace, returnType)
    });
  }
  var VIEWS = [];
  var ANON_VIEWS = [];
  var RawIndexAlgorithm = t.enum("RawIndexAlgorithm", {
    BTree: t.array(t.u16()),
    Hash: t.array(t.u16()),
    Direct: t.u16()
  });
  var raw_index_algorithm_type_default = RawIndexAlgorithm;
  function tablesToSchema(tables2) {
    const result = {
      tables: tables2.map((schema2) => {
        const colNameList = [];
        schema2.rowType.algebraicType.value.elements.forEach((elem) => {
          colNameList.push(elem.name);
        });
        return {
          name: schema2.tableName,
          accessorName: toCamelCase(schema2.tableName),
          columns: schema2.rowType.row,
          // typed as T[i]['rowType']['row'] under TablesToSchema<T>
          rowType: schema2.rowSpacetimeType,
          constraints: [
            ...schema2.tableDef.constraints.map((c) => ({
              name: c.name,
              constraint: "unique",
              columns: Array.from(c.data.value.columns.map((i) => colNameList[i]))
            }))
          ],
          // UntypedTableDef expects mutable array; idxs are readonly, spread to copy.
          indexes: [
            ...schema2.idxs.map(
              (idx) => ({
                name: idx.accessorName,
                unique: schema2.tableDef.constraints.map((c) => {
                  if (idx.algorithm.tag == "BTree") {
                    return c.data.value.columns.every((col) => {
                      const idxColumns = idx.algorithm.value;
                      if (Array.isArray(idxColumns)) {
                        return idxColumns.includes(col);
                      } else {
                        return col === idxColumns;
                      }
                    });
                  }
                }).includes(true),
                algorithm: idx.algorithm.tag.toLowerCase(),
                columns: (() => {
                  const cols = idx.algorithm.tag === "Direct" ? [idx.algorithm.value] : idx.algorithm.value;
                  return cols.map((i) => colNameList[i]);
                })()
              })
            )
          ]
        };
      })
    };
    return result;
  }
  var MODULE_DEF = {
    typespace: { types: [] },
    tables: [],
    reducers: [],
    types: [],
    miscExports: [],
    rowLevelSecurity: []
  };
  var COMPOUND_TYPES = /* @__PURE__ */ new Map();
  function resolveType(typespace, typeBuilder) {
    let ty = typeBuilder.algebraicType;
    while (ty.tag === "Ref") {
      ty = typespace.types[ty.value];
    }
    return ty;
  }
  function registerTypesRecursively(typeBuilder) {
    if (typeBuilder instanceof ProductBuilder && !isUnit(typeBuilder) || typeBuilder instanceof SumBuilder || typeBuilder instanceof RowBuilder) {
      return registerCompoundTypeRecursively(typeBuilder);
    } else if (typeBuilder instanceof OptionBuilder) {
      return new OptionBuilder(
        registerTypesRecursively(typeBuilder.value)
      );
    } else if (typeBuilder instanceof ArrayBuilder) {
      return new ArrayBuilder(
        registerTypesRecursively(typeBuilder.element)
      );
    } else {
      return typeBuilder;
    }
  }
  function registerCompoundTypeRecursively(typeBuilder) {
    const ty = typeBuilder.algebraicType;
    const name = typeBuilder.typeName;
    if (name === void 0) {
      throw new Error(
        `Missing type name for ${typeBuilder.constructor.name ?? "TypeBuilder"} ${JSON.stringify(typeBuilder)}`
      );
    }
    let r = COMPOUND_TYPES.get(ty);
    if (r != null) {
      return r;
    }
    const newTy = typeBuilder instanceof RowBuilder || typeBuilder instanceof ProductBuilder ? {
      tag: "Product",
      value: { elements: [] }
    } : { tag: "Sum", value: { variants: [] } };
    r = new RefBuilder(MODULE_DEF.typespace.types.length);
    MODULE_DEF.typespace.types.push(newTy);
    COMPOUND_TYPES.set(ty, r);
    if (typeBuilder instanceof RowBuilder) {
      for (const [name2, elem] of Object.entries(typeBuilder.row)) {
        newTy.value.elements.push({
          name: name2,
          algebraicType: registerTypesRecursively(elem.typeBuilder).algebraicType
        });
      }
    } else if (typeBuilder instanceof ProductBuilder) {
      for (const [name2, elem] of Object.entries(typeBuilder.elements)) {
        newTy.value.elements.push({
          name: name2,
          algebraicType: registerTypesRecursively(elem).algebraicType
        });
      }
    } else if (typeBuilder instanceof SumBuilder) {
      for (const [name2, variant] of Object.entries(typeBuilder.variants)) {
        newTy.value.variants.push({
          name: name2,
          algebraicType: registerTypesRecursively(variant).algebraicType
        });
      }
    }
    MODULE_DEF.types.push({
      name: splitName(name),
      ty: r.ref,
      customOrdering: true
    });
    return r;
  }
  function isUnit(typeBuilder) {
    return typeBuilder.typeName == null && typeBuilder.algebraicType.value.elements.length === 0;
  }
  function splitName(name) {
    const scope = name.split(".");
    return { name: scope.pop(), scope };
  }
  var Schema = class {
    constructor(tables2, typespace, handles) {
      __publicField(this, "tablesDef");
      __publicField(this, "typespace");
      __publicField(this, "schemaType");
      // TODO: re-enable once parameterized views are supported in SQL
      // anonymousView<Ret extends ViewReturnTypeBuilder>(
      //   opts: ViewOpts,
      //   ret: Ret,
      //   fn: AnonymousViewFn<S, {}, Ret>
      // ): void;
      // anonymousView<Params extends ParamsObj, Ret extends ViewReturnTypeBuilder>(
      //   opts: ViewOpts,
      //   params: Params,
      //   ret: Ret,
      //   fn: AnonymousViewFn<S, {}, Ret>
      // ): void;
      // anonymousView<Params extends ParamsObj, Ret extends ViewReturnTypeBuilder>(
      //   opts: ViewOpts,
      //   paramsOrRet: Ret | Params,
      //   retOrFn: AnonymousViewFn<S, {}, Ret> | Ret,
      //   maybeFn?: AnonymousViewFn<S, Params, Ret>
      // ): void {
      //   if (typeof retOrFn === 'function') {
      //     defineView(name, true, {}, paramsOrRet as Ret, retOrFn);
      //   } else {
      //     defineView(name, true, paramsOrRet as Params, retOrFn, maybeFn!);
      //   }
      // }
      __publicField(this, "clientVisibilityFilter", {
        sql(filter) {
          MODULE_DEF.rowLevelSecurity.push({ sql: filter });
        }
      });
      this.tablesDef = { tables: tables2 };
      this.typespace = typespace;
      this.schemaType = tablesToSchema(handles);
    }
    reducer(name, paramsOrFn, fn) {
      if (typeof paramsOrFn === "function") {
        reducer(name, {});
        return paramsOrFn;
      } else {
        reducer(name, paramsOrFn);
        return fn;
      }
    }
    init(nameOrFn, maybeFn) {
      const [name, fn] = typeof nameOrFn === "string" ? [nameOrFn, maybeFn] : ["init", nameOrFn];
      init(name, {}, fn);
    }
    clientConnected(nameOrFn, maybeFn) {
      const [name, fn] = typeof nameOrFn === "string" ? [nameOrFn, maybeFn] : ["on_connect", nameOrFn];
      clientConnected(name, {}, fn);
    }
    clientDisconnected(nameOrFn, maybeFn) {
      const [name, fn] = typeof nameOrFn === "string" ? [nameOrFn, maybeFn] : ["on_disconnect", nameOrFn];
      clientDisconnected(name, {}, fn);
    }
    view(opts, ret, fn) {
      defineView(opts, false, {}, ret, fn);
    }
    // TODO: re-enable once parameterized views are supported in SQL
    // view<Ret extends ViewReturnTypeBuilder>(
    //   opts: ViewOpts,
    //   ret: Ret,
    //   fn: ViewFn<S, {}, Ret>
    // ): void;
    // view<Params extends ParamsObj, Ret extends ViewReturnTypeBuilder>(
    //   opts: ViewOpts,
    //   params: Params,
    //   ret: Ret,
    //   fn: ViewFn<S, {}, Ret>
    // ): void;
    // view<Params extends ParamsObj, Ret extends ViewReturnTypeBuilder>(
    //   opts: ViewOpts,
    //   paramsOrRet: Ret | Params,
    //   retOrFn: ViewFn<S, {}, Ret> | Ret,
    //   maybeFn?: ViewFn<S, Params, Ret>
    // ): void {
    //   if (typeof retOrFn === 'function') {
    //     defineView(name, false, {}, paramsOrRet as Ret, retOrFn);
    //   } else {
    //     defineView(name, false, paramsOrRet as Params, retOrFn, maybeFn!);
    //   }
    // }
    anonymousView(opts, ret, fn) {
      defineView(opts, true, {}, ret, fn);
    }
  };
  function schema(...args) {
    const handles = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    const tableDefs = handles.map((h) => h.tableDef);
    MODULE_DEF.tables.push(...tableDefs);
    return new Schema(tableDefs, MODULE_DEF.typespace, handles);
  }
  function convertToAccessorMap(arr) {
    return Object.fromEntries(
      arr.map((v) => [v.accessorName, v])
    );
  }
  function table(opts, row) {
    const {
      name,
      public: isPublic = false,
      indexes: userIndexes = [],
      scheduled
    } = opts;
    const colIds = /* @__PURE__ */ new Map();
    const colNameList = [];
    if (!(row instanceof RowBuilder)) {
      row = new RowBuilder(row);
    }
    if (row.typeName === void 0) {
      row.typeName = toPascalCase(name);
    }
    const rowTypeRef = registerTypesRecursively(row);
    row.algebraicType.value.elements.forEach((elem, i) => {
      colIds.set(elem.name, i);
      colNameList.push(elem.name);
    });
    const pk = [];
    const indexes = [];
    const constraints = [];
    const sequences = [];
    let scheduleAtCol;
    for (const [name2, builder] of Object.entries(row.row)) {
      const meta = builder.columnMetadata;
      if (meta.isPrimaryKey) {
        pk.push(colIds.get(name2));
      }
      const isUnique = meta.isUnique || meta.isPrimaryKey;
      if (meta.indexType || isUnique) {
        const algo = meta.indexType ?? "btree";
        const id = colIds.get(name2);
        let algorithm;
        switch (algo) {
          case "btree":
            algorithm = raw_index_algorithm_type_default.BTree([id]);
            break;
          case "direct":
            algorithm = raw_index_algorithm_type_default.Direct(id);
            break;
        }
        indexes.push({
          name: void 0,
          // Unnamed indexes will be assigned a globally unique name
          accessorName: name2,
          // The name of this column will be used as the accessor name
          algorithm
        });
      }
      if (isUnique) {
        constraints.push({
          name: void 0,
          data: { tag: "Unique", value: { columns: [colIds.get(name2)] } }
        });
      }
      if (meta.isAutoIncrement) {
        sequences.push({
          name: void 0,
          start: void 0,
          minValue: void 0,
          maxValue: void 0,
          column: colIds.get(name2),
          increment: 1n
        });
      }
      if (meta.isScheduleAt) {
        scheduleAtCol = colIds.get(name2);
      }
    }
    for (const indexOpts of userIndexes ?? []) {
      let algorithm;
      switch (indexOpts.algorithm) {
        case "btree":
          algorithm = {
            tag: "BTree",
            value: indexOpts.columns.map((c) => colIds.get(c))
          };
          break;
        case "direct":
          algorithm = { tag: "Direct", value: colIds.get(indexOpts.column) };
          break;
      }
      indexes.push({ name: void 0, accessorName: indexOpts.name, algorithm });
    }
    for (const constraintOpts of opts.constraints ?? []) {
      if (constraintOpts.constraint === "unique") {
        const data = {
          tag: "Unique",
          value: { columns: constraintOpts.columns.map((c) => colIds.get(c)) }
        };
        constraints.push({ name: constraintOpts.name, data });
        continue;
      }
    }
    for (const index of indexes) {
      const cols = index.algorithm.tag === "Direct" ? [index.algorithm.value] : index.algorithm.value;
      const colS = cols.map((i) => colNameList[i]).join("_");
      index.name = `${name}_${colS}_idx_${index.algorithm.tag.toLowerCase()}`;
    }
    const tableDef = {
      name,
      productTypeRef: rowTypeRef.ref,
      primaryKey: pk,
      indexes,
      constraints,
      sequences,
      schedule: scheduled && scheduleAtCol !== void 0 ? {
        name: void 0,
        reducerName: scheduled,
        scheduledAtColumn: scheduleAtCol
      } : void 0,
      tableType: { tag: "User" },
      tableAccess: { tag: isPublic ? "Public" : "Private" }
    };
    const productType = {
      elements: row.algebraicType.value.elements.map((elem) => {
        return { name: elem.name, algebraicType: elem.algebraicType };
      })
    };
    return {
      rowType: row,
      tableName: name,
      rowSpacetimeType: productType,
      tableDef,
      idxs: indexes,
      constraints
    };
  }

  // generated/create_player_reducer.ts
  var create_player_reducer_default = {
    id: t.u32(),
    name: t.string()
  };

  // generated/delete_player_reducer.ts
  var delete_player_reducer_default = {
    id: t.u32()
  };

  // generated/on_connect_reducer.ts
  var on_connect_reducer_default = {};

  // generated/on_disconnect_reducer.ts
  var on_disconnect_reducer_default = {};

  // generated/update_player_reducer.ts
  var update_player_reducer_default = {
    id: t.u32(),
    name: t.string()
  };

  // generated/test_player_table.ts
  var test_player_table_default = t.row({
    id: t.u32().primaryKey(),
    name: t.string()
  });

  // generated/test_player_type.ts
  var test_player_type_default = t.object("TestPlayer", {
    id: t.u32(),
    name: t.string()
  });

  // generated/index.ts
  var tablesSchema = schema(
    table({
      name: "test_player",
      indexes: [
        { name: "id", algorithm: "btree", columns: [
          "id"
        ] }
      ],
      constraints: [
        { name: "test_player_id_key", constraint: "unique", columns: ["id"] }
      ]
    }, test_player_table_default)
  );
  var reducersSchema = reducers(
    reducerSchema("create_player", create_player_reducer_default),
    reducerSchema("delete_player", delete_player_reducer_default),
    reducerSchema("on_connect", on_connect_reducer_default),
    reducerSchema("on_disconnect", on_disconnect_reducer_default),
    reducerSchema("update_player", update_player_reducer_default)
  );
  var REMOTE_MODULE = {
    versionInfo: {
      cliVersion: "1.9.0"
    },
    tables: tablesSchema.schemaType.tables,
    reducers: reducersSchema.reducersType.reducers
  };
  var tables = convertToAccessorMap(tablesSchema.schemaType.tables);
  var reducers2 = convertToAccessorMap(reducersSchema.reducersType.reducers);
  var SubscriptionBuilder = class extends SubscriptionBuilderImpl {
  };
  var DbConnectionBuilder2 = class extends DbConnectionBuilder {
  };
  var _DbConnection = class _DbConnection extends DbConnectionImpl {
    constructor() {
      super(...arguments);
      this.subscriptionBuilder = () => {
        return new SubscriptionBuilder(this);
      };
    }
  };
  _DbConnection.builder = () => {
    return new DbConnectionBuilder2(REMOTE_MODULE, (config) => new _DbConnection(config));
  };
  var DbConnection = _DbConnection;

  // node_modules/brotli-dec-wasm/pkg/brotli_dec_wasm.js
  var brotli_dec_wasm_exports = {};
  __export(brotli_dec_wasm_exports, {
    BrotliDecStream: () => BrotliDecStream,
    BrotliDecStreamErrCode: () => BrotliDecStreamErrCode,
    BrotliStreamResult: () => BrotliStreamResult,
    BrotliStreamResultCode: () => BrotliStreamResultCode,
    DecompressStream: () => DecompressStream,
    brotli_dec: () => brotli_dec,
    decompress: () => decompress2,
    default: () => brotli_dec_wasm_default,
    initSync: () => initSync
  });
  var import_meta = {};
  var wasm;
  var cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: () => {
    throw Error("TextDecoder not available");
  } };
  if (typeof TextDecoder !== "undefined") {
    cachedTextDecoder.decode();
  }
  var cachedUint8Memory0 = null;
  function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
      cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
  }
  function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
  }
  var heap = new Array(128).fill(void 0);
  heap.push(void 0, null, true, false);
  var heap_next = heap.length;
  function addHeapObject(obj) {
    if (heap_next === heap.length)
      heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
  }
  function getObject(idx) {
    return heap[idx];
  }
  function dropObject(idx) {
    if (idx < 132)
      return;
    heap[idx] = heap_next;
    heap_next = idx;
  }
  function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
  }
  var WASM_VECTOR_LEN = 0;
  function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
  }
  var cachedInt32Memory0 = null;
  function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
      cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
  }
  function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
  }
  function brotli_dec(input) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.brotli_dec(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v2 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1, 1);
      return v2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  function decompress2(buf) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(buf, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.brotli_dec(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v2 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1, 1);
      return v2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  var cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: () => {
    throw Error("TextEncoder not available");
  } };
  var encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  } : function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
  function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === void 0) {
      const buf = cachedTextEncoder.encode(arg);
      const ptr2 = malloc(buf.length, 1) >>> 0;
      getUint8Memory0().subarray(ptr2, ptr2 + buf.length).set(buf);
      WASM_VECTOR_LEN = buf.length;
      return ptr2;
    }
    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;
    const mem = getUint8Memory0();
    let offset = 0;
    for (; offset < len; offset++) {
      const code = arg.charCodeAt(offset);
      if (code > 127)
        break;
      mem[ptr + offset] = code;
    }
    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }
      ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
      const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);
      offset += ret.written;
      ptr = realloc(ptr, len, offset, 1) >>> 0;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
  }
  var BrotliStreamResultCode = Object.freeze({ ResultSuccess: 1, "1": "ResultSuccess", NeedsMoreInput: 2, "2": "NeedsMoreInput", NeedsMoreOutput: 3, "3": "NeedsMoreOutput" });
  var BrotliDecStreamErrCode = Object.freeze({ BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE: 1, "1": "BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE", BROTLI_DECODER_ERROR_FORMAT_RESERVED: 2, "2": "BROTLI_DECODER_ERROR_FORMAT_RESERVED", BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE: 3, "3": "BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE", BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET: 4, "4": "BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET", BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME: 5, "5": "BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME", BROTLI_DECODER_ERROR_FORMAT_CL_SPACE: 6, "6": "BROTLI_DECODER_ERROR_FORMAT_CL_SPACE", BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE: 7, "7": "BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE", BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT: 8, "8": "BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT", BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1: 9, "9": "BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1", BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2: 10, "10": "BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2", BROTLI_DECODER_ERROR_FORMAT_TRANSFORM: 11, "11": "BROTLI_DECODER_ERROR_FORMAT_TRANSFORM", BROTLI_DECODER_ERROR_FORMAT_DICTIONARY: 12, "12": "BROTLI_DECODER_ERROR_FORMAT_DICTIONARY", BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS: 13, "13": "BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS", BROTLI_DECODER_ERROR_FORMAT_PADDING_1: 14, "14": "BROTLI_DECODER_ERROR_FORMAT_PADDING_1", BROTLI_DECODER_ERROR_FORMAT_PADDING_2: 15, "15": "BROTLI_DECODER_ERROR_FORMAT_PADDING_2", BROTLI_DECODER_ERROR_FORMAT_DISTANCE: 16, "16": "BROTLI_DECODER_ERROR_FORMAT_DISTANCE", BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET: 19, "19": "BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET", BROTLI_DECODER_ERROR_INVALID_ARGUMENTS: 20, "20": "BROTLI_DECODER_ERROR_INVALID_ARGUMENTS", BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES: 21, "21": "BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES", BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS: 22, "22": "BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS", BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP: 25, "25": "BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP", BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1: 26, "26": "BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1", BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2: 27, "27": "BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2", BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES: 30, "30": "BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES", BROTLI_DECODER_ERROR_UNREACHABLE: 31, "31": "BROTLI_DECODER_ERROR_UNREACHABLE" });
  var BrotliDecStreamFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
  }, unregister: () => {
  } } : new FinalizationRegistry((ptr) => wasm.__wbg_brotlidecstream_free(ptr >>> 0));
  var BrotliDecStream = class {
    __destroy_into_raw() {
      const ptr = this.__wbg_ptr;
      this.__wbg_ptr = 0;
      BrotliDecStreamFinalization.unregister(this);
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_brotlidecstream_free(ptr);
    }
    /**
    */
    constructor() {
      const ret = wasm.brotlidecstream_new();
      this.__wbg_ptr = ret >>> 0;
      return this;
    }
    /**
    * @param {Uint8Array} input
    * @param {number} output_size
    * @returns {BrotliStreamResult}
    */
    dec(input, output_size) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.brotlidecstream_dec(retptr, this.__wbg_ptr, ptr0, len0, output_size);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
          throw takeObject(r1);
        }
        return BrotliStreamResult.__wrap(r0);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * See [`Self::dec()`].
    *
    * For drop-in replacement of `brotli-wasm`.
    * @param {Uint8Array} input
    * @param {number} output_size
    * @returns {BrotliStreamResult}
    */
    decompress(input, output_size) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.brotlidecstream_dec(retptr, this.__wbg_ptr, ptr0, len0, output_size);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
          throw takeObject(r1);
        }
        return BrotliStreamResult.__wrap(r0);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * @returns {number}
    */
    total_out() {
      const ret = wasm.brotlidecstream_total_out(this.__wbg_ptr);
      return ret >>> 0;
    }
  };
  var BrotliStreamResultFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
  }, unregister: () => {
  } } : new FinalizationRegistry((ptr) => wasm.__wbg_brotlistreamresult_free(ptr >>> 0));
  var BrotliStreamResult = class _BrotliStreamResult {
    static __wrap(ptr) {
      ptr = ptr >>> 0;
      const obj = Object.create(_BrotliStreamResult.prototype);
      obj.__wbg_ptr = ptr;
      BrotliStreamResultFinalization.register(obj, obj.__wbg_ptr, obj);
      return obj;
    }
    __destroy_into_raw() {
      const ptr = this.__wbg_ptr;
      this.__wbg_ptr = 0;
      BrotliStreamResultFinalization.unregister(this);
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_brotlistreamresult_free(ptr);
    }
    /**
    * Result code.
    *
    * See [`BrotliStreamResultCode`] for available values.
    *
    * When error, the error code is not passed here but rather goes to `Err`.
    * @returns {BrotliStreamResultCode}
    */
    get code() {
      const ret = wasm.__wbg_get_brotlistreamresult_code(this.__wbg_ptr);
      return ret;
    }
    /**
    * Result code.
    *
    * See [`BrotliStreamResultCode`] for available values.
    *
    * When error, the error code is not passed here but rather goes to `Err`.
    * @param {BrotliStreamResultCode} arg0
    */
    set code(arg0) {
      wasm.__wbg_set_brotlistreamresult_code(this.__wbg_ptr, arg0);
    }
    /**
    * Output buffer
    * @returns {Uint8Array}
    */
    get buf() {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.__wbg_get_brotlistreamresult_buf(retptr, this.__wbg_ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
        return v1;
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Output buffer
    * @param {Uint8Array} arg0
    */
    set buf(arg0) {
      const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.__wbg_set_brotlistreamresult_buf(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * Consumed bytes of the input buffer
    * @returns {number}
    */
    get input_offset() {
      const ret = wasm.__wbg_get_brotlistreamresult_input_offset(this.__wbg_ptr);
      return ret >>> 0;
    }
    /**
    * Consumed bytes of the input buffer
    * @param {number} arg0
    */
    set input_offset(arg0) {
      wasm.__wbg_set_brotlistreamresult_input_offset(this.__wbg_ptr, arg0);
    }
  };
  var DecompressStreamFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
  }, unregister: () => {
  } } : new FinalizationRegistry((ptr) => wasm.__wbg_decompressstream_free(ptr >>> 0));
  var DecompressStream = class {
    __destroy_into_raw() {
      const ptr = this.__wbg_ptr;
      this.__wbg_ptr = 0;
      DecompressStreamFinalization.unregister(this);
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_decompressstream_free(ptr);
    }
    /**
    */
    constructor() {
      const ret = wasm.decompressstream_new();
      this.__wbg_ptr = ret >>> 0;
      return this;
    }
    /**
    * @param {Uint8Array} input
    * @param {number} output_size
    * @returns {BrotliStreamResult}
    */
    decompress(input, output_size) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.brotlidecstream_dec(retptr, this.__wbg_ptr, ptr0, len0, output_size);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
          throw takeObject(r1);
        }
        return BrotliStreamResult.__wrap(r0);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * @returns {number}
    */
    total_out() {
      const ret = wasm.decompressstream_total_out(this.__wbg_ptr);
      return ret >>> 0;
    }
  };
  async function __wbg_load(module, imports) {
    if (typeof Response === "function" && module instanceof Response) {
      if (typeof WebAssembly.instantiateStreaming === "function") {
        try {
          return await WebAssembly.instantiateStreaming(module, imports);
        } catch (e) {
          if (module.headers.get("Content-Type") != "application/wasm") {
            console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
          } else {
            throw e;
          }
        }
      }
      const bytes = await module.arrayBuffer();
      return await WebAssembly.instantiate(bytes, imports);
    } else {
      const instance = await WebAssembly.instantiate(module, imports);
      if (instance instanceof WebAssembly.Instance) {
        return { instance, module };
      } else {
        return instance;
      }
    }
  }
  function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
      const ret = new Error(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
      takeObject(arg0);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
      const ret = new Error();
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
      const ret = getObject(arg1).stack;
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
      }
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    };
    return imports;
  }
  function __wbg_init_memory(imports, maybe_memory) {
  }
  function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedInt32Memory0 = null;
    cachedUint8Memory0 = null;
    return wasm;
  }
  function initSync(module) {
    if (wasm !== void 0)
      return wasm;
    const imports = __wbg_get_imports();
    __wbg_init_memory(imports);
    if (!(module instanceof WebAssembly.Module)) {
      module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
  }
  async function __wbg_init(input) {
    if (wasm !== void 0)
      return wasm;
    if (typeof input === "undefined") {
      input = new URL("brotli_dec_wasm_bg.wasm", import_meta.url);
    }
    const imports = __wbg_get_imports();
    if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
      input = fetch(input);
    }
    __wbg_init_memory(imports);
    const { instance, module } = await __wbg_load(await input, imports);
    return __wbg_finalize_init(instance, module);
  }
  var brotli_dec_wasm_default = __wbg_init;

  // bridge-entry.js
  var SpacetimeDBBridge = class {
    constructor() {
      this.connections = /* @__PURE__ */ new Map();
      this.callbacks = /* @__PURE__ */ new Map();
      this.nextConnectionId = 1;
      this.nextCallbackId = 1;
      this.brotli = null;
      fetch("brotli_dec_wasm_bg.wasm").then((response) => response.arrayBuffer()).then((bytes) => brotli_dec_wasm_default(bytes)).then(() => {
        this.brotli = brotli_dec_wasm_exports;
        console.log("\u2713 Brotli WASM initialized");
      }).catch((err) => {
        console.error("\u274C Failed to initialize Brotli WASM:", err);
      });
      console.log("\u2713 SpacetimeDB Bridge initialized (using real SDK)");
    }
    // Convert snake_case to camelCase for SDK table names
    toCamelCase(str) {
      return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    createConnection(uri, moduleName, authToken) {
      const connectionId = this.nextConnectionId++;
      console.log(`Creating connection ${connectionId} to ${uri}/${moduleName}`);
      const connectionState = {
        connected: false,
        connectionPromise: null
        // Will be set below
      };
      let builder = DbConnection.builder().withUri(uri).withModuleName(moduleName).withCompression("gzip").onConnect((conn, identity, token) => {
        console.log(`\u2713 Connected ${connectionId}, identity:`, identity.toHexString());
        connectionState.connected = true;
        connectionState.sdk = conn;
        if (connectionState.resolveConnection) {
          connectionState.resolveConnection({ identity: identity.toHexString(), token });
        }
      }).onConnectError((conn, error) => {
        console.error(`\u274C Connection ${connectionId} failed:`, error);
        if (connectionState.rejectConnection) {
          connectionState.rejectConnection(error);
        }
      });
      if (authToken) {
        builder = builder.withToken(authToken);
      }
      console.log("Builder created with real generated bindings");
      const originalWebSocket = window.WebSocket;
      let interceptedWs = null;
      window.WebSocket = function(url, protocols) {
        const ws = new originalWebSocket(url, protocols);
        if (url.includes("localhost:3000") || url.includes(uri)) {
          console.log(`\u2713 Intercepting WebSocket to ${url}`);
          interceptedWs = ws;
          ws.addEventListener("message", function(event) {
            if (event?.data instanceof ArrayBuffer) {
              const view = new Uint8Array(event.data);
              console.log(`\u{1F4E9} WS RECV: ${view.length} bytes, compression: ${view[0]}`);
              if (view.length <= 200) {
                const hex = Array.from(view).map((b) => b.toString(16).padStart(2, "0")).join(" ");
                console.log(`  Hex: ${hex}`);
              }
            }
          }, { capture: true });
          ws.addEventListener("close", function(event) {
            console.log(`\u{1F534} WS CLOSED: code=${event.code}, reason="${event.reason}", wasClean=${event.wasClean}`);
            console.trace("WebSocket close stack trace");
          });
          ws.addEventListener("error", function(event) {
            console.error(`\u274C WS ERROR:`, event);
          });
          const originalSend = ws.send.bind(ws);
          ws.send = function(data) {
            let bytes;
            if (data instanceof ArrayBuffer) {
              bytes = new Uint8Array(data);
              console.log(`\u{1F4E4} WS SEND: ArrayBuffer ${bytes.length} bytes, compression: ${bytes[0]}`);
            } else if (data instanceof Uint8Array) {
              bytes = data;
              console.log(`\u{1F4E4} WS SEND: Uint8Array ${bytes.length} bytes, compression: ${bytes[0]}`);
            } else if (typeof data === "string") {
              console.log(`\u{1F4E4} WS SEND: String ${data.length} bytes: ${data.substring(0, 100)}`);
            } else {
              console.log(`\u{1F4E4} WS SEND: ${data?.constructor?.name || typeof data} (${data?.length || data?.byteLength || 0} bytes)`);
            }
            if (bytes && bytes.length > 0) {
              const hex = Array.from(bytes.slice(0, Math.min(50, bytes.length))).map((b) => b.toString(16).padStart(2, "0")).join(" ");
              console.log(`  Hex: ${hex}${bytes.length > 50 ? "..." : ""}`);
            }
            console.log(`  WS readyState: ${ws.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);
            return originalSend(data);
          };
          console.log(`\u2713 WebSocket logging installed`);
        }
        return ws;
      };
      const sdk = builder.build();
      connectionState.sdk = sdk;
      sdk.wsPromise.then(() => {
        console.log(`\u2713 WebSocket established for connection ${connectionId}`);
        window.WebSocket = originalWebSocket;
      }).catch((err) => console.error(`\u274C WebSocket promise failed:`, err));
      connectionState.connectionPromise = new Promise((resolve, reject) => {
        connectionState.resolveConnection = resolve;
        connectionState.rejectConnection = reject;
      });
      this.connections.set(connectionId, connectionState);
      console.log(`\u2713 Created connection ${connectionId}`);
      return connectionId;
    }
    async connect(connectionId) {
      const conn = this.connections.get(connectionId);
      if (!conn)
        throw new Error(`Connection ${connectionId} not found`);
      console.log(`Waiting for connection ${connectionId} to complete...`);
      return conn.connectionPromise;
    }
    async disconnect(connectionId) {
      const conn = this.connections.get(connectionId);
      if (!conn)
        throw new Error(`Connection ${connectionId} not found`);
      console.log(`Disconnecting connection ${connectionId}...`);
      await conn.sdk.disconnect();
      console.log(`\u2713 Disconnected ${connectionId}`);
    }
    // FIX #3: Fail fast instead of silently ignoring invalid IDs
    onConnect(connectionId, callbackId) {
      const conn = this.connections.get(connectionId);
      if (!conn)
        throw new Error(`Connection ${connectionId} not found`);
      const callback = this.callbacks.get(callbackId);
      if (!callback)
        throw new Error(`Callback ${callbackId} not found`);
      conn.sdk.on("connect", callback);
    }
    onDisconnect(connectionId, callbackId) {
      const conn = this.connections.get(connectionId);
      if (!conn)
        throw new Error(`Connection ${connectionId} not found`);
      const callback = this.callbacks.get(callbackId);
      if (!callback)
        throw new Error(`Callback ${callbackId} not found`);
      conn.sdk.on("disconnect", callback);
    }
    onConnectionError(connectionId, callbackId) {
      const conn = this.connections.get(connectionId);
      if (!conn)
        throw new Error(`Connection ${connectionId} not found`);
      const callback = this.callbacks.get(callbackId);
      if (!callback)
        throw new Error(`Callback ${callbackId} not found`);
      conn.sdk.on("connectError", callback);
    }
    async callReducer(connectionId, reducerName, args) {
      const conn = this.connections.get(connectionId);
      if (!conn)
        throw new Error(`Connection ${connectionId} not found`);
      console.log(`\u{1F4E4} Calling reducer ${reducerName} on connection ${connectionId} with args:`, args);
      try {
        const argsArray = Array.from(args);
        console.log(`  - Converted args:`, argsArray);
        const reducerNameCamel = this.toCamelCase(reducerName);
        console.log(`  - Looking for reducer: ${reducerNameCamel}`);
        let paramsObject;
        if (reducerName === "create_player") {
          paramsObject = { id: argsArray[0], name: argsArray[1] };
        } else if (reducerName === "update_player") {
          paramsObject = { id: argsArray[0], name: argsArray[1] };
        } else if (reducerName === "delete_player") {
          paramsObject = { id: argsArray[0] };
        } else {
          paramsObject = argsArray;
        }
        console.log(`  - Converted args to params object:`, paramsObject);
        const reducerFn = conn.sdk.reducers[reducerNameCamel];
        if (!reducerFn) {
          console.error(`  - Available reducers:`, Object.keys(conn.sdk.reducers));
          throw new Error(`Reducer ${reducerNameCamel} not found in generated reducers`);
        }
        reducerFn(paramsObject);
        console.log(`\u2713 Reducer ${reducerName} called successfully`);
      } catch (error) {
        console.error(`\u274C Failed to call reducer ${reducerName}:`, error);
        throw error;
      }
    }
    async subscribe(connectionId, query) {
      const conn = this.connections.get(connectionId);
      if (!conn)
        throw new Error(`Connection ${connectionId} not found`);
      console.log(`\u{1F4CB} Subscribing to query on connection ${connectionId}: ${query}`);
      try {
        const handle = await conn.sdk.subscribe([query]);
        console.log(`\u2713 Subscribed to query: ${query}`);
        return handle;
      } catch (error) {
        console.error(`\u274C Failed to subscribe:`, error);
        throw error;
      }
    }
    subscribeTable(connectionId, tableName, onInsertId, onUpdateId, onDeleteId) {
      const conn = this.connections.get(connectionId);
      if (!conn) {
        throw new Error(`Connection ${connectionId} not found`);
      }
      console.log(`\u{1F4CB} Subscribing to table: ${tableName}`);
      const getValidatedCallback = (id, name) => {
        if (!id)
          return null;
        const cb = this.callbacks.get(id);
        if (!cb)
          throw new Error(`Callback ${name} (ID: ${id}) not found`);
        return cb;
      };
      const callbacks = {
        onInsert: getValidatedCallback(onInsertId, "onInsert"),
        onUpdate: getValidatedCallback(onUpdateId, "onUpdate"),
        onDelete: getValidatedCallback(onDeleteId, "onDelete")
      };
      const tableNameCamel = this.toCamelCase(tableName);
      const table2 = conn.sdk.db[tableNameCamel];
      if (!table2) {
        const available = Object.keys(conn.sdk.db).join(", ");
        throw new Error(`Table ${tableName} (${tableNameCamel}) not found. Available: ${available}`);
      }
      console.log(`\u2713 Table ${tableName} available, count: ${table2.count()}`);
      if (callbacks.onInsert) {
        console.log(`  Registering onInsert handler for ${tableName}...`);
        table2.onInsert((ctx, row) => {
          console.log(`\u{1F4E5} INSERT EVENT FIRED on ${tableName}:`, row);
          const event = ctx.event || {};
          const payload = JSON.stringify({
            row,
            reducerEvent: event.tag === "Reducer" ? {
              reducerName: event.value?.reducer?.name,
              callerIdentity: event.value?.callerIdentity?.toHexString()
            } : null
          });
          callbacks.onInsert(payload);
        });
        console.log(`  \u2713 onInsert handler registered`);
      }
      if (callbacks.onUpdate) {
        console.log(`  Registering onUpdate handler for ${tableName}...`);
        table2.onUpdate((ctx, oldRow, newRow) => {
          console.log(`\u{1F504} UPDATE EVENT FIRED on ${tableName}:`, { oldRow, newRow });
          const event = ctx.event || {};
          const payload = JSON.stringify({
            oldRow,
            newRow,
            reducerEvent: event.tag === "Reducer" ? {
              reducerName: event.value?.reducer?.name,
              callerIdentity: event.value?.callerIdentity?.toHexString()
            } : null
          });
          callbacks.onUpdate(payload);
        });
        console.log(`  \u2713 onUpdate handler registered`);
      }
      if (callbacks.onDelete) {
        console.log(`  Registering onDelete handler for ${tableName}...`);
        table2.onDelete((ctx, row) => {
          console.log(`\u{1F5D1}\uFE0F DELETE EVENT FIRED on ${tableName}:`, row);
          const event = ctx.event || {};
          const payload = JSON.stringify({
            row,
            reducerEvent: event.tag === "Reducer" ? {
              reducerName: event.value?.reducer?.name,
              callerIdentity: event.value?.callerIdentity?.toHexString()
            } : null
          });
          callbacks.onDelete(payload);
        });
        console.log(`  \u2713 onDelete handler registered`);
      }
      console.log(`\u2713 Event handlers registered for ${tableName}`);
      return new Promise((resolve, reject) => {
        if (!conn.globalSubscription) {
          console.log(`  - Creating global subscription to all tables`);
          conn.globalSubscription = conn.sdk.subscriptionBuilder().onApplied(() => {
            console.log(`\u2713 Global subscription applied`);
            console.log(`\u2713 Table count: ${table2.count()}`);
            resolve();
          }).onError((ctx, error) => {
            console.error(`\u274C Global subscription error:`, error);
            reject(error);
          }).subscribe(["SELECT * FROM *"]);
          console.log(`\u2713 Subscription handle stored`);
        } else {
          console.log(`  - Using existing global subscription`);
          console.log(`\u2713 Table count: ${table2.count()}`);
          resolve();
        }
      });
    }
    registerCallback(callback) {
      const callbackId = this.nextCallbackId++;
      this.callbacks.set(callbackId, callback);
      console.log(`Registered callback ${callbackId}`);
      return callbackId;
    }
    unregisterCallback(callbackId) {
      this.callbacks.delete(callbackId);
      console.log(`Unregistered callback ${callbackId}`);
    }
  };
  if (typeof window !== "undefined") {
    window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();
    console.log("\u2713 Bridge attached to window.__SPACETIMEDB_BRIDGE__");
  } else {
    console.error("\u274C Window not available - bridge requires browser environment");
  }
})();
