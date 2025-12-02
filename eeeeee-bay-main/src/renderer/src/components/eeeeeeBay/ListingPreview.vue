<template>
  <div v-if="listing">
    <h2 class="noticeable">SKU {{ listing.sku }} Preview</h2>
    <div class="keyboard-hint">
      <small>💡 Use <kbd>Space</kbd> to confirm or <kbd>Escape</kbd> to cancel</small>
    </div>
    <div v-if="listing.isDuplicate" class="duplicate-warning">
      <h2>
        ⚠️ DUPLICATE SKU: <strong>{{ listing.isDuplicate }}</strong
        ><br />
      </h2>
      <p>
        An item with the same UPC <strong>{{ listing.upc }}</strong> already exists in your eBay
        inventory.
      </p>
      <p>
        This may indicate you already have this item listed. Please review carefully before
        proceeding.
      </p>
    </div>
    <div v-if="listing.publishError" class="publish-error">
      <strong>Publish failed:</strong>
      <span>{{ listing.publishError }}</span>
      <small>Check the log panel for full details.</small>
    </div>
    <div class="preview">
      <div class="image-section">
        <img v-if="listing.image" :src="listing.image" alt="Product Image" />
        <div v-else class="no-image">No image available</div>
      </div>

      <div class="details-section">
        <div class="basic-info">
          <h3 v-if="!editingTitle" class="editable-title" @click="startEditingTitle">
            {{ listing.title || 'No title available' }}
            <span class="edit-hint">✏️</span>
          </h3>
          <div v-else class="title-editor">
            <textarea
              ref="titleInput"
              v-model="editedTitle"
              class="title-input"
              placeholder="Enter listing title..."
              rows="5"
              @blur="saveTitle"
              @keydown.enter="saveTitle"
              @keydown.escape.stop="cancelEditingTitle"
            />
            <div class="edit-actions">
              <button class="save-btn" @click="saveTitle">✓</button>
              <button class="cancel-btn" @click="cancelEditingTitle">✗</button>
            </div>
          </div>
          <div class="price-condition">
            <span v-if="listing.price" class="price">${{ listing.price }}</span>
            <span v-if="listing.condition" class="condition"
              >Condition: {{ listing.condition }}</span
            >
          </div>
        </div>

        <div class="product-details">
          <div v-if="listing.upc" class="detail-row"><strong>UPC:</strong> {{ listing.upc }}</div>
          <div v-if="listing.brand" class="detail-row">
            <strong>Brand:</strong> {{ listing.brand }}
          </div>
          <div v-if="listing.mpn" class="detail-row"><strong>MPN:</strong> {{ listing.mpn }}</div>

          <!-- Category Information -->
          <div v-if="listing.categories && listing.categories.length > 0" class="detail-row">
            <strong>Categories:</strong>
            <div class="categories">
              <span v-for="cat in listing.categories" :key="cat.categoryId" class="category-tag">
                {{ cat.categoryName }} ({{ cat.categoryId }})
              </span>
            </div>
          </div>

          <!-- Marketing Price Information -->
          <div v-if="listing.marketingPrice" class="detail-row">
            <strong>Original Price:</strong>
            <span class="original-price">${{ listing.marketingPrice.originalPrice?.value }}</span>
            <span v-if="listing.marketingPrice.discountPercentage" class="discount">
              ({{ listing.marketingPrice.discountPercentage }}% off - Save ${{
                listing.marketingPrice.discountAmount?.value
              }})
            </span>
          </div>

          <!-- Shipping Information -->
          <div
            v-if="listing.shippingOptions && listing.shippingOptions.length > 0"
            class="detail-row"
          >
            <strong>Shipping:</strong>
            <div class="shipping-options">
              <div
                v-for="(option, index) in listing.shippingOptions.slice(0, 3)"
                :key="index"
                class="shipping-option"
              >
                <span v-if="option.shippingCost">
                  ${{ option.shippingCost.value }} {{ option.shippingCost.currency }}
                </span>
                <span v-else>Free Shipping</span>
                <span v-if="option.shippingCostType" class="shipping-type"
                  >({{ option.shippingCostType }})</span
                >
                <div
                  v-if="option.minEstimatedDeliveryDate && option.maxEstimatedDeliveryDate"
                  class="delivery-estimate"
                >
                  Delivery: {{ formatDate(option.minEstimatedDeliveryDate) }} -
                  {{ formatDate(option.maxEstimatedDeliveryDate) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Product Aspects/Specifications -->
          <div v-if="listing.aspects && Object.keys(listing.aspects).length > 0" class="detail-row">
            <strong>Specifications:</strong>
            <div class="aspects">
              <div
                v-for="[key, values] in Object.entries(listing.aspects).slice(0, 5)"
                :key="key"
                class="aspect"
              >
                <span class="aspect-name">{{ key }}:</span>
                <span class="aspect-values">{{ values.join(', ') }}</span>
              </div>
            </div>
          </div>
          <div v-if="listing.quantity" class="detail-row">
            <strong>Available Quantity:</strong> {{ listing.quantity }}
          </div>

          <div v-if="listing.description" class="detail-row">
            <strong>Description:</strong>
            <div class="description">{{ listing.description }}</div>
          </div>
        </div>

        <!-- Additional Images Section -->
        <div
          v-if="listing.additionalImages && listing.additionalImages.length > 0"
          class="additional-images"
        >
          <h4>Additional Images</h4>
          <div class="image-gallery">
            <img
              v-for="(img, index) in listing.additionalImages.slice(0, 6)"
              :key="index"
              :src="img.imageUrl"
              :alt="`Additional image ${index + 1}`"
              class="additional-image"
              loading="lazy"
            />
          </div>
        </div>

        <div v-if="!isComplete" class="listing-requirements">
          <h4>Missing Required Fields:</h4>
          <ul>
            <li v-if="!listing.title">Title</li>
            <li v-if="!listing.price">Price</li>
            <li v-if="!listing.category">Category</li>
            <li v-if="!listing.quantity">Available Quantity</li>
            <li v-if="!listing.image">Product Image</li>
            <li v-if="!listing.sku">SKU</li>
            <li v-if="!listing.condition">Condition</li>
            <li v-if="!listing.description">Description</li>
          </ul>
        </div>

        <div class="actions">
          <button :disabled="!isComplete || publishing" @click="$emit('confirm')">
            {{
              publishing
                ? 'Publishing...'
                : isComplete
                  ? 'Confirm & Create Listing (Space)'
                  : 'Complete Required Fields First'
            }}
          </button>
          <button :disabled="publishing" @click="$emit('cancel')">Cancel (Escape)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, nextTick } from 'vue'

interface Listing {
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

const props = defineProps<{ listing: Listing; publishing?: boolean }>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:listing': [listing: Listing]
}>()

// Title editing state
const editingTitle = ref(false)
const editedTitle = ref('')
const titleInput = ref<HTMLTextAreaElement>()

const isComplete = computed(() => {
  return !!(
    props.listing.title &&
    props.listing.price &&
    props.listing.category &&
    props.listing.quantity &&
    props.listing.image &&
    props.listing.sku &&
    props.listing.condition &&
    props.listing.description
  )
})

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

const startEditingTitle = async (): Promise<void> => {
  editingTitle.value = true
  editedTitle.value = props.listing.title || ''
  await nextTick()
  titleInput.value?.focus()
  titleInput.value?.select()
}

const saveTitle = (): void => {
  if (editedTitle.value.trim()) {
    const updatedListing = { ...props.listing, title: editedTitle.value.trim() }
    emit('update:listing', updatedListing)
  }
  editingTitle.value = false
}

const cancelEditingTitle = (): void => {
  editingTitle.value = false
  editedTitle.value = props.listing.title || ''
}

const handleKeydown = (event: KeyboardEvent): void => {
  // Don't handle global shortcuts when editing title
  if (editingTitle.value) {
    return
  }

  // Prevent default behavior for space to avoid page scrolling
  if (event.code === 'Space') {
    event.preventDefault()
    if (!props.publishing && isComplete.value) {
      emit('confirm')
    }
  } else if (event.code === 'Escape') {
    event.preventDefault()
    if (!props.publishing) {
      emit('cancel')
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.preview {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  max-width: 1000px;
}

.image-section {
  flex-shrink: 0;
}

.image-section img {
  width: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-image {
  width: 200px;
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  background: #f9f9f9;
}

.details-section {
  flex: 1;
  min-width: 0;
}

.basic-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  line-height: 1.3;
}

.editable-title {
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  position: relative;
  display: inline-block;
}

.editable-title:hover {
  background-color: #f8f9fa;
}

.edit-hint {
  opacity: 0;
  font-size: 0.8rem;
  margin-left: 0.5rem;
  transition: opacity 0.2s;
}

.editable-title:hover .edit-hint {
  opacity: 0.6;
}

.title-editor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.title-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #3498db;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  background: white;
  outline: none;
  transition: border-color 0.2s;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
}

.title-input:focus {
  border-color: #2980b9;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
}

.save-btn,
.cancel-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn {
  background: #27ae60;
  color: white;
}

.save-btn:hover {
  background: #229954;
}

.cancel-btn {
  background: var(--ev-button-danger);
  color: white;
}

.cancel-btn:hover {
  background: var(--ev-button-danger-hover);
}

.price-condition {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #27ae60;
}
.noticeable {
  font-weight: bold;
  color: #e26f6f;
}

.condition {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.product-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.detail-row strong {
  color: #34495e;
  min-width: 120px;
  display: inline-block;
}

.description {
  margin-top: 0.25rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #3498db;
  max-height: 150px;
  overflow-y: auto;
  font-size: 0.9rem;
  line-height: 1.4;
}

.categories {
  margin-top: 0.25rem;
}

.category-tag {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
}

.original-price {
  text-decoration: line-through;
  color: #7f8c8d;
  margin-right: 0.5rem;
}

.discount {
  color: #27ae60;
  font-weight: bold;
  font-size: 0.9rem;
}

.shipping-options {
  margin-top: 0.25rem;
}

.shipping-option {
  margin-bottom: 0.5rem;
  padding: 0.3rem;
  background: #f1f2f6;
  border-radius: 4px;
  font-size: 0.9rem;
}

.shipping-type {
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.delivery-estimate {
  color: #27ae60;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.aspects {
  margin-top: 0.25rem;
  display: grid;
  gap: 0.3rem;
}

.aspect {
  display: flex;
  font-size: 0.9rem;
}

.aspect-name {
  font-weight: 500;
  color: #34495e;
  min-width: 100px;
  margin-right: 0.5rem;
}

.aspect-values {
  color: #7f8c8d;
}

.ebay-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.ebay-link:hover {
  text-decoration: underline;
}

.additional-images {
  margin-top: 1.5rem;
}

.additional-images h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  max-width: 500px;
}

.additional-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.additional-image:hover {
  transform: scale(1.05);
}

.listing-requirements {
  background: var(--ev-message-warning-bg);
  border: 1px solid var(--ev-message-warning-border);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.listing-requirements h4 {
  margin: 0 0 0.5rem 0;
  color: var(--ev-message-warning);
}

.listing-requirements ul {
  margin: 0;
  padding-left: 1.2rem;
}

.listing-requirements li {
  color: var(--ev-message-warning);
  margin-bottom: 0.25rem;
}

.duplicate-warning {
  background: var(--ev-message-error-bg);
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.duplicate-warning h2 {
  margin: 0 0 0.5rem 0;
  color: var(--ev-message-error);
  font-size: 200%;
}

.duplicate-warning p {
  margin: 0.5rem 0;
  color: var(--ev-message-error);
  line-height: 1.4;
}

.publish-error {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  background: var(--ev-message-error-bg);
  border: 1px solid #f5c6cb;
  color: var(--ev-message-error);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.publish-error small {
  color: var(--ev-message-error);
  opacity: 0.8;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.actions button:first-child {
  background: var(--ev-button-success);
  color: white;
}

.actions button:first-child:hover:not(:disabled) {
  background: var(--ev-button-success-hover);
}

.actions button:first-child:disabled {
  background: var(--ev-button-disabled);
  cursor: not-allowed;
}

.actions button:last-child {
  background: var(--ev-button-secondary);
  color: #666;
  border: 1px solid var(--ev-form-border);
}

.keyboard-hint {
  margin-bottom: 1rem;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.keyboard-hint kbd {
  background: #f1f2f6;
  border: 1px solid #ddd;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  color: #333;
  display: inline-block;
  font-family: monospace;
  font-size: 0.8em;
  font-weight: bold;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
}
</style>
