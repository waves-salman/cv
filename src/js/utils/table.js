/**
 * Wraps all table elements in the provided HTML with div containers for better styling and responsiveness.
 * This function ensures tables are horizontally scrollable on smaller screens while maintaining their structure
 * and attributes.
 *
 * The wrapper div is given a class name of 'table-container' which can be targeted for CSS styling,
 * particularly for handling overflow and responsive behavior.
 *
 * @param {string} html - The HTML string containing table elements to be wrapped
 * @returns {string} The modified HTML string with all tables wrapped in container divs
 *
 */
export function wrapTablesInContainer(html) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const tables = tempDiv.querySelectorAll('table')
  tables.forEach((table) => {
    const wrapper = document.createElement('div')
    wrapper.classList.add('table-container')
    table.parentNode.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  })

  return tempDiv.innerHTML
}
