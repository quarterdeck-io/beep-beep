import { mount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import OAuthLogin from './OAuthLogin.vue'

// Mock the API function
vi.mock('../../api', () => ({
  ebayOAuthLogin: vi.fn()
}))

import { ebayOAuthLogin } from '../../api'

const mockedEbayOAuthLogin = vi.mocked(ebayOAuthLogin)

describe('OAuthLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock environment variables
    vi.stubEnv('VITE_EBAY_CLIENT_ID', 'test-client-id')
    vi.stubEnv('VITE_EBAY_SCOPE', 'test-scope')
    vi.stubEnv('VITE_EBAY_SANDBOX', 'false')
  })

  it('renders login button initially', () => {
    const wrapper = mount(OAuthLogin)

    expect(wrapper.text()).toContain('Login with eBay')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('shows loading state during login', async () => {
    mockedEbayOAuthLogin.mockImplementation(() => new Promise(() => {})) // Never resolves

    const wrapper = mount(OAuthLogin)
    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain('Logging in...')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('emits token on successful login', async () => {
    const testToken = 'test-access-token'
    mockedEbayOAuthLogin.mockResolvedValue(testToken)

    const wrapper = mount(OAuthLogin)
    await wrapper.find('button').trigger('click')

    expect(mockedEbayOAuthLogin).toHaveBeenCalledWith('test-client-id', 'test-scope', 3000, false)
    expect(wrapper.emitted('token')).toEqual([[testToken]])
  })

  it('shows error when OAuth returns null', async () => {
    mockedEbayOAuthLogin.mockResolvedValue(null)

    const wrapper = mount(OAuthLogin)
    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain('OAuth window closed or no token received.')
    expect(wrapper.emitted('token')).toBeUndefined()
  })

  it('shows error on OAuth exception', async () => {
    const errorMessage = 'Network error'
    mockedEbayOAuthLogin.mockRejectedValue(new Error(errorMessage))

    const wrapper = mount(OAuthLogin)
    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain(errorMessage)
    expect(wrapper.emitted('token')).toBeUndefined()
  })

  it('shows error when client ID is missing', async () => {
    vi.stubEnv('VITE_EBAY_CLIENT_ID', '')

    const wrapper = mount(OAuthLogin)
    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain('Missing eBay Client ID in .env')
  })

  it('resets loading state after completion', async () => {
    mockedEbayOAuthLogin.mockResolvedValue('token')

    const wrapper = mount(OAuthLogin)
    await wrapper.find('button').trigger('click')

    // Wait for next tick to ensure loading state is reset
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Login with eBay')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('resets loading state after error', async () => {
    mockedEbayOAuthLogin.mockRejectedValue(new Error('Test error'))

    const wrapper = mount(OAuthLogin)
    await wrapper.find('button').trigger('click')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Login with eBay')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })
})
