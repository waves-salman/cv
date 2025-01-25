import { processTimelineEntries } from '../../src/js/utils/timeline'

describe('timeline utils', () => {
  let doc

  beforeEach(() => {
    doc = new DOMParser().parseFromString(
      `
      <html>
        <body>
          <h3>Software Engineer [2020-2022] | <a href="https://company-x.com">Company X</a></h3>
          <h3>Junior Developer [2018-2020] | Company Y</h3>
        </body>
      </html>
    `,
      'text/html'
    )
  })

  test('formats timeline entries correctly', () => {
    processTimelineEntries(doc)

    // Check first entry
    const firstEntry = doc.querySelector('.timeline-entry')
    const firstEntryMeta = firstEntry.nextElementSibling

    expect(firstEntry.tagName).toBe('H3')
    expect(firstEntry.classList.contains('timeline-entry')).toBe(true)
    expect(firstEntry.textContent.trim()).toBe('Software Engineer')

    expect(firstEntryMeta.classList.contains('timeline-meta')).toBe(true)
    const organizationLink = firstEntryMeta.querySelector('.organization a')
    expect(organizationLink).not.toBeNull()
    expect(organizationLink.href).toBe('https://company-x.com/')
    expect(organizationLink.textContent).toBe('Company X')
  })

  test('handles entries without organization links', () => {
    processTimelineEntries(doc)

    const secondEntry = doc.querySelectorAll('.timeline-entry')[1]
    const secondEntryMeta = secondEntry.nextElementSibling

    expect(secondEntry.textContent.trim()).toBe('Junior Developer')
    expect(secondEntryMeta.querySelector('.organization').textContent).toBe('Company Y')
    expect(secondEntryMeta.querySelector('.organization a')).toBeNull()
  })

  test('handles h3 elements without timeline format', () => {
    const docWithMixedH3 = new DOMParser().parseFromString(
      `
      <html>
        <body>
          <h3>Software Engineer [2020-2022] | <a href="https://company-x.com">Company X</a></h3>
          <h3>Regular Heading</h3>
        </body>
      </html>
    `,
      'text/html'
    )

    processTimelineEntries(docWithMixedH3)

    expect(docWithMixedH3.querySelectorAll('.timeline-entry').length).toBe(1)
    expect(docWithMixedH3.querySelector('h3:last-child').textContent).toBe('Regular Heading')
  })

  test('preserves complex organization links', () => {
    const docWithComplexLink = new DOMParser().parseFromString(
      `
      <html>
        <body>
          <h3>Engineer [2024-Present] | <a href="https://torchbox.com" class="org-link">Torchbox Ltd.</a></h3>
        </body>
      </html>
    `,
      'text/html'
    )

    processTimelineEntries(docWithComplexLink)

    const entryMeta = docWithComplexLink.querySelector('.timeline-meta')
    const organizationLink = entryMeta.querySelector('.organization a')

    expect(organizationLink.href).toBe('https://torchbox.com/')
    expect(organizationLink.textContent).toBe('Torchbox Ltd.')
    expect(organizationLink.className).toBe('org-link')
  })
})

describe('timeline utils - content formatting and date handling', () => {
  test('handles entries with special characters in organization names', () => {
    const doc = new DOMParser().parseFromString(
      `
      <h3>Developer [2020-2021] | Organization & Co. (Ltd.)</h3>
    `,
      'text/html'
    )

    processTimelineEntries(doc)
    const organization = doc.querySelector('.organization')
    expect(organization.textContent).toBe('Organization & Co. (Ltd.)')
  })

  test('preserves HTML formatting in entry titles', () => {
    const doc = new DOMParser().parseFromString(
      `
      <h3>Senior <em>Frontend</em> Developer [2020-2021] | Organization</h3>
    `,
      'text/html'
    )

    processTimelineEntries(doc)
    const entry = doc.querySelector('.timeline-entry')
    expect(entry.innerHTML).toContain('<em>Frontend</em>')
  })

  test('handles multiple date formats consistently', () => {
    const doc = new DOMParser().parseFromString(
      `
      <h3>Developer [Jan 2020 - Present] | Organization A</h3>
      <h3>Developer [2020 - 2021] | Organization B</h3>
      <h3>Developer [01/2020 - 12/2021] | Organization C</h3>
    `,
      'text/html'
    )

    processTimelineEntries(doc)
    const periods = doc.querySelectorAll('.period')
    expect(periods.length).toBe(3)
    periods.forEach((period) => {
      expect(period.textContent.trim()).not.toBe('')
    })
  })
})
