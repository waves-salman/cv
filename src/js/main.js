import { marked } from 'marked'
import { markdown, attributes } from '../cv.md'
import { wrapTablesInContainer, processContent, createHeaderFromFrontMatter } from './utils'
import '@phosphor-icons/web/regular'

// Convert Markdown to HTML using `marked`
const html = marked.parse(markdown)

// Process the HTML content (add icons, format sections, etc)
const processedHtml = processContent(html)

// Wrap tables in container divs
const finalHtml = wrapTablesInContainer(processedHtml)

// Create header from front matter
createHeaderFromFrontMatter(attributes)

// Inject the converted HTML into the page
const main = document.querySelector('main')
if (main) {
  main.innerHTML = finalHtml
}
