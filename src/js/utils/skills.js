/**
 * Processes the Technical Skills section of the CV by finding the relevant heading
 * and applying styling and icons to the skills list beneath it.
 *
 * @param {Document} doc - The DOM Document object containing the CV content
 *
 * @example
 * // Input HTML:
 * // <h2>Technical Skills</h2>
 * // <ul>
 * //   <li>Programming
 * //     <ul><li>Python</li></ul>
 * //   </li>
 * // </ul>
 *
 * // Output HTML adds classes and icons to create a styled skills section
 */
export function processSkillsSection(doc) {
  const technicalSkillsHeading = Array.from(doc.querySelectorAll('h2')).find((heading) =>
    heading.textContent.includes('Technical Skills')
  )

  if (!technicalSkillsHeading) return

  const skillsList = technicalSkillsHeading.nextElementSibling
  if (!skillsList || skillsList.tagName !== 'UL') return

  skillsList.classList.add('technical-skills')
  processSkillCategories(skillsList)
}

/**
 * Processes each top-level skill category in the skills list, adding icons
 * and formatting. Preserves any HTML content within the skill items.
 *
 * @param {HTMLUListElement} skillsList - The unordered list containing skill categories
 *
 * @example
 * // Each category is processed to add an icon and styling:
 * // <li class="skill-category">
 * //   <div>
 * //     <i class="ph ph-code"></i>
 * //     Programming
 * //   </div>
 * //   <ul>...</ul>
 * // </li>
 */
function processSkillCategories(skillsList) {
  skillsList.querySelectorAll(':scope > li').forEach((li) => {
    li.classList.add('skill-category')
    const nestedList = li.querySelector('ul')
    const categoryText = li.childNodes[0].textContent.trim()

    const categoryDiv = createCategoryDiv(categoryText)
    li.childNodes[0].textContent = ''
    li.insertBefore(categoryDiv, nestedList)
  })
}

/**
 * Creates a div element containing an icon and text for a skill category.
 *
 * @param {string} categoryText - The text of the skill category
 * @returns {HTMLDivElement} A div element containing the icon and category text
 */
function createCategoryDiv(categoryText) {
  const div = document.createElement('div')
  const icon = document.createElement('i')
  icon.className = getCategoryIcon(categoryText)

  div.appendChild(icon)
  div.appendChild(document.createTextNode(categoryText))
  return div
}

/**
 * Maps skill category names to their corresponding Phosphor icons.
 * Uses pattern matching on the category text to determine the most appropriate icon.
 *
 * @param {string} categoryText - The text of the skill category
 * @returns {string} The CSS classes for the Phosphor icon
 *
 * @example
 * getCategoryIcon('Cloud Computing') // returns 'ph ph-cloud-arrow-up'
 * getCategoryIcon('Database Management') // returns 'ph ph-database'
 * getCategoryIcon('Unknown Category') // returns 'ph ph-toolbox' (default)
 */
function getCategoryIcon(categoryText) {
  const category = categoryText.toLowerCase()
  const iconMap = {
    cloud: 'ph ph-cloud-arrow-up',
    database: 'ph ph-database',
    game: 'ph ph-game-controller',
    graphics: 'ph ph-cube',
    math: 'ph ph-function',
    programming: 'ph ph-code',
    web: 'ph ph-browser',
  }

  return Object.entries(iconMap).find(([key]) => category.includes(key))?.[1] || 'ph ph-toolbox'
}
