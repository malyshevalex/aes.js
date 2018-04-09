export const arrconv = (data, cls, copyData = false) =>
  ArrayBuffer.isView(data)
    ? copyData
      ? new cls(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength))
      : new cls(data.buffer, data.byteOffset, data.byteLength)
    : new cls(copyData ? data : data.slice())
