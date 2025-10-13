# Changelog

All notable changes to NetCores MCP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-09

### Added
- Initial release of NetCores MCP package
- 8 network analysis tools for AS relationship data:
  - Health check tool for system status
  - Data summary tool for available datasets
  - ASN trend analysis for individual networks
  - Multiple ASN comparison tool
  - Network snapshots information
  - Data refresh capabilities
  - Scheduler status monitoring
  - Manual update triggers
- Interactive Claude Desktop setup utility
- Comprehensive testing suite with unit, integration, and E2E tests
- Cross-platform support (macOS, Windows, Linux)
- Model Context Protocol (MCP) server implementation
- NetCores API client with retry logic and error handling
- CLI interface with multiple command options
- Automated GitHub Actions CI/CD pipeline
- Comprehensive documentation in docs/ directory

### Technical Details
- Node.js 18+ requirement
- Built with @modelcontextprotocol/sdk v0.4.0
- Axios for HTTP client functionality
- Interactive CLI with inquirer and chalk
- Support for both production and development API servers
- JSON Schema validation for tool parameters
- Graceful error handling and user-friendly messages

### Documentation
- Complete installation guide
- API reference documentation
- Troubleshooting guide
- Contributing guidelines
- Usage examples and Claude Desktop integration

### Testing
- Unit tests for core components
- Integration tests for API connectivity
- End-to-end tests for MCP protocol compliance
- Performance benchmarking
- Cross-platform compatibility testing

## [Unreleased]

### Planned
- ESLint configuration and code linting
- TypeScript support and type definitions
- Enhanced error reporting and logging
- Additional network analysis tools
- Performance optimizations
- Expanded test coverage
- NPM registry publication

---

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md with new changes
3. Run full test suite: `npm run test:all`
4. Create git tag: `git tag v1.0.0`
5. Push tag: `git push origin v1.0.0`
6. GitHub Actions will handle publishing