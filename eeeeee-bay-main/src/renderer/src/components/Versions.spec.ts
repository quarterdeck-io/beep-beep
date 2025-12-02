import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Versions from './Versions.vue'

describe('Versions', () => {
  const mockVersions = {
    electron: '25.0.0',
    chrome: '114.0.5735.289',
    node: '18.15.0'
  }

  beforeEach(() => {
    // Mock window.electron.process.versions
    vi.stubGlobal('window', {
      electron: {
        process: {
          versions: mockVersions
        }
      }
    })
  })

  it('renders all version information correctly', () => {
    const wrapper = mount(Versions)

    expect(wrapper.find('.electron-version').text()).toBe('Electron v25.0.0')
    expect(wrapper.find('.chrome-version').text()).toBe('Chromium v114.0.5735.289')
    expect(wrapper.find('.node-version').text()).toBe('Node v18.15.0')
  })

  it('displays versions in a list format', () => {
    const wrapper = mount(Versions)

    const listItems = wrapper.findAll('li')
    expect(listItems).toHaveLength(3)

    expect(listItems[0].classes()).toContain('electron-version')
    expect(listItems[1].classes()).toContain('chrome-version')
    expect(listItems[2].classes()).toContain('node-version')
  })

  it('has correct CSS class on the list', () => {
    const wrapper = mount(Versions)

    expect(wrapper.find('ul').classes()).toContain('versions')
  })

  it('updates when versions change', async () => {
    const wrapper = mount(Versions)

    // Update the mock versions
    const newVersions = {
      electron: '26.0.0',
      chrome: '115.0.5735.289',
      node: '19.0.0'
    }

    vi.stubGlobal('window', {
      electron: {
        process: {
          versions: newVersions
        }
      }
    })

    // Re-mount to get new versions
    await wrapper.unmount()
    const newWrapper = mount(Versions)

    expect(newWrapper.find('.electron-version').text()).toBe('Electron v26.0.0')
    expect(newWrapper.find('.chrome-version').text()).toBe('Chromium v115.0.5735.289')
    expect(newWrapper.find('.node-version').text()).toBe('Node v19.0.0')
  })

  it('handles missing version properties gracefully', () => {
    // Mock with missing properties
    vi.stubGlobal('window', {
      electron: {
        process: {
          versions: {
            electron: '25.0.0'
            // chrome and node are missing
          }
        }
      }
    })

    const wrapper = mount(Versions)

    expect(wrapper.find('.electron-version').text()).toBe('Electron v25.0.0')
    expect(wrapper.find('.chrome-version').text()).toBe('Chromium v')
    expect(wrapper.find('.node-version').text()).toBe('Node v')
  })
})
