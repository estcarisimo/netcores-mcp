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
      
      // Add transport error handling
      if (transport.onclose) {
        transport.onclose = () => {
          console.error('Transport closed');
        };
      }
      
      if (transport.onerror) {
        transport.onerror = (error) => {
          console.error('Transport error:', error);
        };
      }
      
      await this.server.connect(transport);
      
      // Log to stderr so it doesn't interfere with stdio protocol
      console.error('NetCores MCP Server started');
      console.error(`API URL: ${this.tools.client.baseUrl}`);
      console.error(`Available tools: ${this.tools.getToolDefinitions().length}`);
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      process.exit(1);
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NetCores MCP Server v1.0.0

Usage: netcores-mcp [options]

Options:
  --help, -h          Show this help message
  --version, -v       Show version information
  --test              Test connection to NetCores API
  --test-all          Run full test suite
  --setup             Interactive Claude Desktop setup
  --config            Show current Claude Desktop configuration
  --api-url <url>     Set NetCores API URL (default: https://netcores.fi.uba.ar)

Environment Variables:
  NETCORES_API_URL   NetCores API URL

Examples:
  netcores-mcp                                    # Start MCP server
  netcores-mcp --test                            # Test API connection  
  netcores-mcp --test-all                        # Run full test suite
  netcores-mcp --setup                           # Configure Claude Desktop
  netcores-mcp --api-url https://your-server.com # Use custom server

For Claude Desktop configuration, add this to your config:
{
  "mcpServers": {
    "netcores": {
      "command": "netcores-mcp"
    }
  }
}
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

  // Handle setup mode
  if (args.includes('--setup')) {
    const { SetupUtility } = require('./setup');
    const setup = new SetupUtility();
    await setup.setupClaudeDesktop();
    process.exit(0);
  }

  // Handle config display
  if (args.includes('--config')) {
    const { SetupUtility } = require('./setup');
    const setup = new SetupUtility();
    await setup.showCurrentConfig();
    process.exit(0);
  }

  // Handle test mode
  if (args.includes('--test')) {
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

  // Handle full test suite
  if (args.includes('--test-all')) {
    const { MCPTester } = require('./test');
    const tester = new MCPTester(apiUrl);
    const success = await tester.runFullTest();
    process.exit(success ? 0 : 1);
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