<template>
  <form @submit.prevent="onSubmit">
    <label for="upc">DVD UPC:</label>
    <input
      id="upc"
      v-model="upc"
      type="text"
      placeholder="Scan or enter UPC"
      required
      autofocus
      :disabled="loading"
    />
    <button type="submit" :disabled="loading || !upc.trim()">
      {{ loading ? 'Searching...' : 'Search' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const upc = ref('')
const error = ref('')
const emit = defineEmits<{
  search: [barcode: string]
}>()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ loading: boolean }>()

function onSubmit(): void {
  error.value = ''
  if (!upc.value.trim()) {
    error.value = 'UPC is required'
    return
  }

  // Validate barcode format (UPC-12, UPC-8, EAN-13, EAN-8)
  const barcode = upc.value.trim()
  if (!isValidBarcode(barcode)) {
    error.value = 'Invalid barcode format. Must be UPC-12, UPC-8, EAN-13, or EAN-8'
    return
  }

  emit('search', barcode)
}

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
  // Odd positions (1st, 3rd, 5th...) get weight 3, even positions get weight 1
  let sum = 0
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(code[i])
    sum += digit * (i % 2 === 0 ? 3 : 1)
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
</script>

<style scoped>
form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
}
input {
  flex: 1;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
.error {
  color: var(--ev-message-error);
  margin: 0.5rem 0 0 0;
}
</style>
