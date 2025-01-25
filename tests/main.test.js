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

/**
 * Process template tags in HTML content
 * @param {string} html HTML content with template tags
 * @param {Object} data Data to inject into template
 * @returns {string} Processed HTML
 */
function processTemplate(html, data) {
  return html
    .replace(/%__CV_DATA__\.(\w+)%/g, (_, key) => data[key])
    .replace(/%__BASE_URL__%/g, 'https://example.com/')
}

/**
 * Set up the DOM for testing
 * @param {Object} data Test data
 * @returns {void}
 */
function setupTestDOM(data = mockData.attributes) {
  const template = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <!-- Meta tags injected by template -->
        <meta name="description" content="%__CV_DATA__.description%" />
        <meta name="author" content="%__CV_DATA__.title%" />
        <meta property="og:description" content="%__CV_DATA__.description%" />
        <title>%__CV_DATA__.title% » %__CV_DATA__.headline%</title>
      </head>
      <body>
        <header></header>
        <main></main>
      </body>
    </html>
  `

  // Process the template with the provided data
  document.documentElement.innerHTML = processTemplate(template, data)
}

// Create a helper function to initialize main.js with mocks
async function initializeMain() {
  // Mock window.fs
  vi.stubGlobal('window', {
    fs: {
      readFile: vi.fn().mockResolvedValue(new Uint8Array()),
    },
  })

  // Mock Vite's template variables
  global.__CV_DATA__ = mockData.attributes
  global.__BASE_URL__ = 'https://example.com/'

  try {
    // Reset modules to ensure fresh state
    vi.resetModules()

    // Setup DOM with processed template
    setupTestDOM(mockData.attributes)

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
    setupTestDOM()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    document.documentElement.innerHTML = ''
    delete global.__CV_DATA__
    delete global.__BASE_URL__
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
      setupTestDOM()
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
      setupTestDOM()
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
      setupTestDOM()
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
      setupTestDOM()
      const main = document.querySelector('main')
      if (main) main.remove()
      await initializeMain()
      // Should not throw an error
    })
  })
})
