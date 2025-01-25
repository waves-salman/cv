import { wrapTablesInContainer } from './table'
import { processSkillsSection } from './skills'
import { processHeadings } from './headings'
import { processTimelineEntries } from './timeline'
import { createContactItem, createHeaderFromFrontMatter } from './header'

/**
 * Main content processing function that coordinates all CV content transformations.
 * This function orchestrates the processing of various CV sections including skills,
 * headings, and timeline entries. It serves as the central point for converting
 * the raw HTML content into the final formatted CV structure.
 *
 * The function applies the following transformations in order:
 * 1. Technical skills section formatting (icons, styling)
 * 2. Section headings processing (adding icons)
 * 3. Timeline entries formatting (work history, education, etc.)
 *
 * @param {string} html - Raw HTML content generated from the markdown CV
 * @returns {string} Processed HTML content with all formatting applied
 *
 * @example
 * const rawHtml = marked.parse(markdownContent);
 * const processedHtml = processContent(rawHtml);
 * document.querySelector('main').innerHTML = processedHtml;
 */
export function processContent(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Process each section
  processSkillsSection(doc)
  processHeadings(doc)
  processTimelineEntries(doc)

  return doc.body.innerHTML
}

// Re-export utility functions for use in other modules
export { wrapTablesInContainer, createContactItem, createHeaderFromFrontMatter }
