#!/usr/bin/env node
/**
 * NetCores MCP Testing Utility
 * Tests all NetCores MCP functionality
 */

const chalk = require('chalk');
const ora = require('ora');
const NetCoresTools = require('./tools');

class MCPTester {
  constructor(apiUrl = process.env.NETCORES_API_URL || 'https://netcores.fi.uba.ar') {
    this.tools = new NetCoresTools(apiUrl);
    this.apiUrl = apiUrl;
  }

  async testConnection() {
    const spinner = ora('Testing NetCores API connection...').start();
    
    try {
      const result = await this.tools.client.testConnection();
      
      if (result.success) {
        spinner.succeed('API connection successful');
        console.log(chalk.blue(`   URL: ${result.baseUrl}`));
        console.log(chalk.blue(`   Status: ${result.status}`));
        console.log(chalk.blue(`   Version: ${result.version}`));
        console.log(chalk.blue(`   Data Status: ${result.dataStatus}`));
        return true;
      } else {
        spinner.fail('API connection failed');
        console.log(chalk.red(`   Error: ${result.error}`));
        return false;
      }
    } catch (error) {
      spinner.fail('API connection failed');
      console.log(chalk.red(`   Error: ${error.message}`));
      return false;
    }
  }

  async testTool(toolName, params = {}) {
    const spinner = ora(`Testing ${toolName}...`).start();
    
    try {
      const result = await this.tools.executeTool(toolName, params);
      spinner.succeed(`${toolName} executed successfully`);
      
      // Show truncated result
      const truncated = result.length > 200 ? result.substring(0, 200) + '...' : result;
      console.log(chalk.gray(`   Result: ${truncated.replace(/\n/g, ' ')}`));
      
      return true;
    } catch (error) {
      spinner.fail(`${toolName} failed`);
      console.log(chalk.red(`   Error: ${error.message}`));
      return false;
    }
  }

  async testAllTools() {
    console.log(chalk.blue.bold('🧪 Testing all NetCores MCP tools\n'));
    
    const testCases = [
      {
        name: 'netcores_health_check',
        params: {},
        description: 'System health check'
      },
      {
        name: 'netcores_data_summary',
        params: {},
        description: 'Data availability summary'
      },
      {
        name: 'netcores_snapshots',
        params: {},
        description: 'Available snapshots'
      },
      {
        name: 'netcores_scheduler_status',
        params: {},
        description: 'Scheduler status'
      },
      {
        name: 'netcores_asn_trend',
        params: { asn: 15169 }, // Google
        description: 'ASN trend analysis (Google AS15169)'
      },
      {
        name: 'netcores_multiple_asn_trends',
        params: { asns: [15169, 32934] }, // Google, Facebook
        description: 'Multiple ASN trends (Google, Meta)'
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      console.log(chalk.cyan(`\n📋 ${testCase.description}`));
      
      const success = await this.testTool(testCase.name, testCase.params);
      if (success) {
        passed++;
      } else {
        failed++;
      }
    }

    console.log(chalk.blue.bold('\n📊 Test Results:'));
    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));
    console.log(chalk.blue(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`));

    return failed === 0;
  }

  async runBenchmark() {
    console.log(chalk.blue.bold('⚡ Running performance benchmark\n'));
    
    const startTime = Date.now();
    const spinner = ora('Running health check benchmark (10 requests)...').start();
    
    try {
      const promises = Array(10).fill().map(() => 
        this.tools.executeTool('netcores_health_check')
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const avgTime = duration / 10;
      
      spinner.succeed(`Benchmark completed in ${duration}ms`);
      console.log(chalk.blue(`   Average request time: ${avgTime.toFixed(1)}ms`));
      console.log(chalk.blue(`   Requests per second: ${(1000 / avgTime).toFixed(1)}`));
      
      return true;
    } catch (error) {
      spinner.fail('Benchmark failed');
      console.log(chalk.red(`   Error: ${error.message}`));
      return false;
    }
  }

  async testMCPProtocol() {
    console.log(chalk.blue.bold('🔧 Testing MCP protocol compatibility\n'));
    
    // Test tool definitions
    const spinner1 = ora('Checking tool definitions...').start();
    try {
      const definitions = this.tools.getToolDefinitions();
      if (definitions.length === 8) {
        spinner1.succeed(`Found ${definitions.length} tool definitions`);
      } else {
        spinner1.fail(`Expected 8 tools, found ${definitions.length}`);
        return false;
      }
    } catch (error) {
      spinner1.fail('Tool definitions check failed');
      console.log(chalk.red(`   Error: ${error.message}`));
      return false;
    }

    // Test schema validation
    const spinner2 = ora('Validating tool schemas...').start();
    try {
      const definitions = this.tools.getToolDefinitions();
      
      for (const tool of definitions) {
        if (!tool.name || !tool.description || !tool.inputSchema) {
          throw new Error(`Invalid schema for tool: ${tool.name}`);
        }
        
        if (tool.inputSchema.type !== 'object') {
          throw new Error(`Invalid input schema type for tool: ${tool.name}`);
        }
      }
      
      spinner2.succeed('All tool schemas are valid');
      return true;
    } catch (error) {
      spinner2.fail('Schema validation failed');
      console.log(chalk.red(`   Error: ${error.message}`));
      return false;
    }
  }

  async runFullTest() {
    console.log(chalk.blue.bold('🚀 NetCores MCP Full Test Suite\n'));
    console.log(chalk.blue(`🌐 API URL: ${this.apiUrl}\n`));
    
    let allPassed = true;
    
    // Test 1: Connection
    console.log(chalk.cyan('1️⃣ Connection Test'));
    const connectionOk = await this.testConnection();
    allPassed = allPassed && connectionOk;
    
    if (!connectionOk) {
      console.log(chalk.red.bold('\n❌ Connection failed. Skipping remaining tests.'));
      return false;
    }

    // Test 2: MCP Protocol
    console.log(chalk.cyan('\n2️⃣ MCP Protocol Test'));
    const protocolOk = await this.testMCPProtocol();
    allPassed = allPassed && protocolOk;

    // Test 3: All Tools
    console.log(chalk.cyan('\n3️⃣ Tool Functionality Test'));
    const toolsOk = await this.testAllTools();
    allPassed = allPassed && toolsOk;

    // Test 4: Performance
    console.log(chalk.cyan('\n4️⃣ Performance Test'));
    const perfOk = await this.runBenchmark();
    allPassed = allPassed && perfOk;

    // Summary
    console.log(chalk.blue.bold('\n🏁 Final Results:'));
    if (allPassed) {
      console.log(chalk.green.bold('✅ All tests passed! NetCores MCP is ready to use.'));
    } else {
      console.log(chalk.red.bold('❌ Some tests failed. Please check the errors above.'));
    }

    return allPassed;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse API URL
  let apiUrl = process.env.NETCORES_API_URL || 'https://netcores.fi.uba.ar';
  const apiUrlIndex = args.indexOf('--api-url');
  if (apiUrlIndex !== -1 && args[apiUrlIndex + 1]) {
    apiUrl = args[apiUrlIndex + 1];
  }

  const tester = new MCPTester(apiUrl);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NetCores MCP Test Suite

Usage: node test.js [options]

Options:
  --help, -h              Show this help message
  --connection           Test API connection only
  --tools                Test all tools
  --benchmark            Run performance benchmark
  --protocol             Test MCP protocol compatibility
  --api-url <url>        Set NetCores API URL

Examples:
  node test.js                                    # Run full test suite
  node test.js --connection                      # Test connection only
  node test.js --api-url https://your-server.com # Test against custom server
`);
    return;
  }

  if (args.includes('--connection')) {
    await tester.testConnection();
  } else if (args.includes('--tools')) {
    await tester.testAllTools();
  } else if (args.includes('--benchmark')) {
    await tester.runBenchmark();
  } else if (args.includes('--protocol')) {
    await tester.testMCPProtocol();
  } else {
    await tester.runFullTest();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MCPTester };