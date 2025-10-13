#!/usr/bin/env node
/**
 * End-to-end tests for MCP protocol compliance
 */

const { spawn } = require('child_process');
const path = require('path');

class MCPProtocolTests {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.serverPath = path.join(__dirname, '../../src/server.js');
  }

  async runTests() {
    console.log('🧪 Running MCP Protocol E2E Tests\n');

    await this.testMCPInitialization();
    await this.testToolsList();
    await this.testToolExecution();
    await this.testErrorHandling();

    console.log(`\n📊 E2E Test Results:`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    return this.failed === 0;
  }

  async testMCPInitialization() {
    console.log('📋 Testing MCP initialization...');
    
    try {
      const initMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      };

      const response = await this.sendMCPMessage(initMessage);
      
      this.assert(response.jsonrpc === '2.0', 'Should use JSON-RPC 2.0');
      this.assert(response.id === 1, 'Response ID should match request ID');
      this.assert(response.result !== undefined, 'Should have result field');
      this.assert(response.result.capabilities !== undefined, 'Should return capabilities');
      
      console.log('✅ MCP initialization tests passed');
    } catch (error) {
      console.log(`❌ MCP initialization tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testToolsList() {
    console.log('📋 Testing tools/list method...');
    
    try {
      const listMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };

      const response = await this.sendMCPMessage(listMessage);
      
      this.assert(response.jsonrpc === '2.0', 'Should use JSON-RPC 2.0');
      this.assert(response.id === 2, 'Response ID should match request ID');
      this.assert(response.result !== undefined, 'Should have result field');
      this.assert(Array.isArray(response.result.tools), 'Tools should be array');
      this.assert(response.result.tools.length === 8, 'Should have 8 tools');
      
      // Check tool structure
      const tool = response.result.tools[0];
      this.assert(typeof tool.name === 'string', 'Tool should have name');
      this.assert(typeof tool.description === 'string', 'Tool should have description');
      this.assert(typeof tool.inputSchema === 'object', 'Tool should have input schema');
      
      console.log('✅ Tools list tests passed');
    } catch (error) {
      console.log(`❌ Tools list tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testToolExecution() {
    console.log('📋 Testing tools/call method...');
    
    try {
      const callMessage = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'netcores_health_check',
          arguments: {}
        }
      };

      const response = await this.sendMCPMessage(callMessage, 10000); // Longer timeout for API call
      
      this.assert(response.jsonrpc === '2.0', 'Should use JSON-RPC 2.0');
      this.assert(response.id === 3, 'Response ID should match request ID');
      
      if (response.result) {
        this.assert(Array.isArray(response.result.content), 'Result should have content array');
        this.assert(response.result.content.length > 0, 'Content should not be empty');
        this.assert(response.result.content[0].type === 'text', 'Content type should be text');
        this.assert(typeof response.result.content[0].text === 'string', 'Content text should be string');
      } else if (response.error) {
        // API might be unreachable, but MCP protocol should still work
        this.assert(typeof response.error.code === 'number', 'Error should have code');
        this.assert(typeof response.error.message === 'string', 'Error should have message');
      }
      
      console.log('✅ Tool execution tests passed');
    } catch (error) {
      console.log(`❌ Tool execution tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async testErrorHandling() {
    console.log('📋 Testing error handling...');
    
    try {
      // Test unknown method
      const unknownMessage = {
        jsonrpc: '2.0',
        id: 4,
        method: 'unknown/method',
        params: {}
      };

      const response = await this.sendMCPMessage(unknownMessage);
      
      this.assert(response.jsonrpc === '2.0', 'Should use JSON-RPC 2.0');
      this.assert(response.id === 4, 'Response ID should match request ID');
      this.assert(response.error !== undefined, 'Should return error for unknown method');
      this.assert(typeof response.error.code === 'number', 'Error should have code');
      
      console.log('✅ Error handling tests passed');
    } catch (error) {
      console.log(`❌ Error handling tests failed: ${error.message}`);
      this.failed++;
    }
  }

  async sendMCPMessage(message, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const server = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let responseData = '';
      let timeoutId;

      // Set timeout
      timeoutId = setTimeout(() => {
        server.kill();
        reject(new Error('MCP server timeout'));
      }, timeout);

      // Handle server output
      server.stdout.on('data', (data) => {
        responseData += data.toString();
        
        // Look for complete JSON response
        try {
          const lines = responseData.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('{')) {
              const response = JSON.parse(line.trim());
              clearTimeout(timeoutId);
              server.kill();
              resolve(response);
              return;
            }
          }
        } catch (error) {
          // Not complete JSON yet, continue waiting
        }
      });

      // Handle server errors
      server.stderr.on('data', (data) => {
        const errorOutput = data.toString();
        // Ignore startup logs, look for actual errors
        if (errorOutput.includes('Error:') || errorOutput.includes('Failed:')) {
          clearTimeout(timeoutId);
          server.kill();
          reject(new Error(`Server error: ${errorOutput}`));
        }
      });

      // Handle server exit
      server.on('close', (code) => {
        clearTimeout(timeoutId);
        if (code !== 0 && code !== null) {
          reject(new Error(`Server exited with code ${code}`));
        }
      });

      // Send message to server
      server.stdin.write(JSON.stringify(message) + '\n');
    });
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
  const tests = new MCPProtocolTests();
  tests.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = MCPProtocolTests;