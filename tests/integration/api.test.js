#!/usr/bin/env node
/**
 * Integration tests for NetCores API connectivity
 */

const NetCoresAPIClient = require('../../src/client');
const NetCoresTools = require('../../src/tools');

class APIIntegrationTests {
  constructor(apiUrl) {
    this.apiUrl = apiUrl || process.env.NETCORES_API_URL || 'https://netcores.fi.uba.ar';
    this.client = new NetCoresAPIClient(this.apiUrl);
    this.tools = new NetCoresTools(this.apiUrl);
    this.passed = 0;
    this.failed = 0;
  }

  async runTests() {
    console.log('🧪 Running NetCores API Integration Tests\n');
    console.log(`🌐 Testing against: ${this.apiUrl}\n`);

    await this.testAPIConnectivity();
    await this.testHealthEndpoint();
    await this.testDataSummaryEndpoint();
    await this.testSnapshotsEndpoint();
    await this.testASNTrendEndpoint();

    console.log(`\n📊 Integration Test Results:`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    return this.failed === 0;
  }

  async testAPIConnectivity() {
    console.log('📋 Testing basic API connectivity...');
    
    try {
      const result = await this.client.testConnection();
      
      if (result.success) {
        this.assert(true, 'API connection successful');
        this.assert(typeof result.status === 'string', 'Status should be string');
        this.assert(typeof result.version === 'string', 'Version should be string');
        console.log(`   Status: ${result.status}`);
        console.log(`   Version: ${result.version}`);
        console.log('✅ API connectivity tests passed');
      } else {
        console.log(`⚠️  API connectivity failed: ${result.error}`);
        console.log('   Continuing with tests (may fail)...');
        this.failed++;
      }
    } catch (error) {
      console.log(`❌ API connectivity tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testHealthEndpoint() {
    console.log('📋 Testing health endpoint...');
    
    try {
      const result = await this.client.healthCheck();
      
      this.assert(typeof result === 'object', 'Health result should be object');
      this.assert(typeof result.status === 'string', 'Status should be string');
      
      if (result.database) {
        this.assert(typeof result.database.status === 'string', 'Database status should be string');
      }
      
      console.log('✅ Health endpoint tests passed');
    } catch (error) {
      console.log(`❌ Health endpoint tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testDataSummaryEndpoint() {
    console.log('📋 Testing data summary endpoint...');
    
    try {
      const result = await this.client.getDataSummary();
      
      this.assert(typeof result === 'object', 'Data summary should be object');
      
      // Check for IPv4 or IPv6 data
      const hasIPv4 = result.ipv4 !== undefined;
      const hasIPv6 = result.ipv6 !== undefined;
      this.assert(hasIPv4 || hasIPv6, 'Should have IPv4 or IPv6 data');
      
      if (result.ipv4) {
        this.assert(typeof result.ipv4.snapshot_count === 'number', 'IPv4 snapshot count should be number');
      }
      
      if (result.ipv6) {
        this.assert(typeof result.ipv6.snapshot_count === 'number', 'IPv6 snapshot count should be number');
      }
      
      console.log('✅ Data summary endpoint tests passed');
    } catch (error) {
      console.log(`❌ Data summary endpoint tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testSnapshotsEndpoint() {
    console.log('📋 Testing snapshots endpoint...');
    
    try {
      const result = await this.client.getSnapshots();
      
      this.assert(typeof result === 'object', 'Snapshots result should be object');
      
      // Check for IPv4 or IPv6 snapshots
      const hasIPv4 = result.ipv4 !== undefined;
      const hasIPv6 = result.ipv6 !== undefined;
      this.assert(hasIPv4 || hasIPv6, 'Should have IPv4 or IPv6 snapshots');
      
      if (result.ipv4 && Array.isArray(result.ipv4)) {
        for (const snapshot of result.ipv4.slice(0, 3)) { // Check first few
          this.assert(typeof snapshot.date === 'string', 'Snapshot date should be string');
        }
      }
      
      console.log('✅ Snapshots endpoint tests passed');
    } catch (error) {
      console.log(`❌ Snapshots endpoint tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testASNTrendEndpoint() {
    console.log('📋 Testing ASN trend endpoint...');
    
    try {
      // Test with Google's ASN
      const result = await this.client.getASNTrend(15169, { ipVersion: 'ipv4' });
      
      this.assert(typeof result === 'object', 'ASN trend result should be object');
      this.assert(typeof result.ip_version === 'string', 'IP version should be string');
      
      if (result.trend_data && Array.isArray(result.trend_data)) {
        if (result.trend_data.length > 0) {
          const dataPoint = result.trend_data[0];
          this.assert(typeof dataPoint.date === 'string', 'Data point date should be string');
          this.assert(typeof dataPoint.shell_index === 'number', 'Shell index should be number');
        }
      }
      
      console.log('✅ ASN trend endpoint tests passed');
    } catch (error) {
      console.log(`❌ ASN trend endpoint tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testToolIntegration() {
    console.log('📋 Testing tool integration...');
    
    try {
      // Test health check tool
      const healthResult = await this.tools.executeTool('netcores_health_check');
      this.assert(typeof healthResult === 'string', 'Tool result should be string');
      this.assert(healthResult.includes('Health Check'), 'Should contain health check info');
      
      // Test data summary tool
      const summaryResult = await this.tools.executeTool('netcores_data_summary');
      this.assert(typeof summaryResult === 'string', 'Tool result should be string');
      this.assert(summaryResult.includes('Data Summary'), 'Should contain data summary info');
      
      console.log('✅ Tool integration tests passed');
    } catch (error) {
      console.log(`❌ Tool integration tests failed: ${error.message}`);
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
  const apiUrl = process.argv[2] || process.env.NETCORES_API_URL;
  const tests = new APIIntegrationTests(apiUrl);
  
  tests.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = APIIntegrationTests;