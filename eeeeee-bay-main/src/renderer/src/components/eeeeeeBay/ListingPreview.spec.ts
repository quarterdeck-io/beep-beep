import { mount } from '@vue/test-utils'
import ListingPreview from './ListingPreview.vue'

describe('ListingPreview', () => {
  const listing = {
    upc: '123456789012',
    title: 'Test DVD',
    price: '9.99',
    condition: 'Brand New',
    category: 'DVDs',
    categories: [{ categoryId: '617', categoryName: 'DVDs & Blu-ray Discs' }],
    image: 'https://via.placeholder.com/150x200?text=DVD+Cover',
    sku: 'SKU-000001',
    quantity: 1,
    description: 'A test DVD description'
  }

  it('renders all listing fields', () => {
    const wrapper = mount(ListingPreview, { props: { listing } })
    expect(wrapper.text()).toContain('Test DVD')
    expect(wrapper.text()).toContain('123456789012')
    expect(wrapper.text()).toContain('9.99')
    expect(wrapper.text()).toContain('Brand New')
    expect(wrapper.text()).toContain('DVDs & Blu-ray Discs')
    expect(wrapper.find('img').attributes('src')).toBe(listing.image)
  })

  it('emits confirm and cancel events', async () => {
    const wrapper = mount(ListingPreview, { props: { listing } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})
