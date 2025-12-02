<script setup lang="ts">
import { ref, nextTick } from 'vue'
import UpcInput from './components/eeeeeeBay/UpcInput.vue'
import ListingPreview from './components/eeeeeeBay/ListingPreview.vue'
import LogPanel from './components/eeeeeeBay/LogPanel.vue'
import OAuthLogin from './components/eeeeeeBay/OAuthLogin.vue'
import PolicySetup from './components/PolicySetup.vue'
import ELogoUrl from './assets/E.svg?url'
import {
  searchProductByUpc,
  initEbay,
  createAndPublishListing,
  setCurrentUser,
  hasEbayPolicies,
  getInitialSku
} from './api'

interface ListingData {
  upc?: string
  title?: string
  price?: string | number
  currency?: string
  image?: string
  condition?: string
  conditionId?: string
  category?: string
  categoryId?: string
  categories?: Array<{ categoryId: string; categoryName: string }>
  brand?: string
  mpn?: string
  sku?: string
  quantity?: number
  description?: string
  shippingOptions?: Array<{
    shippingCost?: { value: string; currency: string }
    shippingCostType?: string
    minEstimatedDeliveryDate?: string
    maxEstimatedDeliveryDate?: string
  }>
  marketingPrice?: {
    originalPrice?: { value: string; currency: string }
    discountAmount?: { value: string; currency: string }
    discountPercentage?: string
  }
  additionalImages?: Array<{ imageUrl: string }>
  aspects?: { [key: string]: string[] }
  gtin?: string[]
  isDuplicate?: boolean
  log?: string
  publishError?: string
}

const listing = ref<ListingData | null>(null)
const log = ref('')
const token = ref('')
const tokenSet = ref(false)
const isSearching = ref(false)
const isPublishing = ref(false)
const policiesConfigured = ref(false)
const skuConfigured = ref(false)
const showingPolicySetup = ref(false)
const upcInputRef = ref<InstanceType<typeof UpcInput> | null>(null)
const lastPublishedSku = ref<string | null>(null)

async function onToken(t: string): Promise<void> {
  token.value = t
  const initResult = await initEbay()
  if (initResult.success) {
    const setResult = await window.api.ebaySetToken(t)
    if (setResult.success) {
      tokenSet.value = true
      // Set current user for settings management
      const userId = 'current-user' // In a real app, you'd get this from the token/user info
      await setCurrentUser(userId)

      // Check if initial SKU is configured
      const skuResult = await getInitialSku()
      skuConfigured.value = skuResult.success && skuResult.data !== undefined

      // Check if policies are configured
      const policyCheck = await hasEbayPolicies()
      policiesConfigured.value = policyCheck.success && !!policyCheck.data

      log.value = '[AUTH] Access token set and eBay API initialized.'
      if (!policiesConfigured.value) {
        log.value += '\n[AUTH] eBay policies need to be configured before creating listings.'
      }
    } else {
      log.value = `[AUTH] Failed to set token: ${setResult.error}`
    }
  } else {
    log.value = `[AUTH] Failed to initialize eBay API: ${initResult.error}`
  }
}

async function onLogout(): Promise<void> {
  const logoutResult = await window.api.ebayLogout()
  if (logoutResult.success) {
    token.value = ''
    tokenSet.value = false
    listing.value = null
    policiesConfigured.value = false
    skuConfigured.value = false
    lastPublishedSku.value = null
    log.value = '[AUTH] Successfully logged out.'
  } else {
    log.value = `[AUTH] Logout failed: ${logoutResult.error}`
  }
}

async function onSearch(upc: string): Promise<void> {
  isSearching.value = true
  try {
    const result = await searchProductByUpc(upc)
    if ('title' in result || 'sku' in result) {
      listing.value = { ...(result as ListingData), publishError: undefined }
    } else {
      listing.value = null
    }
    log.value = result.log || ''
  } catch (error) {
    log.value = `Error: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    isSearching.value = false
  }
}

async function onConfirm(): Promise<void> {
  if (!listing.value) return

  // Clear any previous publish error before retrying
  listing.value = { ...listing.value, publishError: undefined }
  isPublishing.value = true
  log.value += '\n[CONFIRM] Creating and publishing listing...'

  try {
    const payload = { ...listing.value } as Record<string, unknown>
    delete payload.publishError
    const result = await createAndPublishListing(
      payload as unknown as Parameters<typeof createAndPublishListing>[0]
    )
    if (result.success) {
      log.value += `\n[SUCCESS] ${result.log}`
      if (result.sku) {
        lastPublishedSku.value = result.sku
      }
      // Reset for next scan
      listing.value = null
      // Focus and select UPC input after successful listing
      await focusUpcInput()
    } else {
      const errorMessage = result.error || 'Listing creation failed. Check logs for details.'
      log.value += `\n[ERROR] ${result.log}`
      listing.value = {
        ...listing.value,
        publishError: errorMessage
      }
    }
  } catch (error) {
    const message =
      (error instanceof Error ? error.message : String(error)) ||
      'Listing creation failed. Check logs for details.'
    log.value += `\n[ERROR] Failed to create listing: ${message}`
    listing.value = {
      ...listing.value,
      publishError: message
    }
  } finally {
    isPublishing.value = false
  }
}

function onCancel(): void {
  listing.value = null
  log.value += '\n[CANCEL] Listing cancelled.'
  // Focus and select UPC input after cancellation
  focusUpcInput()
}

function focusUpcInput(): void {
  nextTick(() => {
    const upcInput = document.getElementById('upc') as HTMLInputElement
    if (upcInput) {
      upcInput.focus()
      upcInput.select()
    }
  })
}

function onPoliciesComplete(): void {
  policiesConfigured.value = true
  skuConfigured.value = true
  showingPolicySetup.value = false
  log.value += '\n[SETTINGS] Settings configured successfully.'
}

function onPoliciesSkip(): void {
  policiesConfigured.value = true // Mark as configured to prevent re-showing
  skuConfigured.value = true // Mark as configured to prevent re-showing
  showingPolicySetup.value = false
  log.value += '\n[SETTINGS] Settings configuration skipped. You can configure settings later.'
}

function showPolicySetup(): void {
  showingPolicySetup.value = true
  log.value += '\n[SETTINGS] Opening settings configuration...'
}

function onListingUpdate(updatedListing: ListingData): void {
  listing.value = updatedListing
  log.value += '\n[UPDATE] Listing data updated.'
}
</script>

<template>
  <div class="container">
    <OAuthLogin v-if="!token" @token="onToken" />
    <PolicySetup
      v-else-if="((!policiesConfigured || !skuConfigured) && tokenSet) || showingPolicySetup"
      :is-initial-setup="!policiesConfigured || !skuConfigured"
      :initial-sku-configured="skuConfigured"
      @complete="onPoliciesComplete"
      @skip="onPoliciesSkip"
    />
    <div v-else class="main-layout">
      <!-- Left Panel -->
      <div class="left-panel">
        <header class="app-header">
          <img :src="ELogoUrl" alt="eeeeee-bay Logo" class="logo" />
          <h1>eeeeee-bay Electron</h1>
        </header>
        <div class="search-section">
          <UpcInput ref="upcInputRef" :loading="isSearching" @search="onSearch" />
        </div>
        <div class="left-panel-footer">
          <div class="header-actions">
            <button class="modify-policies-btn" @click="showPolicySetup">Settings</button>
            <button class="logout-btn" @click="onLogout">Logout</button>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <ListingPreview
          v-if="listing"
          :listing="listing"
          :publishing="isPublishing"
          @confirm="onConfirm"
          @cancel="onCancel"
          @update:listing="onListingUpdate"
        />
        <div v-else class="idle-state">
          <p v-if="lastPublishedSku" class="last-sku">
            Last published SKU: <span class="big-red">{{ lastPublishedSku }}</span>
          </p>
        </div>
        <LogPanel :log="log" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.big-red {
  color: red;
  font-size: x-large;
  font-weight: 600;
}
.container {
  height: 100vh;
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-layout {
  flex: 1;
  display: flex;
  min-height: 0; /* Allow flex items to shrink */
  height: 100%;
  overflow: hidden;
}

/* Left Panel */
.left-panel {
  display: flex;
  flex-direction: column;
  width: 350px;
  min-width: 300px;
  height: 100%;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  padding: 1.5rem;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.logo {
  width: 50px;
  height: 50px;
}

h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
}

.search-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.left-panel-footer {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modify-policies-btn,
.logout-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.modify-policies-btn {
  background: #3498db;
  color: white;
}

.modify-policies-btn:hover {
  background: #2980b9;
}

.logout-btn {
  background: #e74c3c;
  color: white;
}

.logout-btn:hover {
  background: #c0392b;
}

/* Right Panel */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.idle-state {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.idle-state .last-sku {
  margin-top: 0.5rem;
  color: #27ae60;
  font-size: x-large;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 1024px) {
  .container {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .main-layout {
    flex-direction: column;
    overflow: visible;
  }

  .left-panel {
    width: 100%;
    min-width: unset;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    padding: 1rem;
    height: auto;
  }

  .app-header {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  h1 {
    font-size: 1.25rem;
  }

  .search-section {
    margin-bottom: 1rem;
  }

  .left-panel-footer {
    margin-top: 1rem;
    padding-top: 0.5rem;
  }

  .header-actions {
    flex-direction: row;
    justify-content: center;
  }

  .modify-policies-btn,
  .logout-btn {
    flex: 1;
    max-width: 150px;
  }

  .right-panel {
    padding: 1rem;
    height: auto;
    overflow-y: visible;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0;
  }

  .left-panel {
    padding: 0.75rem;
  }

  .app-header {
    flex-direction: column;
    text-align: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }

  .logo {
    width: 50px;
    height: 50px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.25rem;
  }

  .modify-policies-btn,
  .logout-btn {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
  }

  .right-panel {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .left-panel {
    padding: 0.5rem;
  }

  .app-header {
    margin-bottom: 0.5rem;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  h1 {
    font-size: 1.25rem;
  }

  .right-panel {
    padding: 0.5rem;
  }
}
</style>
