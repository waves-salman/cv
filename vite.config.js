import path from 'node:path'
import process from 'node:process'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown'
import { parse as parseYaml } from 'yaml'

// Read and parse the CV markdown file
const cvPath = path.resolve('src/cv.md')
const cvContent = fs.readFileSync(cvPath, 'utf-8')
// Extract YAML frontmatter - matches content between opening and closing '---' delimiters
const frontMatterMatch = cvContent.match(/^---\n([\s\S]*?)\n---/)
const cvData = frontMatterMatch ? parseYaml(frontMatterMatch[1]) : {}

/**
 * Creates a sanitized base path from a repository or project name.
 * Used for configuring Vite's base URL in different deployment environments.
 *
 * @param {string} name - Repository or project name to convert into a path
 * @returns {string} Sanitized path starting and ending with '/', or just '/' if invalid input
 * @example
 * createBasePath('my-repo') // returns '/my-repo/'
 * createBasePath('my/repo') // returns '/myrepo/'
 * createBasePath('') // returns '/'
 */
const createBasePath = (name) => {
  if (!name) return '/'
  // Remove any special characters that might cause issues in URLs
  const sanitizedName = name.replace(/[^\w-]/g, '')
  return sanitizedName ? `/${sanitizedName}/` : '/'
}

/**
 * Determines the appropriate base path for Vite based on the deployment environment.
 * Supports GitHub Actions and GitLab CI deployments, with a fallback for local development.
 *
 * Environment variables used:
 * - GITHUB_ACTIONS: Present when running in GitHub Actions
 * - GITHUB_REPOSITORY: Format "username/repo-name"
 * - CI_PROJECT_PATH: GitLab CI project path
 *
 * References:
 * https://vite.dev/guide/static-deploy.html#github-pages
 * https://vite.dev/guide/static-deploy.html#gitlab-pages-and-gitlab-ci
 * https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
 * https://docs.gitlab.com/ee/ci/variables/predefined_variables.html
 *
 * @returns {string} Base path for Vite configuration
 * @example
 * // In GitHub Actions with GITHUB_REPOSITORY="user/my-repo"
 * getBasePathFromEnv() // returns '/my-repo/'
 *
 * // In GitLab CI with CI_PROJECT_PATH="group/my-project"
 * getBasePathFromEnv() // returns '/my-project/'
 *
 * // In local development
 * getBasePathFromEnv() // returns '/'
 */
const getBasePathFromEnv = () => {
  if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY) {
    const [, repoName] = process.env.GITHUB_REPOSITORY.split('/')
    return createBasePath(repoName)
  }

  if (process.env.CI_PROJECT_PATH) {
    const projectName = process.env.CI_PROJECT_PATH.split('/').pop()
    return createBasePath(projectName)
  }

  return '/'
}

/**
 * Determines the full base URL for the deployed application.
 * Handles multiple deployment scenarios:
 * - GitHub Pages
 * - GitLab Pages
 * - Custom domain from package.json
 * - Vercel
 * - Netlify
 * - Local development
 *
 * @returns {string} The complete base URL for the deployed application
 */
function getBaseUrl() {
  // Development environment
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5173/'
  }

  // GitHub Pages
  if (process.env.GITHUB_ACTIONS) {
    return `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io${getBasePathFromEnv()}`
  }

  // GitLab Pages
  if (process.env.CI_PROJECT_PATH) {
    return `https://${process.env.CI_PROJECT_ROOT_NAMESPACE}.gitlab.io${getBasePathFromEnv()}`
  }

  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Netlify
  if (process.env.NETLIFY) {
    return process.env.URL || `https://${process.env.NETLIFY_SITE_NAME}.netlify.app`
  }

  // Try to get URL from package.json homepage
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'))
    if (pkg.homepage) {
      // Ensure homepage ends with a trailing slash
      return pkg.homepage.endsWith('/') ? pkg.homepage : `${pkg.homepage}/`
    }
  } catch (error) {
    console.warn('Could not read package.json homepage:', error.message)
  }

  // Production fallback - should be overridden by deployment platform or package.json
  console.warn('Could not determine base URL. Meta tags may not work correctly.')
  return '/'
}

export default defineConfig({
  base: getBasePathFromEnv(),

  server: {
    open: process.env.NODE_ENV === 'development' ? 'index.html' : false,
  },
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: { '/src': path.resolve(process.cwd(), 'src') },
  },
  plugins: [
    mdPlugin({
      mode: [Mode.MARKDOWN],
    }),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html
          .replace(/%__CV_DATA__\.(\w+)%/g, (_, key) => cvData[key])
          .replace(/%__BASE_URL__%/g, getBaseUrl())
      },
    },
  ],
  test: {
    include: ['../tests/**/*.test.js'],
    coverage: {
      all: true,
      provider: 'v8',
      reportsDirectory: '../coverage',
    },
    environment: 'jsdom',
    globals: true,
    watch: false,
  },
})
