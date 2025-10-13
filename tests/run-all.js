#!/usr/bin/env node
/**
 * Test runner for all NetCores MCP tests
 */

const path = require('path');

// Import test classes
const ClientTests = require('./unit/client.test');
const ToolsTests = require('./unit/tools.test');
const APIIntegrationTests = require('./integration/api.test');
const MCPProtocolTests = require('./e2e/mcp.test');

class TestRunner {
  constructor() {
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.suiteResults = [];
  }

  async runAllTests(options = {}) {
    console.log('🚀 NetCores MCP Test Suite\n');
    console.log('================================================\n');

    const suites = [
      { name: 'Unit Tests - Client', class: ClientTests, type: 'unit' },
      { name: 'Unit Tests - Tools', class: ToolsTests, type: 'unit' },
      { name: 'Integration Tests - API', class: APIIntegrationTests, type: 'integration' },
      { name: 'E2E Tests - MCP Protocol', class: MCPProtocolTests, type: 'e2e' }
    ];

    for (const suite of suites) {
      // Skip certain test types if requested
      if (options.skipIntegration && suite.type === 'integration') {
        console.log(`⏭️  Skipping ${suite.name} (integration tests disabled)\n`);
        continue;
      }
      if (options.skipE2E && suite.type === 'e2e') {
        console.log(`⏭️  Skipping ${suite.name} (e2e tests disabled)\n`);
        continue;
      }

      console.log(`🏃 Running ${suite.name}...`);
      console.log('------------------------------------------------');

      try {
        const testInstance = new suite.class(options.apiUrl);
        const success = await testInstance.runTests();
        
        this.suiteResults.push({
          name: suite.name,
          success: success,
          passed: testInstance.passed || 0,
          failed: testInstance.failed || 0
        });

        this.totalPassed += testInstance.passed || 0;
        this.totalFailed += testInstance.failed || 0;

      } catch (error) {
        console.log(`❌ ${suite.name} failed to run: ${error.message}`);
        this.suiteResults.push({
          name: suite.name,
          success: false,
          passed: 0,
          failed: 1,
          error: error.message
        });
        this.totalFailed += 1;
      }

      console.log(''); // Add spacing
    }

    this.printSummary();
    return this.totalFailed === 0;
  }

  printSummary() {
    console.log('================================================');
    console.log('🏁 Test Suite Summary\n');

    for (const result of this.suiteResults) {
      const status = result.success ? '✅' : '❌';
      const stats = result.error ? 
        `Error: ${result.error}` : 
        `Passed: ${result.passed}, Failed: ${result.failed}`;
      
      console.log(`${status} ${result.name}: ${stats}`);
    }

    console.log('\n📊 Overall Results:');
    console.log(`✅ Total Passed: ${this.totalPassed}`);
    console.log(`❌ Total Failed: ${this.totalFailed}`);
    
    const successRate = this.totalPassed + this.totalFailed > 0 ? 
      Math.round((this.totalPassed / (this.totalPassed + this.totalFailed)) * 100) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.totalFailed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n💥 Some tests failed. Check the output above for details.');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NetCores MCP Test Runner

Usage: node tests/run-all.js [options]

Options:
  --help, -h              Show this help message
  --skip-integration      Skip integration tests (API connectivity required)
  --skip-e2e              Skip end-to-end tests (may be slow)
  --unit-only             Run only unit tests
  --api-url <url>         Use specific API URL for integration tests

Examples:
  node tests/run-all.js                                    # Run all tests
  node tests/run-all.js --unit-only                       # Unit tests only
  node tests/run-all.js --skip-integration                # Skip API tests
  node tests/run-all.js --api-url http://localhost:8889   # Custom API URL
`);
    return;
  }

  const options = {};

  // Parse options
  if (args.includes('--skip-integration')) {
    options.skipIntegration = true;
  }
  if (args.includes('--skip-e2e')) {
    options.skipE2E = true;
  }
  if (args.includes('--unit-only')) {
    options.skipIntegration = true;
    options.skipE2E = true;
  }

  // Parse API URL
  const apiUrlIndex = args.indexOf('--api-url');
  if (apiUrlIndex !== -1 && args[apiUrlIndex + 1]) {
    options.apiUrl = args[apiUrlIndex + 1];
  }

  const runner = new TestRunner();
  const success = await runner.runAllTests(options);
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;