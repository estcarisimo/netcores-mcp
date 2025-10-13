#!/usr/bin/env node
/**
 * Unit tests for NetCores API Client
 */

const NetCoresAPIClient = require('../../src/client');

class ClientTests {
  constructor() {
    this.passed = 0;
    this.failed = 0;
  }

  async runTests() {
    console.log('🧪 Running NetCores API Client Unit Tests\n');

    await this.testClientInitialization();
    await this.testUrlNormalization();
    await this.testRetryLogic();
    await this.testErrorHandling();

    console.log(`\n📊 Unit Test Results:`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    return this.failed === 0;
  }

  async testClientInitialization() {
    console.log('📋 Testing client initialization...');
    
    try {
      // Test default initialization
      const client1 = new NetCoresAPIClient();
      this.assert(client1.baseUrl === 'https://netcores.fi.uba.ar', 'Default URL should be production server');
      this.assert(client1.timeout === 30000, 'Default timeout should be 30 seconds');
      
      // Test custom initialization
      const client2 = new NetCoresAPIClient('http://localhost:8889', { timeout: 5000 });
      this.assert(client2.baseUrl === 'http://localhost:8889', 'Custom URL should be set');
      this.assert(client2.timeout === 5000, 'Custom timeout should be set');
      
      // Test URL normalization (trailing slash removal)
      const client3 = new NetCoresAPIClient('http://example.com/');
      this.assert(client3.baseUrl === 'http://example.com', 'Trailing slash should be removed');
      
      console.log('✅ Client initialization tests passed');
    } catch (error) {
      console.log(`❌ Client initialization tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testUrlNormalization() {
    console.log('📋 Testing URL normalization...');
    
    try {
      const testCases = [
        { input: 'http://example.com/', expected: 'http://example.com' },
        { input: 'https://api.test.com', expected: 'https://api.test.com' },
        { input: 'http://localhost:8889/', expected: 'http://localhost:8889' }
      ];
      
      for (const testCase of testCases) {
        const client = new NetCoresAPIClient(testCase.input);
        this.assert(client.baseUrl === testCase.expected, 
          `URL ${testCase.input} should normalize to ${testCase.expected}`);
      }
      
      console.log('✅ URL normalization tests passed');
    } catch (error) {
      console.log(`❌ URL normalization tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testRetryLogic() {
    console.log('📋 Testing retry configuration...');
    
    try {
      const client = new NetCoresAPIClient('http://localhost:8889', {
        retryAttempts: 5,
        retryDelay: 500
      });
      
      this.assert(client.retryAttempts === 5, 'Retry attempts should be configurable');
      this.assert(client.retryDelay === 500, 'Retry delay should be configurable');
      
      console.log('✅ Retry logic tests passed');
    } catch (error) {
      console.log(`❌ Retry logic tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testErrorHandling() {
    console.log('📋 Testing error handling...');
    
    try {
      const client = new NetCoresAPIClient('http://nonexistent.invalid');
      
      // Test connection failure handling
      const result = await client.testConnection();
      this.assert(result.success === false, 'Failed connection should return success: false');
      this.assert(typeof result.error === 'string', 'Error should be included in result');
      
      console.log('✅ Error handling tests passed');
    } catch (error) {
      console.log(`❌ Error handling tests failed: ${error.message}`);
      this.failed++;
    }
  }

  assert(condition, message) {
    if (condition) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tests = new ClientTests();
  tests.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = ClientTests;