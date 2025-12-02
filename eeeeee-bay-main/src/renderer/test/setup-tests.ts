if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  const SharedArrayBufferStub = function SharedArrayBuffer(length: number): ArrayBuffer {
    return new ArrayBuffer(length)
  }

  Object.defineProperty(SharedArrayBufferStub, 'prototype', {
    value: ArrayBuffer.prototype,
    writable: false
  })

  const globalObject = globalThis as Record<string, unknown>
  globalObject.SharedArrayBuffer = SharedArrayBufferStub as unknown as SharedArrayBuffer
}
