import { arrconv } from './utils'

export default class CBC {

  /**
   * CBC block cipher mode
   * @param {Object} cipher block cipher instance
   * @param {ArrayBuffer|TypedArray|DataView} iv initialization vector
   * @param {Object} [padding] padding definition (e.g. PKCS7)
   */
  constructor(cipher, iv, padding) {
    if (iv.byteLength !== 16) {
      throw new Error('invalid initialization vector size (must be 16 bytes)')
    }
    Object.defineProperties(this, {
      iv: { value: arrconv(iv, Uint8Array, true) },
      cipher: { value: cipher },
      padding: { value: padding },
    })
  }

  /**
    * Encrypt data
    * @param {ArrayBuffer|TypedArray|DataView} plain-text data
    * @param {Object} [padding] padding object (e.g. PKCS7)
    * @returns {ArrayBuffer} encrypted data
    */
  encrypt(data) {
    const blockSize = this.cipher.BlockSize
    if (!this.padding && (data.byteLength % blockSize) !== 0) {
      throw `invalid plaintext data size (must be multiple of ${blockSize} bytes)`
    }

    const arr = this.padding
      ? new Uint8Array(this.padding.pad(data, blockSize))
      : arrconv(data, Uint8Array, true)

    let x = this.iv

    for (let i = 0; i < arr.length; i += blockSize) {
      const w = arr.subarray(i, i + blockSize)
      for (let j = 0; j < blockSize; ++j) {
        w[j] ^= x[j]
      }
      this.cipher.encrypt(w, true)
      x = w
    }

    return arr.buffer
  }

  /**
    * Decrypt data
    * @param {ArrayBuffer|TypedArray|DataView} encrypted data
    * @param {Object} [padding] padding object (e.g. PKCS7)
    * @returns {ArrayBuffer} decrypted data
    */
  decrypt(data, padding) {
    const blockSize = this.cipher.BlockSize

    if ((data.byteLength % blockSize) !== 0) {
      throw `invalid encrypted data size (must be multiple of ${blockSize} bytes)`
    }
    const orig = arrconv(data, Uint8Array)
    const arr = orig.slice()
  
    let x = this.iv

    for (let i = 0; i < arr.length; i += blockSize) {
      const w = arr.subarray(i, i + blockSize)
      this.cipher.decrypt(w, true)
      for (let j = 0; j < blockSize; ++j) {
        w[j] ^= x[j]
      }
      x = orig.subarray(i, i + blockSize)
    }

    return this.padding ? this.padding.strip(arr, blockSize) : arr.buffer
  }
}
