import { marked } from 'marked'
import { markdown, attributes } from '../cv.md'
import { homepage } from '../../package.json'
import { wrapTablesInContainer, processContent, createHeaderFromFrontMatter } from './utils'
import '@phosphor-icons/web/regular'

// Convert Markdown to HTML using `marked`
const html = marked.parse(markdown)

// Process the HTML content (add icons, format sections, etc)
const processedHtml = processContent(html)

// Wrap tables in container divs
const finalHtml = wrapTablesInContainer(processedHtml)

// Extract title from attributes
const title = `${attributes.title} » ${attributes.headline}`

// Set the document title
document.title = title

// Get the base URL for absolute URLs
const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`

// Add meta tags
const metaItems = [
  { name: 'description', content: `${attributes.description}` },
  { name: 'author', content: attributes.title },
  { property: 'og:title', content: `${attributes.title} » ${attributes.headline}` },
  { property: 'og:description', content: `${attributes.description}` },
  { property: 'og:site_name', content: `${attributes.title}'s CV` },
  { property: 'og:url', content: `${homepage}` },
  // { property: 'og:url', content: baseUrl },
  { property: 'og:image', content: new URL('og-image.jpg', baseUrl).toString() },
]

metaItems.forEach((metaItem) => {
  const key = metaItem.name ? 'name' : 'property'
  const selector = `meta[${key}="${metaItem[key]}"]`
  let metaTag = document.querySelector(selector)

  if (!metaTag) {
    metaTag = document.createElement('meta')
    metaTag.setAttribute(key, metaItem[key])
    document.head.appendChild(metaTag)
  }

  metaTag.setAttribute('content', metaItem.content)
})

// Create header from front matter
createHeaderFromFrontMatter(attributes)

// Inject the converted HTML into the page
const main = document.querySelector('main')
if (main) {
  main.innerHTML = finalHtml
}
