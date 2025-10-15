# Random User API Test Suite

A TypeScript test automation suite for the Random User API using Jest and modern design patterns.

## Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd randomuser-api-test-automation
npm install

# Run tests
npm test
```

## What's Included

- **API Tests**: Happy path and error handling tests
- **Design Patterns**: 8 professional patterns (Builder, Factory, Observer, etc.)
- **TypeScript**: Full type safety
- **Test Reports**: HTML and JUnit XML reports
- **CI/CD**: GitHub Actions workflow

## Requirements

- Node.js 18+ 
- npm

## Commands

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run build         # Build TypeScript
```

## Test Reports

After running tests, check:
- `test-reports/test-report.html` - Open in browser
- `test-reports/junit.xml` - For CI/CD integration

## Project Structure

```
src/
├── api/              # API client
├── builders/         # Builder pattern
├── commands/         # Command pattern  
├── config/           # Configuration
├── observers/        # Observer pattern
├── strategies/       # Strategy pattern
├── tests/            # All test files
├── types/            # TypeScript types
└── utils/            # Helper functions
```

## Tests Overview

- **23 tests** covering API functionality
- **Happy path**: Valid requests and responses
- **Error handling**: Invalid inputs and edge cases
- **Design patterns**: Demonstrates professional architecture

## API Client Features

- Automatic retries on failure
- Request/response logging
- TypeScript type safety
- Configurable timeouts
- Error handling

## Example Usage

```typescript
import { RandomUserApiClient } from './src/api/randomuser.client';

const client = new RandomUserApiClient();

// Get a single user
const user = await client.getSingleUser();

// Get multiple users
const users = await client.getMultipleUsers(5);

// Filter by gender
const femaleUsers = await client.getUsersByGender('female', 3);
```