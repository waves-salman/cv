import { createContactItem, createHeaderFromFrontMatter } from '../../src/js/utils/header'

describe('header utils', () => {
  describe('createContactItem', () => {
    test('creates item with icon and span when no href provided', () => {
      const item = createContactItem('icon-class', 'content')

      expect(item.querySelector('i').className).toBe('ph icon-class')
      expect(item.querySelector('span').textContent).toBe('content')
      expect(item.querySelector('a')).toBeNull()
    })

    test('creates item with icon and anchor when href provided', () => {
      const item = createContactItem('icon-class', 'content', 'https://example.com', true)

      expect(item.querySelector('i').className).toBe('ph icon-class')
      expect(item.querySelector('a').href).toBe('https://example.com/')
      expect(item.querySelector('a').target).toBe('_blank')
    })

    test('creates anchor without target="_blank" when targetBlank is false', () => {
      const item = createContactItem('icon-class', 'content', 'https://example.com', false)

      expect(item.querySelector('a').target).toBe('')
    })
  })

  describe('createHeaderFromFrontMatter', () => {
    beforeEach(() => {
      document.body.innerHTML = '<header></header>'
    })

    test('creates header with title and headline', () => {
      const metadata = {
        title: 'John Doe',
        headline: 'Software Engineer',
      }

      createHeaderFromFrontMatter(metadata)

      const header = document.querySelector('header')
      expect(header.querySelector('h1').textContent).toBe('John Doe')
      expect(header.querySelector('.headline').textContent).toBe('Software Engineer')
    })

    test('does nothing when header element is not found', () => {
      document.body.innerHTML = ''
      const metadata = { title: 'John Doe' }

      expect(() => createHeaderFromFrontMatter(metadata)).not.toThrow()
    })

    test('creates all social media contact items with correct formatting', () => {
      const metadata = {
        title: 'John Doe',
        website: 'https://example.com',
        email: 'john@example.com',
        phone: '+1234567890',
        github: '@johndoe',
        linked_in: 'https://linkedin.com/in/johndoe',
        mastodon: '@johndoe@mastodon.social',
        x: '@johndoe',
        stackoverflow: 'https://stackoverflow.com/users/123456/johndoe',
      }

      createHeaderFromFrontMatter(metadata)
      const contactSection = document.querySelector('.contact-details')

      // Website
      expect(contactSection.querySelector('[href="https://example.com"]')).not.toBeNull()
      expect(contactSection.querySelector('[href="https://example.com"]').textContent).toBe(
        'example.com'
      )

      // Email
      expect(contactSection.querySelector('[href="mailto:john@example.com"]')).not.toBeNull()

      // Phone
      expect(contactSection.querySelector('[href="tel:+1234567890"]')).not.toBeNull()

      // GitHub
      const githubLink = contactSection.querySelector('[href="https://github.com/johndoe"]')
      expect(githubLink).not.toBeNull()
      expect(githubLink.textContent).toBe('@johndoe')

      // LinkedIn
      const linkedInLink = contactSection.querySelector('[href="https://linkedin.com/in/johndoe"]')
      expect(linkedInLink).not.toBeNull()
      expect(linkedInLink.textContent).toBe('johndoe')

      // Mastodon
      const mastodonLink = contactSection.querySelector(
        '[href="https://mastodon.social/@johndoe@mastodon.social"]'
      )
      expect(mastodonLink).not.toBeNull()
      expect(mastodonLink.textContent).toBe('@johndoe@mastodon.social')

      // X (Twitter)
      const xLink = contactSection.querySelector('[href="https://x.com/johndoe"]')
      expect(xLink).not.toBeNull()
      expect(xLink.textContent).toBe('@johndoe')

      // Stack Overflow
      const stackOverflowLink = contactSection.querySelector(
        '[href="https://stackoverflow.com/users/123456/johndoe"]'
      )
      expect(stackOverflowLink).not.toBeNull()
      expect(stackOverflowLink.textContent).toBe('SO/123456')
    })

    test('handles missing social media information gracefully', () => {
      const metadata = {
        title: 'John Doe',
        email: 'john@example.com',
      }

      createHeaderFromFrontMatter(metadata)
      const contactSection = document.querySelector('.contact-details')

      // Only email link should be present
      expect(contactSection.querySelectorAll('a').length).toBe(1)
      expect(contactSection.querySelector('[href="mailto:john@example.com"]')).not.toBeNull()

      // Other social media links should not exist
      expect(contactSection.querySelector('[href*="github.com"]')).toBeNull()
      expect(contactSection.querySelector('[href*="linkedin.com"]')).toBeNull()
      expect(contactSection.querySelector('[href*="mastodon.social"]')).toBeNull()
      expect(contactSection.querySelector('[href*="x.com"]')).toBeNull()
      expect(contactSection.querySelector('[href*="stackoverflow.com"]')).toBeNull()
    })

    test('handles malformed social media URLs gracefully', () => {
      const metadata = {
        title: 'John Doe',
        linked_in: 'invalid-url',
        stackoverflow: 'invalid-stackoverflow-url',
      }

      expect(() => createHeaderFromFrontMatter(metadata)).not.toThrow()
    })
  })
})
