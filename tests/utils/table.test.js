import { wrapTablesInContainer } from '../../src/js/utils/table'
import { JSDOM } from 'jsdom'

describe('table utils', () => {
  test('wraps tables in a div with class "table-container"', () => {
    const html = `
      <html>
        <header>
          <div>Some content</div>
        </header>
        <body>
          <table>
            <tr>
              <td>Row 1, Cell 1</td>
              <td>Row 1, Cell 2</td>
            </tr>
            <tr>
              <td>Row 2, Cell 1</td>
              <td>Row 2, Cell 2</td>
            </tr>
          </table>
        </body>
      </html>
    `

    const modifiedHtml = wrapTablesInContainer(html)
    const dom = new JSDOM(modifiedHtml)

    const tableContainers = dom.window.document.querySelectorAll('.table-container')
    expect(tableContainers.length).toBe(1)
    expect(tableContainers[0].tagName).toBe('DIV')
    expect(tableContainers[0].classList.contains('table-container')).toBe(true)
    expect(tableContainers[0].children[0].tagName).toBe('TABLE')
  })
})

describe('table utils - attribute preservation and nesting', () => {
  test('maintains table attributes when wrapping', () => {
    const html = `
      <table id="summary" class="special-table" data-type="summary">
        <tr><td>Data</td></tr>
      </table>
    `

    const result = wrapTablesInContainer(html)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')
    const table = doc.querySelector('table')

    expect(table.id).toBe('summary')
    expect(table.className).toBe('special-table')
    expect(table.dataset.type).toBe('summary')
  })

  test('handles nested tables correctly', () => {
    const html = `
      <table>
        <tr>
          <td>
            <table>
              <tr><td>Nested</td></tr>
            </table>
          </td>
        </tr>
      </table>
    `

    const result = wrapTablesInContainer(html)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')
    const containers = doc.querySelectorAll('.table-container')

    expect(containers.length).toBe(2)
    expect(containers[0].querySelector('.table-container')).not.toBeNull()
  })
})
