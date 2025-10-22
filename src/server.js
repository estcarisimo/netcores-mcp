#!/usr/bin/env node
/**
 * NetCores MCP Server
 * Main MCP server implementation using the official MCP SDK for Node.js
 */

// Use dynamic imports for ES modules
async function loadMCPSDK() {
  const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
  const {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
  } = await import('@modelcontextprotocol/sdk/types.js');
  
  return { Server, StdioServerTransport, CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError };
}

const NetCoresTools = require('./tools');

class NetCoresMCPServer {
  constructor(apiUrl = process.env.NETCORES_API_URL || 'https://netcores.fi.uba.ar') {
    this.apiUrl = apiUrl;
    this.tools = new NetCoresTools(apiUrl);
    this.mcpSDK = null;
    this.server = null;
  }

  async initialize() {
    this.mcpSDK = await loadMCPSDK();
    this.server = new this.mcpSDK.Server(
      {
        name: 'netcores-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(this.mcpSDK.ListToolsRequestSchema, async () => {
      return {
        tools: this.tools.getToolDefinitions(),
      };
    });

    // Call tool handler
    this.server.setRequestHandler(this.mcpSDK.CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.tools.executeTool(name, args || {});
        
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Log error for debugging
        console.error(`Tool execution error for ${name}:`, error);
        
        // Check if it's a known tool
        const toolDefinitions = this.tools.getToolDefinitions();
        const isKnownTool = toolDefinitions.some(tool => tool.name === name);
        
        if (!isKnownTool) {
          throw new this.mcpSDK.McpError(
            this.mcpSDK.ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
        }
        
        // Return error as text content instead of throwing
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error executing ${name}: ${errorMessage}`,
            },
          ],
        };
      }
    });

    // Error handler
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Unhandled Rejection]', reason);
    });

    // Process error handlers
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    try {
      await this.initialize();
      
      const transport = new this.mcpSDK.StdioServerTransport();
      
      // Enhanced transport error handling
      if (transport.onclose) {
        transport.onclose = () => {
          console.error('🔌 MCP transport closed');
        };
      }
      
      if (transport.onerror) {
        transport.onerror = (error) => {
          console.error('🚨 MCP transport error:', error);
          
          // Provide helpful error messages for common issues
          if (error.message?.includes('JSON')) {
            console.error('💡 This often happens when the MCP server receives unexpected input.');
            console.error('💡 Make sure you\'re running this from Claude Desktop, not directly in terminal.');
            console.error('💡 If you want to test the server, use: netcores-mcp --test');
          }
        };
      }
      
      // Add global error handling for uncaught JSON parsing errors
      process.on('uncaughtException', (error) => {
        if (error.message?.includes('Unexpected end of JSON input') || 
            error.message?.includes('JSON')) {
          console.error('🚨 JSON Parsing Error detected!');
          console.error('💡 This usually means the MCP server received malformed input.');
          console.error('💡 Common causes:');
          console.error('   - Running MCP server directly instead of through Claude Desktop');
          console.error('   - Incorrect command syntax (use --setup not setup)');
          console.error('   - Network interruption during MCP communication');
          console.error('\n📖 For setup help: netcores-mcp --help');
          console.error('🧪 To test the server: netcores-mcp --test');
          process.exit(1);
        } else {
          console.error('🚨 Unexpected error:', error);
          process.exit(1);
        }
      });
      
      await this.server.connect(transport);
      
      // Log to stderr so it doesn't interfere with stdio protocol
      console.error('🚀 NetCores MCP Server started');
      console.error(`🌐 API URL: ${this.tools.client.baseUrl}`);
      console.error(`🔧 Available tools: ${this.tools.getToolDefinitions().length}`);
      console.error('✅ Ready to receive MCP requests from Claude Desktop');
    } catch (error) {
      console.error('❌ Failed to start MCP server:', error);
      
      // Provide specific guidance for setup issues
      if (error.message?.includes('setup') || error.message?.includes('Setup')) {
        console.error('💡 If you\'re trying to set up Claude Desktop, use: netcores-mcp --setup');
      }
      
      process.exit(1);
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  // Check for help flag
  if (args.includes('--help') || args.includes('-h') || args.includes('help')) {
    console.log(`
NetCores MCP Server v1.0.1

Usage: netcores-mcp [options|commands]

Options:
  --help, -h          Show this help message
  --version, -v       Show version information
  --test              Test connection to NetCores API
  --test-all          Run full test suite
  --setup             Interactive Claude Desktop setup
  --config            Show current Claude Desktop configuration
  --api-url <url>     Set NetCores API URL (default: https://netcores.fi.uba.ar)

Commands (alternative syntax):
  help                Same as --help
  test                Same as --test
  test-all            Same as --test-all
  setup               Same as --setup (recommended for new users)
  config              Same as --config

Environment Variables:
  NETCORES_API_URL   NetCores API URL

Examples:
  netcores-mcp                                    # Start MCP server
  netcores-mcp setup                             # Configure Claude Desktop (easy)
  netcores-mcp --setup                           # Configure Claude Desktop (flag style)
  netcores-mcp test                              # Test API connection
  netcores-mcp --test-all                        # Run full test suite
  netcores-mcp --api-url https://your-server.com # Use custom server

For Claude Desktop configuration, add this to your config:
{
  "mcpServers": {
    "netcores": {
      "command": "netcores-mcp"
    }
  }
}

💡 If you get JSON parsing errors, you're probably running the wrong command.
   Use 'netcores-mcp setup' to configure Claude Desktop first.
`);
    process.exit(0);
  }

  // Check for version flag
  if (args.includes('--version') || args.includes('-v')) {
    const pkg = require('../package.json');
    console.log(`NetCores MCP Server v${pkg.version}`);
    process.exit(0);
  }

  // Handle API URL override
  let apiUrl = process.env.NETCORES_API_URL || 'https://netcores.fi.uba.ar';
  const apiUrlIndex = args.indexOf('--api-url');
  if (apiUrlIndex !== -1 && args[apiUrlIndex + 1]) {
    apiUrl = args[apiUrlIndex + 1];
  }

  // Handle setup mode (support both --setup and setup)
  if (args.includes('--setup') || args.includes('setup')) {
    try {
      const { SetupUtility } = require('./setup');
      const setup = new SetupUtility();
      await setup.setupClaudeDesktop();
      process.exit(0);
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  // Handle config display (support both --config and config)
  if (args.includes('--config') || args.includes('config')) {
    try {
      const { SetupUtility } = require('./setup');
      const setup = new SetupUtility();
      await setup.showCurrentConfig();
      process.exit(0);
    } catch (error) {
      console.error('❌ Config display failed:', error.message);
      process.exit(1);
    }
  }

  // Handle test mode (support both --test and test)
  if (args.includes('--test') || args.includes('test')) {
    console.log('Testing NetCores API connection...');
    
    try {
      const tools = new NetCoresTools(apiUrl);
      const result = await tools.client.testConnection();
      
      if (result.success) {
        console.log('✅ Connection successful!');
        console.log(`   URL: ${result.baseUrl}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Version: ${result.version}`);
        console.log(`   Data Status: ${result.dataStatus}`);
      } else {
        console.log('❌ Connection failed!');
        console.log(`   URL: ${result.baseUrl}`);
        console.log(`   Error: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Connection test failed!');
      console.log(`   Error: ${error.message}`);
      process.exit(1);
    }
    
    process.exit(0);
  }

  // Handle full test suite (support both --test-all and test-all)
  if (args.includes('--test-all') || args.includes('test-all')) {
    try {
      const { MCPTester } = require('./test');
      const tester = new MCPTester(apiUrl);
      const success = await tester.runFullTest();
      process.exit(success ? 0 : 1);
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  // Validate unrecognized commands before starting MCP server
  const recognizedCommands = [
    '--help', '-h', 'help', '--version', '-v', '--setup', 'setup', 
    '--config', 'config', '--test', 'test', '--test-all', 'test-all', '--api-url'
  ];
  
  const unrecognizedArgs = args.filter(arg => {
    // Skip if it's a recognized command
    if (recognizedCommands.includes(arg)) return false;
    
    // Skip if it's a URL for --api-url parameter
    if (arg.startsWith('http')) return false;
    
    // Skip if it's the parameter value for --api-url
    const apiUrlIndex = args.indexOf('--api-url');
    if (apiUrlIndex !== -1 && args[apiUrlIndex + 1] === arg) return false;
    
    return true;
  });
  
  if (unrecognizedArgs.length > 0) {
    console.error(`❌ Unrecognized command: ${unrecognizedArgs.join(', ')}\n`);
    
    // Provide helpful suggestions for common mistakes
    for (const arg of unrecognizedArgs) {
      if (arg === 'help') {
        console.error('💡 Did you mean: netcores-mcp --help');
      } else if (arg.startsWith('-') && arg.length > 1) {
        console.error(`💡 Unknown flag: ${arg}`);
      } else {
        console.error(`💡 Unknown command: ${arg}`);
      }
    }
    
    console.error('\n📖 For help, run: netcores-mcp --help');
    process.exit(1);
  }

  // If no special command was processed, start MCP server
  try {
    const server = new NetCoresMCPServer(apiUrl);
    await server.run();
  } catch (error) {
    console.error('Failed to start NetCores MCP Server:', error);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { NetCoresMCPServer, main };