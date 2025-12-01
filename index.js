const EventEmitter = require("events");
module.exports.bus = new EventEmitter();

/**
 * Deep clone an object
 * @param {*} obj - The object to clone
 * @param {WeakMap} hash - Hash table for handling circular references
 * @returns {*} The cloned object
 */
function deepClone(obj, hash = new WeakMap()) {
  // Handle null or undefined
  if (obj === null || obj === undefined) return obj;
  
  // Handle primitive types
  if (typeof obj !== 'object') return obj;
  
  // Handle Date objects
  if (obj instanceof Date) return new Date(obj);
  
  // Handle RegExp objects
  if (obj instanceof RegExp) return new RegExp(obj);
  
  // Handle circular references
  if (hash.has(obj)) return hash.get(obj);
  
  // Handle arrays
  if (Array.isArray(obj)) {
    const cloneArr = [];
    hash.set(obj, cloneArr);
    for (let i = 0; i < obj.length; i++) {
      cloneArr[i] = deepClone(obj[i], hash);
    }
    return cloneArr;
  }
  
  // Handle plain objects
  const cloneObj = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, cloneObj);
  
  // Copy all enumerable properties
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  
  // Copy Symbol properties
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  for (let i = 0; i < symbolKeys.length; i++) {
    cloneObj[symbolKeys[i]] = deepClone(obj[symbolKeys[i]], hash);
  }
  
  return cloneObj;
}

module.exports.deepClone = deepClone;