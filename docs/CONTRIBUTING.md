# Contributing to NetCores MCP

Thank you for your interest in contributing to NetCores MCP! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm latest version
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/estcarisimo/netcores-mcp.git
cd netcores-mcp

# Install dependencies
npm install

# Run tests
npm test

# Test MCP functionality
npm run test:mcp

# Test API connectivity
npm run test:api
```

## Project Structure

```
netcores-mcp/
├── src/                    # Source code
│   ├── server.js          # Main MCP server
│   ├── client.js          # NetCores API client
│   ├── tools.js           # MCP tools implementation
│   ├── setup.js           # Claude Desktop setup utility
│   └── test.js            # Testing utilities
├── bin/                   # Executable scripts
├── docs/                  # Documentation
├── tests/                 # Test suites
├── examples/              # Usage examples
└── .github/               # GitHub workflows
```

## How to Contribute

### Reporting Bugs
1. Check existing issues first
2. Use the bug report template
3. Include system information
4. Provide steps to reproduce
5. Include error messages and logs

### Suggesting Features
1. Check existing feature requests
2. Use the feature request template
3. Describe the use case
4. Explain the expected behavior
5. Consider implementation approaches

### Code Contributions

#### 1. Fork and Branch
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/netcores-mcp.git

# Create a feature branch
git checkout -b feature/your-feature-name
```

#### 2. Make Changes
- Follow the coding standards (see below)
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

#### 3. Test Your Changes
```bash
# Run all tests
npm test

# Test MCP protocol
npm run test:mcp

# Test API connectivity
npm run test:api

# Test specific functionality
node src/test.js --tools
```

#### 4. Submit Pull Request
- Use the pull request template
- Describe your changes clearly
- Reference related issues
- Ensure CI checks pass

## Coding Standards

### JavaScript Style
- Use ES6+ features where appropriate
- Prefer `const` and `let` over `var`
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions focused and small

### Error Handling
- Always handle errors gracefully
- Return user-friendly error messages
- Include context in error messages
- Use try-catch for async operations

### Testing
- Write tests for new functionality
- Test both success and error cases
- Include integration tests for API changes
- Ensure tests are deterministic

### Documentation
- Update README.md for user-facing changes
- Update API.md for tool changes
- Add examples for new features
- Keep CHANGELOG.md updated

## Code Review Process

### For Contributors
1. Ensure your code follows the style guide
2. Add comprehensive tests
3. Update relevant documentation
4. Keep commits focused and well-described
5. Respond to review feedback promptly

### For Maintainers
1. Review code for correctness and style
2. Test functionality manually
3. Check documentation updates
4. Verify test coverage
5. Ensure backward compatibility

## Testing Guidelines

### Unit Tests
- Test individual functions and modules
- Mock external dependencies
- Cover edge cases and error conditions
- Use descriptive test names

### Integration Tests
- Test MCP protocol compliance
- Test API client functionality
- Test end-to-end workflows
- Test against both API servers

### Manual Testing
- Test Claude Desktop integration
- Test on multiple platforms
- Test with different Node.js versions
- Verify installation process

## Documentation Standards

### Code Documentation
```javascript
/**
 * Execute a NetCores MCP tool
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} params - Tool parameters
 * @returns {Promise<string>} Formatted tool response
 * @throws {Error} When tool execution fails
 */
async function executeTool(toolName, params = {}) {
  // Implementation
}
```

### API Documentation
- Include parameter descriptions
- Provide example usage
- Document return values
- Note any breaking changes

### User Documentation
- Use clear, simple language
- Include practical examples
- Cover common use cases
- Provide troubleshooting steps

## Release Process

### Version Numbering
- Follow semantic versioning (semver)
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Release Checklist
1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Create release tag
5. GitHub Actions handles publishing

## Community Guidelines

### Be Respectful
- Use inclusive language
- Be patient with newcomers
- Provide constructive feedback
- Help others learn

### Communication
- Use clear, descriptive issue titles
- Provide context in discussions
- Tag relevant maintainers
- Follow up on your contributions

## Development Tips

### Local Testing
```bash
# Test against different API servers
NETCORES_API_URL=https://netcores.fi.uba.ar npm test

# Test specific tools
node -e "
const tools = require('./src/tools');
const t = new tools();
t.executeTool('netcores_health_check').then(console.log);
"

# Debug MCP protocol
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node src/server.js
```

### Performance Considerations
- Minimize API calls
- Use appropriate timeouts
- Handle rate limiting gracefully
- Cache results when appropriate

### Security Considerations
- Never expose API keys or tokens
- Validate all user inputs
- Use secure communication protocols
- Handle sensitive data appropriately

## Getting Help

### For Contributors
- Read the documentation thoroughly
- Check existing issues and PRs
- Ask questions in GitHub discussions
- Join community channels if available

### For Maintainers
- Review PRs promptly
- Provide helpful feedback
- Maintain test coverage
- Keep documentation updated

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Package.json contributors field
- Community acknowledgments

Thank you for contributing to NetCores MCP! 🚀