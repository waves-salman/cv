import { processHeadings } from '../../src/js/utils/headings'

describe('headings utils', () => {
  let doc

  beforeEach(() => {
    doc = new DOMParser().parseFromString(
      `
      <html>
        <body>
          <h2>Programming [ph-code]</h2>
          <h2>Regular Heading</h2>
        </body>
      </html>
    `,
      'text/html'
    )
  })

  test('adds icons to headings with icon syntax', () => {
    processHeadings(doc)
    const heading = doc.querySelector('h2:first-child')

    expect(heading.querySelector('i')).not.toBeNull()
    expect(heading.querySelector('i').className).toBe('ph ph-code')
    expect(heading.textContent.trim()).toBe('Programming')
  })

  test('ignores headings without icon syntax', () => {
    processHeadings(doc)
    const heading = doc.querySelector('h2:last-child')

    expect(heading.querySelector('i')).toBeNull()
    expect(heading.textContent.trim()).toBe('Regular Heading')
  })
})
