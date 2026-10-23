# AGENTS.md

NetCores MCP is a Node.js stdio server (`src/server.js`). Requires Node.js 18+.

## Build

```bash
npm install
npm run build   # npm pack; writes netcores-mcp-<version>.tgz
```

Do not publish to npm, tag, or cut a release unless the maintainer asks.

## Test

```bash
npm test            # unit tests; this is what CI must pass
npm run test:api    # live API at NETCORES_API_URL
npm run test:mcp    # MCP protocol checks
npm run test:all    # unit, integration, and end-to-end
```

## Run

```bash
npm start
# or
node src/server.js
```

No arguments starts the MCP server on stdin/stdout. Logs go to stderr. Useful commands: `--help`, `--version`, `--test`, `--setup`.

`NETCORES_API_URL` overrides the API base URL (default `https://netcores.fi.uba.ar`).
