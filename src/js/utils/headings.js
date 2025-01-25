/**
 * Processes h2 headings in the document to add Phosphor icons based on icon markers in the text.
 * Icons are specified using the syntax [ph-iconname] at the end of the heading text.
 *
 * The function:
 * 1. Identifies headings with icon markers
 * 2. Removes the marker from the text
 * 3. Adds the specified Phosphor icon before the heading text
 *
 * @param {Document} doc - The DOM Document object containing the headings to process
 *
 * @example
 * // Input HTML:
 * // <h2>Programming [ph-code]</h2>
 *
 * // Output HTML:
 * // <h2>
 * //   <i class="ph ph-code" style="margin-right: 0.5em"></i>
 * //   Programming
 * // </h2>
 *
 * @example
 * // Headings without icon markers are left unchanged:
 * // <h2>Regular Heading</h2> -> <h2>Regular Heading</h2>
 *
 * @note The icon marker must be at the end of the heading text and follow the format
 * [ph-iconname] where iconname is a valid Phosphor icon name. Headings without a valid
 * marker are not modified.
 */
export function processHeadings(doc) {
  doc.querySelectorAll('h2').forEach((heading) => {
    const iconMatch = heading.textContent.match(/\[ph-[\w-]+\]$/)
    if (!iconMatch) return

    const iconName = iconMatch[0].replace(/^\[ph-/, '').replace(/\]$/, '')
    heading.textContent = heading.textContent.replace(/\[ph-[\w-]+\]$/, '')

    const iconElement = document.createElement('i')
    iconElement.className = `ph ph-${iconName}`
    iconElement.style.marginRight = '0.5em'
    heading.insertBefore(iconElement, heading.firstChild)
  })
}
