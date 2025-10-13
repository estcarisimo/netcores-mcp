#!/usr/bin/env node
/**
 * Unit tests for NetCores MCP Tools
 */

const NetCoresTools = require('../../src/tools');

class ToolsTests {
  constructor() {
    this.passed = 0;
    this.failed = 0;
  }

  async runTests() {
    console.log('🧪 Running NetCores MCP Tools Unit Tests\n');

    await this.testToolDefinitions();
    await this.testToolSchemas();
    await this.testToolExecution();
    await this.testParameterValidation();

    console.log(`\n📊 Unit Test Results:`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    return this.failed === 0;
  }

  async testToolDefinitions() {
    console.log('📋 Testing tool definitions...');
    
    try {
      const tools = new NetCoresTools();
      const definitions = tools.getToolDefinitions();
      
      this.assert(Array.isArray(definitions), 'Tool definitions should be an array');
      this.assert(definitions.length === 8, 'Should have exactly 8 tool definitions');
      
      // Check required fields
      for (const tool of definitions) {
        this.assert(typeof tool.name === 'string', 'Tool name should be string');
        this.assert(typeof tool.description === 'string', 'Tool description should be string');
        this.assert(typeof tool.inputSchema === 'object', 'Tool inputSchema should be object');
        this.assert(tool.inputSchema.type === 'object', 'InputSchema type should be object');
      }
      
      // Check specific tools exist
      const toolNames = definitions.map(t => t.name);
      const expectedTools = [
        'netcores_health_check',
        'netcores_data_summary',
        'netcores_asn_trend',
        'netcores_multiple_asn_trends',
        'netcores_snapshots',
        'netcores_refresh_data',
        'netcores_scheduler_status',
        'netcores_trigger_update'
      ];
      
      for (const expectedTool of expectedTools) {
        this.assert(toolNames.includes(expectedTool), `Should include tool: ${expectedTool}`);
      }
      
      console.log('✅ Tool definitions tests passed');
    } catch (error) {
      console.log(`❌ Tool definitions tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testToolSchemas() {
    console.log('📋 Testing tool schemas...');
    
    try {
      const tools = new NetCoresTools();
      const definitions = tools.getToolDefinitions();
      
      // Test ASN trend tool schema
      const asnTrendTool = definitions.find(t => t.name === 'netcores_asn_trend');
      this.assert(asnTrendTool !== undefined, 'ASN trend tool should exist');
      
      const schema = asnTrendTool.inputSchema;
      this.assert(schema.properties.asn.type === 'integer', 'ASN should be integer type');
      this.assert(schema.required.includes('asn'), 'ASN should be required');
      this.assert(schema.properties.ip_version.enum.includes('ipv4'), 'Should support IPv4');
      this.assert(schema.properties.ip_version.enum.includes('ipv6'), 'Should support IPv6');
      
      // Test multiple ASN trends tool schema
      const multiAsnTool = definitions.find(t => t.name === 'netcores_multiple_asn_trends');
      this.assert(multiAsnTool !== undefined, 'Multiple ASN trend tool should exist');
      
      const multiSchema = multiAsnTool.inputSchema;
      this.assert(multiSchema.properties.asns.type === 'array', 'ASNs should be array type');
      this.assert(multiSchema.properties.asns.items.type === 'integer', 'ASN items should be integers');
      this.assert(multiSchema.properties.asns.maxItems === 10, 'Should limit to 10 ASNs');
      
      console.log('✅ Tool schemas tests passed');
    } catch (error) {
      console.log(`❌ Tool schemas tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testToolExecution() {
    console.log('📋 Testing tool execution routing...');
    
    try {
      const tools = new NetCoresTools('http://nonexistent.invalid');
      
      // Test unknown tool
      try {
        await tools.executeTool('nonexistent_tool');
        this.assert(false, 'Unknown tool should throw error');
      } catch (error) {
        this.assert(error.message.includes('Unknown tool'), 'Should throw unknown tool error');
      }
      
      // Test valid tool names (will fail due to invalid URL, but routing should work)
      const validTools = [
        'netcores_health_check',
        'netcores_data_summary',
        'netcores_snapshots',
        'netcores_scheduler_status'
      ];
      
      for (const toolName of validTools) {
        try {
          await tools.executeTool(toolName);
          // If it doesn't throw "Unknown tool" error, routing works
        } catch (error) {
          this.assert(!error.message.includes('Unknown tool'), 
            `Tool ${toolName} should be routed correctly`);
        }
      }
      
      console.log('✅ Tool execution tests passed');
    } catch (error) {
      console.log(`❌ Tool execution tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testParameterValidation() {
    console.log('📋 Testing parameter handling...');
    
    try {
      const tools = new NetCoresTools('http://nonexistent.invalid');
      
      // Test that tools accept parameters without throwing validation errors
      const testCases = [
        { tool: 'netcores_asn_trend', params: { asn: 15169 } },
        { tool: 'netcores_asn_trend', params: { asn: 15169, ip_version: 'ipv4' } },
        { tool: 'netcores_multiple_asn_trends', params: { asns: [15169, 32934] } },
        { tool: 'netcores_snapshots', params: { ip_version: 'ipv4' } },
        { tool: 'netcores_refresh_data', params: { ip_versions: ['ipv4'] } }
      ];
      
      for (const testCase of testCases) {
        try {
          await tools.executeTool(testCase.tool, testCase.params);
          // Will fail due to network, but should not fail on parameter validation
        } catch (error) {
          this.assert(!error.message.includes('validation'), 
            `Parameters for ${testCase.tool} should be valid`);
          this.assert(!error.message.includes('Unknown tool'), 
            `Tool ${testCase.tool} should exist`);
        }
      }
      
      console.log('✅ Parameter validation tests passed');
    } catch (error) {
      console.log(`❌ Parameter validation tests failed: ${error.message}`);
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
  const tests = new ToolsTests();
  tests.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = ToolsTests;