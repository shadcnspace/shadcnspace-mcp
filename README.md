# shadcnspace-mcp

Official ModelContextProtocol (MCP) server for [Shadcn Space](https://shadcnspace.com).

## Install MCP configuration

### Claude Desktop

To use with Claude Desktop, add the following to your `claude_desktop_config.json`:

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

## Available Tools

The server provides the following tools callable via MCP:

| Tool Name | Description |
|-----------|-------------|
| `getUIBlocks` | Provides a comprehensive list of all shadcnspace blocks. |
| `getUIBlock` | Get full implementation details of a specific shadcnspace block by name. |

## Example Usage

Once configured, you can ask questions like:

> "List all available UI blocks"

> "Give me the code for the download-banner block"

## Credits

Created by [shadcnspace](https://shadcnspace.com).

[MIT](LICENSE)