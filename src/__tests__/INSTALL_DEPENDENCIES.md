# Install Test Dependencies

Run this command to install all required test dependencies:

```bash
cd eazseller
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/ui jsdom
```

## Add Test Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

## Verify Installation

After installing, verify the setup:

```bash
npm test
```

This should start Vitest and show the test runner.



