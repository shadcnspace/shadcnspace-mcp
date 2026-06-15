# shadcnspace-mcp

Official Model Context Protocol (MCP) server for [Shadcn Space](https://shadcnspace.com).

This MCP server allows AI-powered IDEs and agents to discover, search, and install **Shadcn Space** UI blocks directly into your projects — no copy-paste required.
## Install MCP configuration
```bash
npx shadcnspace-cli install <client>
```

### Supported Clients

- [x] cursor
- [x] windsurf
- [x] claude
- [x] cline
- [x] antigravity

## Manual Installation

Add to your IDE's MCP config:

```json
{
  "mcpServers": {
    "shadcnspace-mcp": {
      "command": "npx",
      "args": ["-y", "shadcnspace-mcp@latest"]
    }
  }
}
```
For more information visit our documentation of [**How to use MCP Server**](https://shadcnspace.com/docs/getting-started/mcp-server-docs)


## Available Tools

The server provides the following tools callable via MCP:

| Tool Name | Description |
|-----------|-------------|
| `listBlocks` | Provides a comprehensive list of all shadcnspace blocks. |
| `listComponents` | Provides a comprehensive list of all shadcnspace components. |
| `getBlockInstall` | Returns the official installation command for a specific Shadcn Space block. |
| `searchBlocks` | Search Shadcn Space blocks using keywords or tags. |
| `listInstalledBlocks` | Lists all blocks that are currently installed in the project and get their files. |
| `listPages` | Provides a complete list of all Shadcn Space pages. |
| `getPageInstall` | Returns the official installation command for a specific Shadcn Space page. |
| `searchPages` | Search Shadcn Space pages using keywords or tags. |
| `listInstalledPages` | Lists all pages that are currently installed in the project. |

> **Note:** All pages are PRO components, so you will need to have a valid license key to install and use them.

### Available Prompts

The server provides the following prompts callable via MCP:

| Prompt/Command | Description |
|----------------|-------------|
| `search`       | Find specific UI block by name. |
| `create-ui`    | Create a new UI block using our exisitng blocks. |
| `customization-guidelines` | Defines which parts of installed blocks can be safely modified. |


## Example Usage

Once configured, you can ask questions like:

> "List all available UI blocks"

> "Give me the code for the accordion-01 component"

> "Create a landing page for a coffee shop using a hero-01 block, a 3-column feature grid, and a dark-themed footer."

## Credits

Created by [shadcnspace](https://shadcnspace.com).

[MIT](LICENSE)
