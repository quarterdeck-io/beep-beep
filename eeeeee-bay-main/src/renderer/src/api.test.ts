import { describe, it, expect } from 'vitest'

// Test barcode validation logic (extracted from UpcInput.vue)
function isValidBarcode(code: string): boolean {
  // Remove any non-digit characters
  const cleanCode = code.replace(/\D/g, '')

  // Check length for different barcode types
  if (cleanCode.length === 12) {
    // UPC-12: validate check digit
    return validateUpcCheckDigit(cleanCode)
  } else if (cleanCode.length === 8) {
    // UPC-8 or EAN-8: validate check digit
    return validateEan8CheckDigit(cleanCode)
  } else if (cleanCode.length === 13) {
    // EAN-13: validate check digit
    return validateEan13CheckDigit(cleanCode)
  }

  return false
}

function validateUpcCheckDigit(code: string): boolean {
  // UPC-12 check digit validation
  let sum = 0
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(code[i])
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(code[11])
}

function validateEan8CheckDigit(code: string): boolean {
  // EAN-8 check digit validation
  let sum = 0
  for (let i = 0; i < 7; i++) {
    const digit = parseInt(code[i])
    sum += digit * (i % 2 === 0 ? 3 : 1)
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(code[7])
}

function validateEan13CheckDigit(code: string): boolean {
  // EAN-13 check digit validation
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i])
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(code[12])
}

describe('Barcode Validation', () => {
  it('should validate UPC-12 correctly', () => {
    // Valid UPC-12: 012345678905
    expect(isValidBarcode('012345678905')).toBe(true)
    // Invalid UPC-12: 012345678906
    expect(isValidBarcode('012345678906')).toBe(false)
  })

  it('should validate EAN-13 correctly', () => {
    // Valid EAN-13: 1234567890128
    expect(isValidBarcode('1234567890128')).toBe(true)
    // Invalid EAN-13: 1234567890129
    expect(isValidBarcode('1234567890129')).toBe(false)
  })

  it('should validate EAN-8 correctly', () => {
    // Valid EAN-8: 12345670
    expect(isValidBarcode('12345670')).toBe(true)
    // Invalid EAN-8: 12345671
    expect(isValidBarcode('12345671')).toBe(false)
  })

  it('should reject invalid lengths', () => {
    expect(isValidBarcode('123')).toBe(false)
    expect(isValidBarcode('123456789')).toBe(false)
    expect(isValidBarcode('123456789012')).toBe(false) // 12 digits but not valid UPC
  })

  it('should handle non-digit characters', () => {
    expect(isValidBarcode('012-345-678-905')).toBe(true)
    expect(isValidBarcode('012 345 678 905')).toBe(true)
  })
})
