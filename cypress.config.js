// eslint-disable-next-line @typescript-eslint/no-require-imports
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents() {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    // Aumentar timeouts para dar tiempo a Next.js a renderizar
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
  },
});
