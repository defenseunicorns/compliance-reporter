# Contributor Guide

Thank you for your interest in contributing to Pepr! We welcome all contributions and are grateful for your help. This guide outlines how to get started with contributing to this project.

## Table of Contents

- [Contributor Guide](#contributor-guide)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
    - [Setup](#setup)
  - [Submitting a Pull Request](#submitting-a-pull-request)
    - [PR Requirements](#pr-requirements)
  - [Coding Guidelines](#coding-guidelines)
  - [Running Tests](#running-tests)
    - [Run Tests Locally](#run-tests-locally)
  - [Contact](#contact)

## Code of Conduct

Please follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to maintain a respectful and collaborative environment.

## Getting Started

- **Repository**: [https://github.com/defenseunicorns/compliance-reporter](https://github.com/defenseunicorns/compliance-reporter/)
- **npm package**: [https://www.npmjs.com/package/compliance-reporter](https://www.npmjs.com/package/compliance-reporter)
- **Required Node version**: `>=18.0.0`

### Setup

1. Fork the repository.
2. Clone your fork locally: `git clone https://github.com/your-username/compliance-reporter.git`.
3. Install dependencies: `npm ci`.
4. Create a new branch for your feature or fix: `git checkout -b my-feature-branch`.

## Submitting a Pull Request

1. **Create an Issue**: For significant changes, please create an issue first, describing the problem or feature proposal. Trivial fixes do not require an issue.
2. **Commit Your Changes**: Make your changes and commit them. All commits must be signed.
3. **Run Tests**: Ensure that your changes pass all tests.
4. **Push Your Branch**: Push your branch to your fork on GitHub.
5. **Create a Pull Request**: Open a pull request against the `main` branch of the Pepr repository. Please make sure that your PR passes all CI checks.

### PR Requirements

- PRs must be against the `main` branch.
- PRs must pass CI checks.
- All commits must be signed.
- PRs should have a related issue, except for trivial fixes.

We take PR reviews seriously and strive to provide a great contributor experience with timely feedback. To help maintain this, we ask external contributors to limit themselves to no more than two open PRs at a time. Having too many open PRs can slow down the review process and impact the quality of feedback

## Coding Guidelines

Please follow the coding conventions and style used in the project. Use ESLint and Prettier for linting and formatting:

- Check formatting: `npm run format:check`
- Fix formatting: `npm run format:fix`
- If regex is used, provide a link to regex101.com with an explanation of the regex pattern.

## Running Tests

### Run Tests Locally

- Run unit tests: `npm run test:unit`
- Run e2e tests: `npm run test:e2e`

## Contact

For any questions or concerns, please open an issue on GitHub or contact the maintainers.
