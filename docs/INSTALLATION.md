# NetCores MCP Installation Guide

A complete guide to installing and configuring the NetCores Model Context Protocol (MCP) package for Claude Desktop.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [Method 1: Download from Server](#method-1-download-from-server)
  - [Method 2: NPM Registry](#method-2-npm-registry)
  - [Method 3: Build from Source](#method-3-build-from-source)
- [Configuration](#configuration)
  - [Automatic Setup](#automatic-setup)
  - [Manual Configuration](#manual-configuration)
  - [Environment Variables](#environment-variables)
- [Testing Installation](#testing-installation)
- [Claude Desktop Integration](#claude-desktop-integration)
- [Troubleshooting](#troubleshooting)
- [Uninstallation](#uninstallation)

## Quick Start

```bash
# Install from GitHub
npm install -g https://github.com/estcarisimo/netcores-mcp.git

# Configure Claude Desktop
netcores-mcp --setup

# Test installation
netcores-mcp --test
```

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Latest version (comes with Node.js)
- **Operating System**: macOS, Windows, or Linux
- **Claude Desktop**: Latest version with MCP support

### Check Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version

# Check if Claude Desktop is installed
# macOS
ls ~/Library/Application\ Support/Claude/

# Windows
dir %APPDATA%\Claude\

# Linux
ls ~/.config/Claude/
```

### Installing Node.js

If you don't have Node.js installed:

**macOS (using Homebrew):**
```bash
brew install node
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/)

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Installation Methods

### Method 1: Install from GitHub

**Recommended for most users**

```bash
# Install directly from GitHub repository
npm install -g https://github.com/estcarisimo/netcores-mcp.git

# Verify installation
netcores-mcp --version
# Output: NetCores MCP Server v1.0.0
```

### Method 2: Clone and Install

**For developers or custom modifications**

```bash
# Clone the repository
git clone https://github.com/estcarisimo/netcores-mcp.git
cd netcores-mcp

# Install dependencies
npm install

# Install globally
npm install -g .

# Verify installation
netcores-mcp --version
```

### Method 3: NPM Registry

**Coming soon - Once published to npm registry**

```bash
# Direct installation from npm
npm install -g netcores-mcp

# Or using npx (no installation)
npx netcores-mcp --help
```


## Configuration

### Automatic Setup

The easiest way to configure Claude Desktop:

```bash
# Run interactive setup
netcores-mcp --setup
```

This will:
1. Detect your operating system
2. Find your Claude Desktop configuration file
3. Add NetCores MCP to the configuration
4. Validate the setup

**Example setup session:**
```
🔧 NetCores MCP Setup for Claude Desktop

⚠️  No existing Claude Desktop config found.
? Would you like to create a new Claude Desktop config? Yes

✅ NetCores MCP successfully configured for Claude Desktop!
📍 Configuration saved to: ~/Library/Application Support/Claude/claude_desktop_config.json
🌐 API URL: https://netcores.fi.uba.ar
```

### Manual Configuration

If automatic setup doesn't work or you prefer manual configuration:

#### 1. Find Configuration File

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

#### 2. Create/Edit Configuration

Create the directory if it doesn't exist:

**macOS:**
```bash
mkdir -p ~/Library/Application\ Support/Claude
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"
```

**Linux:**
```bash
mkdir -p ~/.config/Claude
```

#### 3. Add Configuration

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "netcores": {
      "command": "netcores-mcp"
    }
  }
}
```

For custom API server:
```json
{
  "mcpServers": {
    "netcores": {
      "command": "netcores-mcp",
      "env": {
        "NETCORES_API_URL": "https://your-server.com:8889"
      }
    }
  }
}
```

### Environment Variables

Configure NetCores MCP behavior:

```bash
# Set custom API URL (default: https://netcores.fi.uba.ar)
export NETCORES_API_URL=https://your-custom-server.com

# For Windows:
set NETCORES_API_URL=https://your-custom-server.com
```

## Testing Installation

### 1. Test CLI Commands

```bash
# Check version
netcores-mcp --version
# Expected: NetCores MCP Server v1.0.0

# Test API connection
netcores-mcp --test
# Expected:
# Testing NetCores API connection...
# ✅ Connection successful!
#    URL: https://netcores.fi.uba.ar
#    Status: healthy
#    Version: 0.1.0
#    Data Status: available

# Run full test suite
netcores-mcp --test-all
# Expected: All 8 tools tested with 100% success rate

# Show help
netcores-mcp --help

# Check configuration
netcores-mcp --config
```

### 2. Test MCP Protocol

```bash
# Test MCP initialization
printf '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}\n' | netcores-mcp

# Expected: JSON response with server capabilities
```

### 3. Verify Global Installation

```bash
# Check installation location
which netcores-mcp

# Check npm global packages
npm list -g netcores-mcp
```

## Claude Desktop Integration

### 1. Restart Claude Desktop

After configuration:

1. **Completely quit Claude Desktop** (not just close the window)
   - macOS: Cmd+Q or Claude Desktop → Quit
   - Windows: File → Exit or system tray → Exit
   - Linux: File → Quit

2. **Wait 5 seconds**

3. **Start Claude Desktop again**

### 2. Verify MCP Connection

In Claude Desktop, ask:

> "What tools do you have available?"

You should see NetCores tools listed among available tools.

### 3. Test NetCores Tools

Try these commands in Claude:

> "Check the health of the NetCores system"

> "What network data is available in NetCores?"

> "Analyze the k-core trends for Google's ASN 15169"

> "Compare network centrality between ASNs 15169, 32934, and 13335"

## Troubleshooting

### Installation Issues

**"npm: command not found"**
- Install Node.js first (see Prerequisites)

**"EACCES: permission denied"**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**"Cannot find module"**
```bash
# Reinstall
npm uninstall -g netcores-mcp
npm cache clean --force
npm install -g ./netcores-mcp-1.0.0.tgz
```

### Claude Desktop Issues

**Claude doesn't see NetCores tools:**

1. Check configuration file exists and is valid JSON:
```bash
# Validate JSON
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
```

2. Check MCP logs:
```bash
# View logs (location varies by OS)
tail -f ~/Library/Logs/Claude/mcp-server-netcores.log
```

3. Test MCP server directly:
```bash
netcores-mcp --test
```

**"MCP server disconnected"**

1. Check API connectivity:
```bash
curl https://netcores.fi.uba.ar/api/health
```

2. Restart Claude Desktop completely

3. Check for conflicting MCP servers in config

### Common Error Messages

**"Failed to start NetCores MCP Server"**
- Check Node.js version: `node --version`
- Verify installation: `npm list -g netcores-mcp`
- Check for port conflicts

**"Connection failed"**
- Verify network connectivity
- Check if API server is accessible
- Try alternative API server

**"Transport closed unexpectedly"**
- Usually indicates a crash - check logs
- Reinstall the package
- Report issue with log details

### Debug Mode

For detailed debugging:

```bash
# Check what's installed
ls -la $(npm root -g)/netcores-mcp/

# Test server directly
node $(npm root -g)/netcores-mcp/src/server.js --test

# Monitor logs during usage
tail -f ~/path/to/claude/logs/mcp-server-netcores.log
```

## Uninstallation

### Remove NetCores MCP

```bash
# 1. Uninstall package
npm uninstall -g netcores-mcp

# 2. Remove from Claude Desktop config
# Either edit the config file and remove the "netcores" section
# Or use the setup tool:
netcores-mcp --setup
# Then choose to remove configuration

# 3. Clean up cache (optional)
npm cache clean --force
```

### Complete Cleanup

```bash
# Remove all traces
npm uninstall -g netcores-mcp
rm -rf ~/.npm/_npx/*netcores*
rm -rf $(npm root -g)/netcores-mcp

# Remove from Claude config manually
# Edit claude_desktop_config.json and remove the "netcores" section
```

## Support

### Getting Help

1. **Check documentation**: https://netcores.fi.uba.ar/mcp-docs
2. **API status**: https://netcores.fi.uba.ar/api/health
3. **Run diagnostics**: `netcores-mcp --test-all`

### Reporting Issues

When reporting issues, include:

1. **System information**:
```bash
netcores-mcp --version
node --version
npm --version
# Operating system and version
```

2. **Error messages** (full output)

3. **Log files** (if available)

4. **Steps to reproduce**

### Additional Resources

- **NetCores Web Interface**: https://netcores.fi.uba.ar
- **API Documentation**: https://netcores.fi.uba.ar/api-docs
- **MCP Documentation**: https://netcores.fi.uba.ar/mcp-docs
- **CAIDA AS Relationships**: https://www.caida.org/catalog/datasets/as-relationships/

---

## Quick Reference Card

```bash
# Installation
npm install -g https://github.com/estcarisimo/netcores-mcp.git

# Setup
netcores-mcp --setup       # Interactive Claude Desktop setup
netcores-mcp --test        # Test API connection
netcores-mcp --test-all    # Run full test suite
netcores-mcp --config      # Show current config
netcores-mcp --help        # Show all commands

# Claude Desktop Config Location
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%\Claude\claude_desktop_config.json  
# Linux: ~/.config/Claude/claude_desktop_config.json

# Troubleshooting
npm list -g netcores-mcp   # Check installation
which netcores-mcp         # Find installation path
curl https://netcores.fi.uba.ar/api/health  # Test API
```

---

*NetCores MCP - Bringing Internet topology analysis to conversational AI* 🌐✨