import { processSkillsSection } from '../../src/js/utils/skills'

describe('skills utils', () => {
  let doc

  beforeEach(() => {
    doc = new DOMParser().parseFromString(
      `
      <html>
        <body>
          <h2>Technical Skills</h2>
          <ul>
            <li>Programming</li>
            <li>Web Development</li>
          </ul>
        </body>
      </html>
    `,
      'text/html'
    )
  })

  test('adds CSS class to technical skills list', () => {
    processSkillsSection(doc)
    const skillsList = doc.querySelector('ul')
    expect(skillsList.classList.contains('technical-skills')).toBe(true)
  })

  test('adds skill-category class to first-level list items', () => {
    processSkillsSection(doc)
    const items = doc.querySelectorAll('ul > li')
    items.forEach((item) => {
      expect(item.classList.contains('skill-category')).toBe(true)
    })
  })

  test('adds appropriate icons to skill categories', () => {
    processSkillsSection(doc)
    const programmingItem = doc.querySelector('li:first-child i')
    const webDevItem = doc.querySelector('li:last-child i')

    expect(programmingItem.className).toBe('ph ph-code')
    expect(webDevItem.className).toBe('ph ph-browser')
  })

  test('preserves HTML content within skill items', () => {
    const doc = new DOMParser().parseFromString(
      `
      <h2>Technical Skills</h2>
      <ul>
        <li>Category <strong>with markup</strong>
          <ul>
            <li>Skill <em>with emphasis</em></li>
          </ul>
        </li>
      </ul>
    `,
      'text/html'
    )

    processSkillsSection(doc)
    const category = doc.querySelector('.skill-category')
    expect(category.innerHTML).toContain('<strong>with markup</strong>')
  })
})
