import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest'
import { marked } from 'marked'
import { processContent, createHeaderFromFrontMatter, wrapTablesInContainer } from '../src/js/utils'

// Mock values for testing
const mockData = {
  attributes: {
    title: 'John Doe',
    headline: 'Software Engineer',
    description: 'Test description',
    email: 'john@example.com',
    github: '@johndoe',
  },
  markdown: '# Test Content',
}

// Mock cv.md using factory function
vi.mock('../src/cv.md', async () => {
  return {
    attributes: mockData.attributes,
    markdown: mockData.markdown,
  }
})

vi.mock('marked', () => ({
  marked: {
    parse: vi.fn(),
  },
}))

vi.mock('../../package.json', () => ({
  homepage: 'https://example.com',
}))

vi.mock('@phosphor-icons/web/regular', () => ({
  default: {},
}))

vi.mock('vite-plugin-markdown', () => ({
  Mode: { MARKDOWN: 'markdown' },
}))

// Create a helper function to initialize main.js with mocks
async function initializeMain() {
  // Reset the DOM
  document.documentElement.innerHTML = `
    <html>
      <head></head>
      <body>
        <header></header>
        <main></main>
      </body>
    </html>
  `

  // Mock window.fs
  vi.stubGlobal('window', {
    fs: {
      readFile: vi.fn().mockResolvedValue(new Uint8Array()),
    },
  })

  try {
    // Reset modules to ensure fresh state
    vi.resetModules()

    // Ensure our mocks are properly loaded
    const cvModule = await import('../src/cv.md')
    console.log('CV Module loaded:', cvModule)

    // Import and initialize main.js
    const mainModule = await import('../src/js/main.js')
    return mainModule
  } catch (error) {
    console.error('Error loading main.js:', error)
    throw error
  }
}

describe('main.js', () => {
  beforeEach(() => {
    vi.resetModules()

    // Setup fresh DOM for each test
    document.documentElement.innerHTML = `
      <html>
        <head></head>
        <body>
          <header></header>
          <main></main>
        </body>
      </html>
    `
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    document.documentElement.innerHTML = ''
  })

  describe('Meta Tags', () => {
    test('creates and updates meta tags correctly', async () => {
      marked.parse.mockReturnValue('<div>Test content</div>')
      await initializeMain()

      const metaTags = document.head.querySelectorAll('meta')
      const descriptions = Array.from(metaTags).filter(
        (tag) =>
          tag.getAttribute('name') === 'description' ||
          tag.getAttribute('property') === 'og:description'
      )

      expect(descriptions.length).toBe(2)
      descriptions.forEach((tag) => {
        expect(tag.getAttribute('content')).toBe(mockData.attributes.description)
      })
    })

    test('updates existing meta tags instead of creating duplicates', async () => {
      const existingMeta = document.createElement('meta')
      existingMeta.setAttribute('name', 'description')
      existingMeta.setAttribute('content', 'Old description')
      document.head.appendChild(existingMeta)

      marked.parse.mockReturnValue('<div>Test content</div>')
      await initializeMain()

      const descriptionTags = document.head.querySelectorAll('meta[name="description"]')
      expect(descriptionTags.length).toBe(1)
      expect(descriptionTags[0].getAttribute('content')).toBe(mockData.attributes.description)
    })
  })

  describe('Header Creation', () => {
    test('creates header with all provided attributes', () => {
      createHeaderFromFrontMatter(mockData.attributes)

      const header = document.querySelector('header')
      expect(header.querySelector('h1').textContent).toBe(mockData.attributes.title)
      expect(header.querySelector('.headline').textContent).toBe(mockData.attributes.headline)
      expect(header.querySelector(`[href="mailto:${mockData.attributes.email}"]`)).not.toBeNull()
      expect(
        header.querySelector(
          `[href="https://github.com/${mockData.attributes.github.replace('@', '')}"]`
        )
      ).not.toBeNull()
    })

    test('handles missing optional attributes', () => {
      createHeaderFromFrontMatter({
        title: 'John Doe',
      })

      const header = document.querySelector('header')
      expect(header.querySelector('h1').textContent).toBe('John Doe')
      expect(header.querySelector('.headline').textContent).toBe('')
      expect(header.querySelector('[href^="mailto:"]')).toBeNull()
    })
  })

  describe('Document Title', () => {
    test('sets document title correctly', async () => {
      marked.parse.mockReturnValue('<div>Test content</div>')
      await initializeMain()
      const expectedTitle = `${mockData.attributes.title} » ${mockData.attributes.headline}`
      expect(document.title).toBe(expectedTitle)
    })
  })

  describe('Main Content Injection', () => {
    test('processes markdown content correctly', () => {
      const mockHtml = `
        <h2>Technical Skills</h2>
        <ul>
          <li>Programming</li>
        </ul>
        <table>
          <tr><td>Test</td></tr>
        </table>
      `
      marked.parse.mockReturnValue(mockHtml)

      const content = processContent(mockHtml)
      const processedContent = wrapTablesInContainer(content)

      expect(processedContent).toContain('technical-skills')
      expect(processedContent).toContain('table-container')
    })

    test('handles empty content gracefully', () => {
      marked.parse.mockReturnValue('')
      const processedContent = processContent('')
      expect(processedContent).toBe('')
    })

    test('injects processed content into main element', async () => {
      const mockProcessedHtml = '<div>Processed Content</div>'
      marked.parse.mockReturnValue(mockProcessedHtml)

      await initializeMain()

      const main = document.querySelector('main')
      expect(main.innerHTML.trim()).toBe(mockProcessedHtml)
    })

    test('handles missing main element gracefully', async () => {
      document.querySelector('main').remove()
      await initializeMain()
      // Should not throw an error
    })
  })
})
