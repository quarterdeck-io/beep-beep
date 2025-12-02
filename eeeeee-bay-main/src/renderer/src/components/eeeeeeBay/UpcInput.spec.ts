import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UpcInput from './UpcInput.vue'

describe('UpcInput', () => {
  it('renders form elements correctly', () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    expect(wrapper.find('label').text()).toBe('DVD UPC:')
    expect(wrapper.find('input').attributes('placeholder')).toBe('Scan or enter UPC')
    expect(wrapper.find('button').text()).toBe('Search')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(UpcInput, { props: { loading: true } })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button').text()).toBe('Searching...')
  })

  it('enables form when not loading', () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('button').attributes('disabled')).not.toBe('true')
  })

  it('disables submit button when input is empty', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    const button = wrapper.find('button')

    await input.setValue('')
    expect(button.attributes('disabled')).toBeDefined()

    await input.setValue('   ')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('enables submit button when input has content', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    const button = wrapper.find('button')

    await input.setValue('123456789012')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('emits search event with valid UPC-12', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('012345678905') // Valid UPC-12

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['012345678905']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with another valid UPC-12', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('883929311514') // Valid UPC-12

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['883929311514']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 10 Cloverfield Lane UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('032429245502') // 10 Cloverfield Lane

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['032429245502']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 12 Years a Slave UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('024543881018') // 12 Years a Slave

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['024543881018']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 13 Going on 30 UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('043396286306') // 13 Going on 30

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['043396286306']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 13 Hours UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('032429243065') // 13 Hours

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['032429243065']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 17 Again UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('794043128516') // 17 Again

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['794043128516']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 127 Hours UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('024543736394') // 127 Hours

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['024543736394']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 2001 Space Odyssey UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('012569798380') // 2001: A Space Odyssey

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['012569798380']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 2010 Year We Make Contact UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('883929051069') // 2010: The Year We Make Contact

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['883929051069']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 2012 UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('043396347076') // 2012

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['043396347076']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 28 Days Later UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('024543468172') // 28 Days Later

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['024543468172']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 28 Weeks Later UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('024543471103') // 28 Weeks Later

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['024543471103']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 3:10 to Yuma UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('025192167782') // 3:10 to Yuma

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['025192167782']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with 300 UPC', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('031398221890') // 300

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['031398221890']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with valid EAN-13', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('1234567890128') // Valid EAN-13

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['1234567890128']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('emits search event with valid EAN-8', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('12345670') // Valid EAN-8

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['12345670']])
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('shows error for empty input', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toBeUndefined()
    expect(wrapper.text()).toContain('UPC is required')
  })

  it('shows error for invalid barcode format', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('12345678901') // Invalid length

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toBeUndefined()
    expect(wrapper.text()).toContain('Invalid barcode format')
  })

  it('shows error for invalid UPC-12 check digit', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('012345678906') // Invalid check digit

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toBeUndefined()
    expect(wrapper.text()).toContain('Invalid barcode format')
  })

  it('shows error for invalid EAN-13 check digit', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('1234567890129') // Invalid check digit

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toBeUndefined()
    expect(wrapper.text()).toContain('Invalid barcode format')
  })

  it('clears error on successful submission', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    // First submit with error
    const input = wrapper.find('input')
    await input.setValue('invalid')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error').exists()).toBe(true)

    // Then submit with valid code
    await input.setValue('012345678905')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('handles non-digit characters in barcode', async () => {
    const wrapper = mount(UpcInput, { props: { loading: false } })

    const input = wrapper.find('input')
    await input.setValue('012-345-678-905') // Valid UPC-12 with dashes

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toEqual([['012-345-678-905']])
  })

  it('prevents form submission when loading', async () => {
    const wrapper = mount(UpcInput, { props: { loading: true } })

    const input = wrapper.find('input')
    await input.setValue('012345678905')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('search')).toBeUndefined()
  })
})
