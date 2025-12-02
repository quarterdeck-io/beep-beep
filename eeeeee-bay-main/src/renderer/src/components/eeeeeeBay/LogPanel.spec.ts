import { mount } from '@vue/test-utils'
import LogPanel from './LogPanel.vue'

describe('LogPanel', () => {
  it('renders log content correctly', () => {
    const log = 'Test log message\nSecond line'
    const wrapper = mount(LogPanel, { props: { log } })

    expect(wrapper.text()).toContain('Log')
    expect(wrapper.find('pre').text()).toBe(log)
  })

  it('renders empty log', () => {
    const wrapper = mount(LogPanel, { props: { log: '' } })

    expect(wrapper.find('pre').text()).toBe('')
  })

  it('renders multiline log with proper formatting', () => {
    const log = 'Line 1\nLine 2\nLine 3'
    const wrapper = mount(LogPanel, { props: { log } })

    const pre = wrapper.find('pre')
    expect(pre.text()).toBe(log)
    expect(wrapper.classes()).toContain('log-panel') // Check that the component has the log-panel class
  })

  it('has correct CSS classes', () => {
    const wrapper = mount(LogPanel, { props: { log: 'test' } })

    expect(wrapper.classes()).toContain('log-panel')
    expect(wrapper.find('pre').exists()).toBe(true)
  })
})
