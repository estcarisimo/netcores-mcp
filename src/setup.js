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
    try {
      // Try to get the global installation path
      const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
      const globalPath = path.join(npmRoot, 'netcores-mcp', 'bin', 'netcores-mcp');
      
      if (fs.existsSync(globalPath)) {
        return globalPath;
      }
    } catch (error) {
      // Fallback to simple command if global path detection fails
    }
    
    return 'netcores-mcp';
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

  async setupClaudeDesktop() {
    console.log(chalk.blue.bold('🔧 NetCores MCP Setup for Claude Desktop\n'));

    // Check if package is installed
    const mcpCommand = this.getNetCoresMCPPath();
    
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
      console.log(chalk.blue(`📍 Configuration saved to: ${configPath}`));
      console.log(chalk.blue(`🌐 API URL: ${finalApiUrl}`));
      
      console.log(chalk.yellow.bold('\n📋 Next Steps:'));
      console.log(chalk.white('1. Restart Claude Desktop if it\'s currently running'));
      console.log(chalk.white('2. NetCores tools will be available in your next conversation'));
      console.log(chalk.white('3. Try asking: "What tools do you have from NetCores?"'));
      
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