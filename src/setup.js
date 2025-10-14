#!/usr/bin/env node
/**
 * NetCores MCP Setup Utility
 * Helps users configure Claude Desktop with NetCores MCP
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');

class SetupUtility {
  constructor() {
    this.configPaths = this.getClaudeConfigPaths();
  }

  getClaudeConfigPaths() {
    const homeDir = os.homedir();
    
    switch (os.platform()) {
      case 'darwin': // macOS
        return [
          path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
        ];
      case 'win32': // Windows
        return [
          path.join(homeDir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
        ];
      case 'linux': // Linux
        return [
          path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json'),
          path.join(homeDir, '.claude', 'claude_desktop_config.json')
        ];
      default:
        return [
          path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json')
        ];
    }
  }

  findExistingConfig() {
    for (const configPath of this.configPaths) {
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }
    return null;
  }

  getNetCoresMCPPath() {
    console.log(chalk.blue('🔍 Locating NetCores MCP installation...\n'));
    
    // Method 1: Check if netcores-mcp is in PATH and get its location
    try {
      const whichCmd = process.platform === 'win32' ? 'where' : 'which';
      const cmdPath = execSync(`${whichCmd} netcores-mcp`, { encoding: 'utf8' }).trim().split('\n')[0];
      
      if (cmdPath && fs.existsSync(cmdPath)) {
        // On Windows, 'where' might return a .cmd file, we need the actual script
        if (process.platform === 'win32' && cmdPath.endsWith('.cmd')) {
          // Read the .cmd file to find the actual node script location
          try {
            const cmdContent = fs.readFileSync(cmdPath, 'utf8');
            const nodeMatch = cmdContent.match(/node\s+"([^"]+)"/);
            if (nodeMatch && nodeMatch[1]) {
              const actualPath = nodeMatch[1].replace(/\\/g, '/');
              if (fs.existsSync(actualPath)) {
                console.log(chalk.green(`✓ Found netcores-mcp at: ${actualPath}`));
                return actualPath;
              }
            }
          } catch (e) {
            // Continue to use cmdPath if we can't parse it
          }
        }
        console.log(chalk.green(`✓ Found netcores-mcp at: ${cmdPath}`));
        return cmdPath;
      }
    } catch (error) {
      // Command not in PATH, continue to next method
    }

    // Method 2: Check npm global installation paths
    try {
      const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
      const npmBin = execSync('npm bin -g', { encoding: 'utf8' }).trim();
      
      const possiblePaths = [
        path.join(npmRoot, 'netcores-mcp', 'bin', 'netcores-mcp'),
        path.join(npmRoot, '.bin', 'netcores-mcp'),
        path.join(npmBin, 'netcores-mcp'),
        path.join(npmRoot, '..', '.bin', 'netcores-mcp'),
        // Windows specific paths
        path.join(npmRoot, 'netcores-mcp', 'bin', 'netcores-mcp.cmd'),
        path.join(npmBin, 'netcores-mcp.cmd')
      ];
      
      for (let checkPath of possiblePaths) {
        // Normalize path for cross-platform compatibility
        checkPath = checkPath.replace(/\\/g, '/');
        
        if (fs.existsSync(checkPath)) {
          console.log(chalk.green(`✓ Found netcores-mcp at: ${checkPath}`));
          return checkPath;
        }
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not determine npm global paths'));
    }

    // Method 3: Check common installation locations
    const homeDir = os.homedir();
    const commonPaths = [
      // Unix-like systems
      '/usr/local/lib/node_modules/netcores-mcp/bin/netcores-mcp',
      '/usr/lib/node_modules/netcores-mcp/bin/netcores-mcp',
      path.join(homeDir, '.npm-global', 'lib', 'node_modules', 'netcores-mcp', 'bin', 'netcores-mcp'),
      path.join(homeDir, '.nvm', 'versions', 'node', '*', 'lib', 'node_modules', 'netcores-mcp', 'bin', 'netcores-mcp'),
      // Windows
      'C:\\Program Files\\nodejs\\node_modules\\netcores-mcp\\bin\\netcores-mcp',
      'C:\\Program Files (x86)\\nodejs\\node_modules\\netcores-mcp\\bin\\netcores-mcp',
      path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'netcores-mcp', 'bin', 'netcores-mcp')
    ];

    for (let checkPath of commonPaths) {
      // Handle glob patterns
      if (checkPath.includes('*')) {
        try {
          const glob = require('glob');
          const matches = glob.sync(checkPath);
          if (matches.length > 0) {
            console.log(chalk.green(`✓ Found netcores-mcp at: ${matches[0]}`));
            return matches[0];
          }
        } catch (e) {
          // glob not available, skip
        }
      } else {
        checkPath = checkPath.replace(/\\/g, '/');
        if (fs.existsSync(checkPath)) {
          console.log(chalk.green(`✓ Found netcores-mcp at: ${checkPath}`));
          return checkPath;
        }
      }
    }

    // If we get here, installation was not found
    console.log(chalk.red.bold('❌ Could not find NetCores MCP installation.\n'));
    console.log(chalk.yellow('Please install it first with:'));
    console.log(chalk.white('  npm install -g https://github.com/estcarisimo/netcores-mcp.git\n'));
    console.log(chalk.yellow('Locations checked:'));
    console.log(chalk.gray('  - PATH environment variable'));
    console.log(chalk.gray('  - npm global modules directory'));
    console.log(chalk.gray('  - Common system locations\n'));
    
    throw new Error('NetCores MCP not found. Please install it globally first.');
  }

  loadConfig(configPath) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return { mcpServers: {} };
    }
  }

  saveConfig(configPath, config) {
    // Ensure directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Write config with proper formatting
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  async verifyInstallation(mcpPath) {
    console.log(chalk.blue('\n🔍 Verifying NetCores MCP installation...'));
    
    try {
      // Check if the file exists
      if (!fs.existsSync(mcpPath)) {
        throw new Error(`Installation not found at: ${mcpPath}`);
      }
      
      // Check if it's executable (on Unix-like systems)
      if (process.platform !== 'win32') {
        try {
          fs.accessSync(mcpPath, fs.constants.X_OK);
        } catch (error) {
          console.log(chalk.yellow('⚠️  File is not executable. Attempting to fix...'));
          try {
            fs.chmodSync(mcpPath, '755');
            console.log(chalk.green('✓ Made file executable'));
          } catch (chmodError) {
            console.log(chalk.red('❌ Could not make file executable'));
          }
        }
      }
      
      // Try to run a simple command to verify it works
      try {
        const testCmd = `"${mcpPath}" --version`;
        const result = execSync(testCmd, { encoding: 'utf8' }).trim();
        console.log(chalk.green(`✓ Installation verified: ${result}`));
        return true;
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not run version check, but file exists'));
        return true; // File exists, might still work
      }
    } catch (error) {
      console.log(chalk.red(`❌ Installation verification failed: ${error.message}`));
      return false;
    }
  }

  async setupClaudeDesktop() {
    console.log(chalk.blue.bold('🔧 NetCores MCP Setup for Claude Desktop\n'));

    // Check if package is installed and get its path
    let mcpCommand;
    try {
      mcpCommand = this.getNetCoresMCPPath();
    } catch (error) {
      console.log(chalk.red.bold('\n❌ Setup cannot continue without NetCores MCP installed.'));
      process.exit(1);
    }
    
    // Verify the installation works
    const isValid = await this.verifyInstallation(mcpCommand);
    if (!isValid) {
      console.log(chalk.red.bold('\n❌ Installation verification failed.'));
      console.log(chalk.yellow('Please try reinstalling with:'));
      console.log(chalk.white('  npm install -g https://github.com/estcarisimo/netcores-mcp.git'));
      process.exit(1);
    }
    
    // Find or create config
    let configPath = this.findExistingConfig();
    
    if (!configPath) {
      console.log(chalk.yellow('⚠️  No existing Claude Desktop config found.'));
      
      const { createNew } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createNew',
          message: 'Would you like to create a new Claude Desktop config?',
          default: true
        }
      ]);
      
      if (!createNew) {
        console.log(chalk.red('❌ Setup cancelled.'));
        return;
      }
      
      configPath = this.configPaths[0];
    }

    // Load existing config
    const config = this.loadConfig(configPath);
    
    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Check if NetCores is already configured
    if (config.mcpServers.netcores) {
      console.log(chalk.yellow('⚠️  NetCores MCP is already configured in Claude Desktop.'));
      
      const { update } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'update',
          message: 'Would you like to update the existing configuration?',
          default: false
        }
      ]);
      
      if (!update) {
        console.log(chalk.blue('ℹ️  Setup skipped. Configuration unchanged.'));
        return;
      }
    }

    // Get API URL preference
    const { apiUrl } = await inquirer.prompt([
      {
        type: 'list',
        name: 'apiUrl',
        message: 'Which NetCores API would you like to use?',
        choices: [
          {
            name: 'Default (https://netcores.fi.uba.ar)',
            value: 'https://netcores.fi.uba.ar'
          },
          {
            name: 'Custom URL',
            value: 'custom'
          }
        ],
        default: 'https://netcores.fi.uba.ar'
      }
    ]);

    let finalApiUrl = apiUrl;
    if (apiUrl === 'custom') {
      const { customUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customUrl',
          message: 'Enter the custom NetCores API URL:',
          validate: (input) => {
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          }
        }
      ]);
      finalApiUrl = customUrl;
    }

    // Configure NetCores MCP
    config.mcpServers.netcores = {
      command: mcpCommand
    };

    // Add environment variables if using non-default API
    if (finalApiUrl !== 'https://netcores.fi.uba.ar') {
      config.mcpServers.netcores.env = {
        NETCORES_API_URL: finalApiUrl
      };
    }

    // Save configuration
    try {
      this.saveConfig(configPath, config);
      
      console.log(chalk.green.bold('\n✅ NetCores MCP successfully configured for Claude Desktop!'));
      console.log(chalk.blue('\n📋 Configuration Summary:'));
      console.log(chalk.white(`  • Installation Path: ${mcpCommand}`));
      console.log(chalk.white(`  • Config Location: ${configPath}`));
      console.log(chalk.white(`  • API Server: ${finalApiUrl}`));
      
      console.log(chalk.yellow.bold('\n📋 Next Steps:'));
      console.log(chalk.white('1. Restart Claude Desktop if it\'s currently running'));
      console.log(chalk.white('2. NetCores tools will be available in your next conversation'));
      console.log(chalk.white('3. Try asking: "What tools do you have from NetCores?"'));
      
      console.log(chalk.gray('\n💡 Tip: You can run "netcores-mcp --test" to verify API connectivity'));
      
    } catch (error) {
      console.log(chalk.red.bold('\n❌ Failed to save configuration:'));
      console.log(chalk.red(error.message));
      console.log(chalk.yellow('\n📋 Manual Configuration:'));
      console.log(chalk.white('Add this to your Claude Desktop config:'));
      console.log(chalk.gray(JSON.stringify({
        mcpServers: {
          netcores: config.mcpServers.netcores
        }
      }, null, 2)));
    }
  }

  async showCurrentConfig() {
    console.log(chalk.blue.bold('📋 Current Claude Desktop Configuration\n'));
    
    const configPath = this.findExistingConfig();
    
    if (!configPath) {
      console.log(chalk.yellow('⚠️  No Claude Desktop configuration found.'));
      console.log(chalk.blue('💡 Run "netcores-mcp --setup" to create one.'));
      return;
    }
    
    console.log(chalk.blue(`📍 Config file: ${configPath}`));
    
    const config = this.loadConfig(configPath);
    
    if (!config.mcpServers || !config.mcpServers.netcores) {
      console.log(chalk.yellow('⚠️  NetCores MCP is not configured.'));
      console.log(chalk.blue('💡 Run "netcores-mcp --setup" to configure it.'));
      return;
    }
    
    console.log(chalk.green('✅ NetCores MCP is configured:'));
    console.log(chalk.gray(JSON.stringify(config.mcpServers.netcores, null, 2)));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const setup = new SetupUtility();
  
  if (args.includes('--config') || args.includes('--show-config')) {
    await setup.showCurrentConfig();
  } else {
    await setup.setupClaudeDesktop();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SetupUtility };