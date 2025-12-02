<template>
  <div class="settings-page">
    <h2>Settings</h2>
    <p>Configure your eBay business policies and listing settings before creating listings.</p>

    <!-- SKU Configuration Section -->
    <div class="settings-section">
      <h3>SKU Configuration</h3>
      <p>
        Set the initial SKU number for your listings. This will be used as the starting point and
        incremented for each new listing.
      </p>
      <div class="sku-field">
        <label for="initialSku">Initial SKU Number:</label>
        <div v-if="currentSkuValue !== null" class="current-value">
          <small class="current-label"
            >Current SKU: <strong>{{ currentSkuValue }}</strong></small
          >
        </div>
        <div class="sku-input-group">
          <input
            id="initialSku"
            v-model="initialSkuInput"
            type="number"
            placeholder="Enter initial SKU"
            :disabled="savingSku"
          />
          <button
            :disabled="!initialSkuInput || savingSku"
            class="save-sku-btn"
            @click="saveSkuConfig"
          >
            {{ savingSku ? 'Saving...' : 'Save SKU' }}
          </button>
        </div>
        <small v-if="skuConfigured" class="success-message">✓ SKU configured successfully</small>
      </div>
    </div>

    <!-- eBay Policies Section -->
    <div class="settings-section">
      <h3>eBay Business Policies</h3>
      <p>
        Configure your eBay business policies. These policies define payment, return, and shipping
        terms for your listings.
      </p>

      <div v-if="loading" class="loading">Loading your eBay policies...</div>

      <div v-else-if="needsProgramOptIn" class="program-opt-in">
        <h4>Business Policies Program Required</h4>
        <p>
          To create and manage business policies on eBay, you need to opt into their Selling Policy
          Management program. This program allows sellers to create custom payment, return, and
          fulfillment policies.
        </p>
        <div class="opt-in-actions">
          <button
            :disabled="optingIntoProgram"
            class="opt-in-button"
            @click="optInToProgramHandler"
          >
            {{ optingIntoProgram ? 'Opting In...' : 'Opt Into Business Policies Program' }}
          </button>
        </div>
      </div>

      <div v-else class="policy-form">
        <div class="policy-field">
          <label for="paymentPolicy">Payment Policy:</label>
          <select
            id="paymentPolicy"
            v-model="selectedPolicies.paymentPolicyId"
            :disabled="saving"
            class="policy-select"
          >
            <option value="">Select a Payment Policy</option>
            <option
              v-for="policy in paymentPolicies"
              :key="policy.paymentPolicyId"
              :value="policy.paymentPolicyId"
            >
              {{ policy.name }}
            </option>
          </select>
          <small v-if="selectedPolicies.paymentPolicyId">
            Policy ID: {{ selectedPolicies.paymentPolicyId }}
          </small>
        </div>

        <div class="policy-field">
          <label for="returnPolicy">Return Policy:</label>
          <select
            id="returnPolicy"
            v-model="selectedPolicies.returnPolicyId"
            :disabled="saving"
            class="policy-select"
          >
            <option value="">Select a Return Policy</option>
            <option
              v-for="policy in returnPolicies"
              :key="policy.returnPolicyId"
              :value="policy.returnPolicyId"
            >
              {{ policy.name }}
            </option>
          </select>
          <small v-if="selectedPolicies.returnPolicyId">
            Policy ID: {{ selectedPolicies.returnPolicyId }}
          </small>
        </div>

        <div class="policy-field">
          <label for="fulfillmentPolicy">Fulfillment Policy:</label>
          <select
            id="fulfillmentPolicy"
            v-model="selectedPolicies.fulfillmentPolicyId"
            :disabled="saving"
            class="policy-select"
          >
            <option value="">Select a Fulfillment Policy</option>
            <option
              v-for="policy in fulfillmentPolicies"
              :key="policy.fulfillmentPolicyId"
              :value="policy.fulfillmentPolicyId"
            >
              {{ policy.name }}
            </option>
          </select>
          <small v-if="selectedPolicies.fulfillmentPolicyId">
            Policy ID: {{ selectedPolicies.fulfillmentPolicyId }}
          </small>
        </div>
      </div>
    </div>

    <div class="settings-actions">
      <button
        :disabled="saving || loading || !isPolicyValid"
        class="save-button"
        @click="savePolicies"
      >
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
      <button class="skip-button" @click="skipSetup">
        {{ isInitialSetup ? 'Skip for Now' : 'Cancel' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  setEbayPolicies,
  getEbayPolicies,
  getPaymentPolicies,
  getReturnPolicies,
  getFulfillmentPolicies,
  optInToProgram,
  getInitialSku,
  setInitialSku
} from '../api'

interface Props {
  onComplete: () => void
  onSkip: () => void
  isInitialSetup?: boolean
  initialSkuConfigured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isInitialSetup: true,
  initialSkuConfigured: false
})

const selectedPolicies = ref({
  paymentPolicyId: '',
  returnPolicyId: '',
  fulfillmentPolicyId: ''
})

const paymentPolicies = ref<Array<{ paymentPolicyId: string; name: string }>>([])
const returnPolicies = ref<Array<{ returnPolicyId: string; name: string }>>([])
const fulfillmentPolicies = ref<Array<{ fulfillmentPolicyId: string; name: string }>>([])

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const needsProgramOptIn = ref(false)
const optingIntoProgram = ref(false)

// SKU Configuration
const initialSkuInput = ref('')
const savingSku = ref(false)
const skuConfigured = ref(props.initialSkuConfigured)
const currentSkuValue = ref<number | null>(null)

// Current policy values
const currentPolicies = ref<{
  paymentPolicyId?: string
  returnPolicyId?: string
  fulfillmentPolicyId?: string
} | null>(null)

const isPolicyValid = computed(() => {
  return (
    selectedPolicies.value.paymentPolicyId.trim() &&
    selectedPolicies.value.returnPolicyId.trim() &&
    selectedPolicies.value.fulfillmentPolicyId.trim()
  )
})

async function loadPolicies(): Promise<void> {
  loading.value = true
  error.value = ''
  needsProgramOptIn.value = false

  try {
    // Load current SKU configuration
    const skuResult = await getInitialSku()
    skuConfigured.value = skuResult.success && skuResult.data !== undefined
    if (skuResult.success && skuResult.data !== undefined) {
      currentSkuValue.value = skuResult.data
    }

    // Load current eBay policies
    const currentPoliciesResult = await getEbayPolicies()
    if (currentPoliciesResult.success && currentPoliciesResult.data) {
      currentPolicies.value = currentPoliciesResult.data as {
        paymentPolicyId?: string
        returnPolicyId?: string
        fulfillmentPolicyId?: string
      }
      // Set the current policies in the form
      selectedPolicies.value = {
        paymentPolicyId: currentPolicies.value.paymentPolicyId || '',
        returnPolicyId: currentPolicies.value.returnPolicyId || '',
        fulfillmentPolicyId: currentPolicies.value.fulfillmentPolicyId || ''
      }
    }

    // Authentication is already verified by parent component, proceed with loading policies
    const [paymentResult, returnResult, fulfillmentResult] = await Promise.all([
      getPaymentPolicies(),
      getReturnPolicies(),
      getFulfillmentPolicies()
    ])

    // Check if any of the policy calls failed due to not being opted into business policies
    const businessPolicyError = 'User is not eligible for Business Policy'
    const hasBusinessPolicyError =
      paymentResult.error?.includes(businessPolicyError) ||
      returnResult.error?.includes(businessPolicyError) ||
      fulfillmentResult.error?.includes(businessPolicyError)

    if (hasBusinessPolicyError) {
      needsProgramOptIn.value = true
      error.value =
        "You need to opt into eBay's business policies program before you can access policies."
      return
    }

    if (paymentResult.success && paymentResult.data) {
      paymentPolicies.value = paymentResult.data as Array<{ paymentPolicyId: string; name: string }>
    } else {
      error.value = paymentResult.error || 'Failed to load payment policies'
    }

    if (returnResult.success && returnResult.data) {
      returnPolicies.value = returnResult.data as Array<{ returnPolicyId: string; name: string }>
    } else {
      error.value = returnResult.error || 'Failed to load return policies'
    }

    if (fulfillmentResult.success && fulfillmentResult.data) {
      fulfillmentPolicies.value = fulfillmentResult.data as Array<{
        fulfillmentPolicyId: string
        name: string
      }>
    } else {
      error.value = fulfillmentResult.error || 'Failed to load fulfillment policies'
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Unknown error occurred while loading policies'
  } finally {
    loading.value = false
  }
}

async function saveSkuConfig(): Promise<void> {
  const initialSku = parseInt(initialSkuInput.value, 10)
  if (isNaN(initialSku)) {
    error.value = 'Please enter a valid SKU number'
    return
  }

  savingSku.value = true
  error.value = ''

  try {
    const result = await setInitialSku(initialSku)
    if (result.success) {
      skuConfigured.value = true
      currentSkuValue.value = initialSku
      initialSkuInput.value = ''
      error.value = ''
    } else {
      error.value = result.error || 'Failed to save SKU configuration'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred while saving SKU'
  } finally {
    savingSku.value = false
  }
}

async function savePolicies(): Promise<void> {
  if (!isPolicyValid.value) return

  saving.value = true
  error.value = ''

  try {
    const result = await setEbayPolicies({
      paymentPolicyId: selectedPolicies.value.paymentPolicyId.trim(),
      returnPolicyId: selectedPolicies.value.returnPolicyId.trim(),
      fulfillmentPolicyId: selectedPolicies.value.fulfillmentPolicyId.trim()
    })

    if (result.success) {
      props.onComplete()
    } else {
      error.value = result.error || 'Failed to save policies'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
  } finally {
    saving.value = false
  }
}

function skipSetup(): void {
  props.onSkip()
}

async function optInToProgramHandler(): Promise<void> {
  optingIntoProgram.value = true
  error.value = ''

  try {
    const result = await optInToProgram('SELLING_POLICY_MANAGEMENT')
    if (result.success) {
      // Successfully opted in, reload policies
      await loadPolicies()
    } else {
      error.value = result.error || 'Failed to opt into business policies program'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred during opt-in'
  } finally {
    optingIntoProgram.value = false
  }
}

onMounted(() => {
  loadPolicies()
})
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--ev-card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--ev-card-shadow);
  border: 1px solid var(--ev-card-border);
}

.settings-page h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.settings-page p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
  text-align: center;
}

.settings-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid var(--ev-section-border);
  border-radius: 8px;
  background: var(--ev-section-bg);
}

.settings-section h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.settings-section p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  text-align: left;
  font-size: 0.9rem;
}

.sku-field {
  margin-bottom: 1rem;
}

.sku-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--ev-form-text);
}

.current-value {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: var(--ev-message-success-bg);
  border-radius: 4px;
  border-left: 3px solid var(--ev-button-success);
}

.current-label {
  color: var(--ev-message-success);
  font-size: 0.9rem;
}

.sku-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sku-input-group input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--ev-form-border);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--ev-form-bg);
  color: var(--ev-form-text);
  transition: border-color 0.2s;
}

.sku-input-group input:focus {
  outline: none;
  border-color: var(--ev-form-border-focus);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.sku-input-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.save-sku-btn {
  padding: 0.75rem 1rem;
  background-color: var(--ev-button-success);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.save-sku-btn:hover:not(:disabled) {
  background-color: var(--ev-button-success-hover);
}

.save-sku-btn:disabled {
  background-color: var(--ev-button-disabled);
  cursor: not-allowed;
}

.success-message {
  color: var(--ev-message-success);
  font-weight: 500;
  display: block;
  margin-top: 0.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.policy-form {
  margin-bottom: 2rem;
}

.policy-field {
  margin-bottom: 1.5rem;
}

.policy-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--ev-form-text);
}

.policy-field input,
.policy-field select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--ev-form-border);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--ev-form-bg);
  color: var(--ev-form-text);
  transition: border-color 0.2s;
}

.policy-field select:focus {
  outline: none;
  border-color: var(--ev-form-border-focus);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.policy-field select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.policy-field small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.policy-field a {
  color: var(--ev-button-primary);
  text-decoration: none;
}

.policy-field a:hover {
  text-decoration: underline;
}

.settings-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.save-button,
.skip-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button {
  background-color: var(--ev-button-primary);
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: var(--ev-button-primary-hover);
}

.save-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.skip-button {
  background-color: var(--ev-button-secondary);
  color: #666;
  border: 1px solid var(--ev-form-border);
}

.skip-button:hover {
  background-color: var(--ev-button-secondary-hover);
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--ev-message-error-bg);
  color: var(--ev-message-error);
  border-radius: 4px;
  text-align: center;
  border: 1px solid #f5c6cb;
}

.program-opt-in {
  text-align: center;
  padding: 2rem;
  background-color: var(--ev-message-warning-bg);
  border-radius: 8px;
  border: 1px solid var(--ev-message-warning-border);
}

.program-opt-in h4 {
  color: var(--ev-message-warning);
  margin-bottom: 1rem;
}

.program-opt-in p {
  color: var(--ev-message-warning);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.opt-in-actions {
  display: flex;
  justify-content: center;
}

.opt-in-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--ev-button-success);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.opt-in-button:hover:not(:disabled) {
  background-color: var(--ev-button-success-hover);
}

.opt-in-button:disabled {
  background-color: var(--ev-button-disabled);
  cursor: not-allowed;
}
</style>
