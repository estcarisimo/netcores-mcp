# NetCores MCP

[![Node.js Version](https://img.shields.io/node/v/netcores-mcp.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

**NetCores MCP** is a Model Context Protocol (MCP) server that provides LLMs with powerful network analysis capabilities through the NetCores k-core decomposition API. Connect Claude Desktop to real-time AS (Autonomous System) relationship data and Internet topology analysis.

> 🌐 **Live Demo**: [netcores.fi.uba.ar](https://netcores.fi.uba.ar) | 📖 **Full Docs**: [MCP Integration Guide](http://https://netcores.fi.uba.ar/mcp-docs)

## 🚀 Quick Installation

### Method 1: NPM Registry (Recommended)

```bash
# Once published to npm
npm install -g netcores-mcp
netcores-mcp --setup
```

### Method 2: Install from GitHub 

```bash
# Install directly from GitHub repository
npm install -g https://github.com/estcarisimo/netcores-mcp.git

# Setup Claude Desktop (interactive)
netcores-mcp --setup

# Test everything works
netcores-mcp --test-all
```

### Method 3: Clone and Install

```bash
# Clone the repository
git clone https://github.com/estcarisimo/netcores-mcp.git
cd netcores-mcp

# Install globally
npm install -g .

# Setup Claude Desktop
netcores-mcp --setup
```


## ✅ Verify Installation

After installation, restart Claude Desktop and ask:

> **"What tools do you have available?"**

You should see 8 NetCores tools listed! Then try:

> **"Check the health of the NetCores system"**
> 
> **"Analyze Google's ASN 15169 k-core trends over the past year"**

## 🛠️ Features

### 🌐 Network Analysis Tools

NetCores MCP provides 8 powerful tools for Internet topology analysis:

1. **Health Check** - System status and availability
2. **Data Summary** - Overview of available IPv4/IPv6 data
3. **ASN Trend Analysis** - k-core shell index trends for individual ASNs
4. **Multiple ASN Comparison** - Compare trends across multiple ASNs
5. **Network Snapshots** - Available CAIDA AS-relationship snapshots
6. **Data Refresh** - Trigger updates from CAIDA sources
7. **Scheduler Status** - Automatic update scheduling information
8. **Manual Updates** - Trigger immediate data updates

### 📊 Data Sources

- **IPv4 Data**: CAIDA AS-relationships since 1998
- **IPv6 Data**: CAIDA AS-relationships since 2014
- **Update Frequency**: Monthly snapshots (1st of each month)
- **Processing**: k-core decomposition analysis using NetworkX
- **API**: Production deployment at [netcores.fi.uba.ar](https://netcores.fi.uba.ar)

### 🔧 CLI Commands

```bash
# Start MCP server (for Claude Desktop)
netcores-mcp

# Interactive Claude Desktop setup
netcores-mcp --setup

# Test API connection
netcores-mcp --test

# Run full test suite
netcores-mcp --test-all

# Show current configuration
netcores-mcp --config

# Show help
netcores-mcp --help
```

## 📋 Requirements

- **Node.js**: 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Latest version (comes with Node.js)
- **Claude Desktop**: Latest version with MCP support
- **Network**: Internet connection to reach NetCores API

### Check Requirements

```bash
# Verify you have the right versions
node --version  # Should be v18.0.0+
npm --version   # Any recent version
which netcores-mcp  # Should show path after installation
```

## 🔧 Configuration & Setup

### Automatic Configuration (Recommended)

```bash
# Interactive setup - detects your system automatically
netcores-mcp --setup
```

This command will:
- ✅ Automatically locate your NetCores MCP installation
- ✅ Verify the installation is working correctly
- ✅ Detect your operating system (macOS/Windows/Linux)
- ✅ Find your Claude Desktop configuration file
- ✅ Configure Claude Desktop with the correct absolute path
- ✅ Show you exactly where everything was installed

### Manual Configuration

If automatic setup doesn't work:

#### 1. Find Your Claude Desktop Config File

| OS | Location |
|---|---|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Linux** | `~/.config/Claude/claude_desktop_config.json` |

#### 2. Add NetCores MCP Configuration

Add the following configuration to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "netcores": {
      "command": "netcores-mcp"
    }
  }
}
```

This uses the default NetCores server at `https://netcores.fi.uba.ar`.



### Environment Variables

```bash
# Set custom API URL (optional)
export NETCORES_API_URL=https://netcores.fi.uba.ar

# Windows PowerShell:
$env:NETCORES_API_URL="https://netcores.fi.uba.ar"
```

## 📖 Usage Examples

Once configured, you can use NetCores tools in Claude Desktop:

### Basic Health Check

> "Check the health of the NetCores system"

### ASN Analysis

> "Analyze the k-core trends for Google's ASN 15169 over the past year"

### Multiple ASN Comparison

> "Compare the network centrality trends between Google (AS15169), Meta (AS32934), and Cloudflare (AS13335)"

### Data Exploration

> "What IPv4 and IPv6 data is available in NetCores? Show me the latest snapshots."

### Network Research

> "Find the most central ASNs in the current IPv4 Internet topology based on k-core shell indices"


## 🐛 Troubleshooting

### Installation Issues

| Problem | Solution |
|---------|----------|
| **"npm: command not found"** | Install Node.js from [nodejs.org](https://nodejs.org/) |
| **"EACCES: permission denied"** | Use `npm config set prefix ~/.npm-global` and update PATH |
| **"Cannot find module"** | Reinstall: `npm uninstall -g netcores-mcp && npm install -g https://github.com/estcarisimo/netcores-mcp.git` |
| **Package not found after install** | Check npm global path: `npm root -g` |

### Claude Desktop Issues

| Problem | Diagnosis | Solution |
|---------|-----------|----------|
| **Claude doesn't see NetCores tools** | Config file issue | Run `netcores-mcp --setup` again |
| **"MCP server disconnected"** | Server crash | Check logs, restart Claude Desktop |
| **Tools listed but don't work** | API connectivity | Test with `netcores-mcp --test` |
| **Setup command hangs** | Permission/path issue | Run with `sudo` or fix npm permissions |

### Debug Commands

```bash
# Check what's actually installed
npm list -g netcores-mcp

# Find installation path
which netcores-mcp

# Test server directly
node $(npm root -g)/netcores-mcp/src/server.js --version

# Validate Claude Desktop config
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Test API server
curl https://netcores.fi.uba.ar/api/health
```

### Log Files

Check these locations for error logs:

| OS | Log Location |
|---|---|
| **macOS** | `~/Library/Logs/Claude/` |
| **Windows** | `%LOCALAPPDATA%\Claude\logs\` |
| **Linux** | `~/.local/share/Claude/logs/` |

For more detailed troubleshooting, see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📚 Related Projects

- **NetCores Web App**: [netcores.fi.uba.ar](https://netcores.fi.uba.ar)
- **CAIDA AS-Relationships**: [CAIDA Datasets](https://www.caida.org/catalog/datasets/as-relationships/)
- **Model Context Protocol**: [MCP Specification](https://modelcontextprotocol.io/)

## 🏆 Acknowledgments

- **CAIDA** for providing AS-relationship datasets
- **Anthropic** for the Model Context Protocol
- **Universidad de Buenos Aires** for hosting the NetCores service

---

**NetCores MCP** - Bringing Internet topology analysis to conversational AI 🌐✨