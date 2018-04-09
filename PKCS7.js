import { arrconv } from './utils'

export default {
  /**
   * Pad data to block size
   * @param {ArrayBuffer|DataView|TypedArray} data
   * @returns ArrayBuffer
   */
  pad: (data, blockSize = 16) => {
    const padding = blockSize - (data.byteLength % blockSize)
    const ret = new ArrayBuffer(data.byteLength + padding)
    const arr = new Uint8Array(ret)
    arr.set(arrconv(data, Uint8Array))
    for (let i = data.byteLength; i < arr.length; ++i) {
      arr[i] = padding
    }
    return ret
  },

  /**
   * Strip padding
   * @param {ArrayBuffer|DataView|TypedArray} data
   * @returns ArrayBuffer
   */
  strip: (data, blockSize = 16) => {
    if (data.byteLength < blockSize) {
      throw new Error('PKCS#7 invalid length')
    }
    const arr = arrconv(data, Uint8Array)

    const padding = arr[arr.length - 1]
    if (padding > blockSize) {
      throw new Error('PKCS#7 padding byte out of range')
    }

    const length = arr.length - padding
    for (let i = 0; i < padding; ++i) {
      if (arr[length + i] !== padding) {
        throw new Error('PKCS#7 invalid padding byte')
      }
    }
    return arr.slice(0, length).buffer
  }
}

