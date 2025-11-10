# Contributing to TypeScript Mastery

Thank you for your interest in contributing to TypeScript Mastery! This repository aims to be the most comprehensive TypeScript learning resource available, and we welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Contribution Guidelines](#contribution-guidelines)
- [Style Guide](#style-guide)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a code of conduct that we expect all participants to uphold. Please be respectful, inclusive, and considerate in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Code examples** (if applicable)
- **TypeScript version** and environment details
- **Screenshots** (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a **clear and descriptive title**
- Provide a **step-by-step description** of the enhancement
- Explain **why this enhancement would be useful**
- Include **code examples** to demonstrate the enhancement

### Contributing Code

We welcome contributions in these areas:

1. **New Examples**: Add clear, well-documented examples
2. **Exercises**: Create challenging exercises with solutions
3. **Documentation**: Improve clarity and completeness
4. **Bug Fixes**: Fix errors in code or documentation
5. **New Modules**: Add new learning modules or sections
6. **Translations**: Help translate content
7. **Visualizations**: Add diagrams, charts, or animations

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/typescript-mastery.git
   cd typescript-mastery
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/typescript-mastery.git
   ```

4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/my-new-feature
   ```

5. **Install dependencies**:
   ```bash
   npm install
   ```

## Contribution Guidelines

### Code Examples

- **Clarity over cleverness**: Prioritize readable, understandable code
- **Progressive complexity**: Start simple, build up complexity gradually
- **Comprehensive comments**: Explain the "why" not just the "what"
- **Type safety**: Demonstrate proper TypeScript usage
- **Real-world relevance**: Use practical, realistic examples
- **No console errors**: Ensure all examples compile without errors

Example format:
```typescript
/**
 * Brief description of what this example demonstrates
 *
 * Key concepts:
 * - Concept 1
 * - Concept 2
 */

// Step 1: Define the basic structure
interface User {
  id: number;
  name: string;
}

// Step 2: Implement functionality
function getUser(id: number): User {
  // Implementation details with explanations
  return { id, name: "John Doe" };
}

// Step 3: Demonstrate usage
const user = getUser(1);
console.log(user.name); // Output: John Doe
```

### Exercises

Each exercise should include:

1. **Clear objective**: What should the learner accomplish?
2. **Requirements**: Specific technical requirements
3. **Hints**: Optional hints for stuck learners
4. **Solution**: Complete, well-documented solution in `/solutions`
5. **Difficulty rating**: Beginner, Intermediate, or Advanced

Exercise template:
```markdown
## Exercise: [Title]

**Difficulty**: [Beginner/Intermediate/Advanced]

**Objective**: [What you'll build/learn]

### Requirements

1. Requirement 1
2. Requirement 2
3. Requirement 3

### Hints

<details>
<summary>Click for hint 1</summary>
Hint content here
</details>

### Solution

See [solution.ts](./solutions/exercise-name.ts) for the complete solution.
```

### Documentation

- Use **clear, concise language**
- Follow **existing formatting** and structure
- Include **code examples** where helpful
- Link to **official TypeScript docs** for reference
- Keep **table of contents** updated
- Use **proper markdown formatting**

### Testing

If adding code that should be runnable:

- Ensure code **compiles without errors**
- Include a **package.json** if dependencies are needed
- Add **TypeScript configuration** (tsconfig.json)
- Include **instructions** for running the code

## Style Guide

### TypeScript Code Style

- Use **2 spaces** for indentation
- Use **semicolons**
- Use **single quotes** for strings (unless template literals)
- Use **PascalCase** for types, interfaces, classes
- Use **camelCase** for variables, functions
- Use **UPPER_CASE** for constants
- Prefer **const** over **let**, never use **var**
- Use **arrow functions** for callbacks
- Include **JSDoc comments** for complex functions

Good example:
```typescript
/**
 * Calculates the total price including tax
 * @param price - The base price
 * @param taxRate - The tax rate as a decimal (e.g., 0.1 for 10%)
 * @returns The total price with tax
 */
const calculateTotalPrice = (price: number, taxRate: number): number => {
  return price * (1 + taxRate);
};

const STANDARD_TAX_RATE = 0.1;
const total = calculateTotalPrice(100, STANDARD_TAX_RATE);
```

### Markdown Style

- Use **ATX-style headers** (#, ##, ###)
- Include **blank lines** around headers
- Use **fenced code blocks** with language tags
- Use **tables** for structured data
- Use **lists** for sequential items
- Include **links** to related resources

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(module-1): add examples for type inference

Add three new examples demonstrating type inference with:
- Variable declarations
- Function return types
- Array types

Closes #123
```

```
docs(readme): update installation instructions

- Add pnpm installation option
- Update Node.js version requirement to 18+
- Fix broken link to Module 1
```

```
fix(module-2): correct generics example

The previous example had a compilation error due to incorrect
constraint syntax. This commit fixes the constraint and adds
additional comments for clarity.
```

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Update the README.md** if necessary
3. **Add tests** if applicable
4. **Ensure TypeScript compiles** without errors
5. **Follow the style guide**
6. **Write clear commit messages**
7. **Reference related issues** in your PR description

### PR Template

```markdown
## Description
Brief description of what this PR accomplishes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Other (please describe)

## Related Issues
Fixes #(issue number)

## Checklist
- [ ] Code follows the style guide
- [ ] Documentation has been updated
- [ ] All examples compile without errors
- [ ] Commit messages follow guidelines
- [ ] I have tested the changes locally

## Screenshots (if applicable)
Add screenshots to help explain your changes
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be credited in the repository

## Recognition

Contributors will be recognized in:
- The repository's README
- Release notes
- The contributors graph

## Questions?

If you have questions:
- Check existing [issues](https://github.com/OWNER/typescript-mastery/issues)
- Open a new [discussion](https://github.com/OWNER/typescript-mastery/discussions)
- Tag maintainers in your issue/PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TypeScript Mastery! Your efforts help developers worldwide learn TypeScript effectively.
