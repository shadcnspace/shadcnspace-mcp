#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  fetchComponentDetails,
  fetchMultipleComponentDetails,
  fetchUIBlocks,
  fetchUIComponents,
} from "./utils/api.js";

const server = new McpServer({
  name: "ShadcnSpace MCP",
  version: "1.1.0",
  description:
    "Provides tools and prompts for exploring, installing, and customizing Shadcn Space blocks in a project. Agents can use it to list available blocks, install them, and guide content customization.",
});

// -----------------------------------------
// Tools Registrations
// -----------------------------------------

// Register tools for Listing Blocks
server.registerTool(
  "listBlocks",
  {
    title: "List All Blocks",
    description:
      "Provides a complete list of all Shadcn Space blocks that can be used in a project. Agents can use this to explore available block types before deciding which ones to add or customize.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const uiBlocks = await fetchUIBlocks();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(uiBlocks, null, 2),
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: "text",
            text: "Failed to fetch MagicUI Blocks",
          },
        ],
        isError: true,
      };
    }
  },
);

// Register tools for Listing Compopnents
server.registerTool(
  "listComponents",
  {
    title: "List All Components",
    description:
      "Provides a full list of Shadcn Space components. Agents can use this to discover components to build pages or sections within a project.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const uiComponents = await fetchUIComponents();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(uiComponents, null, 2),
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: "text",
            text: "Failed to fetch MagicUI components",
          },
        ],
        isError: true,
      };
    }
  },
);

// Register tools for adding a Block
server.registerTool(
  "getBlockInstall",
  {
    title: "Get Block Installation Command",
    description:
      "Returns the official installation command for a specific Shadcn Space block. Agents can use this to add a block to the project automatically before customizing it.",
    inputSchema: z.object({
      name: z
        .string()
        .describe("The exact name of the block, e.g., 'hero-01'."),
    }),
  },
  async ({ name }) => {
    try {
      const componentDetails = await fetchComponentDetails(name);      
      process.stderr.write(`Fetched ${componentDetails} blocks\n`);

      if (!componentDetails || !componentDetails.files?.length) {
        return {
          content: [
            {
              type: "text",
              text: `Component "${name}" not found.`,
            },
          ],
          isError: true,
        };
      }

      const installCommand = `npx shadcn@latest add @shadcn-space/${name}`;

      return {
        content: [
          {
            type: "text",
            text: `Block "${name}" found.

AGENT RULE:
You MUST install this component using the command below.
You are NOT allowed to recreate, rewrite, or approximate this component.

Install command:
${installCommand}
`,
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch component "${name}"`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Register tools for Searching a Block by keyword
server.registerTool(
  "searchBlocks",
  {
    title: "Search Blocks by Keyword",
    description:
      "Search Shadcn Space blocks using keywords or tags. Agents can use this to find relevant blocks when building a page based on user requirements or content type.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("Keyword or tag to search for relevant blocks."),
    }),
  },
  async ({ query }) => {
    const blocks = await fetchUIBlocks();
    const filtered = blocks.filter(
      (b: { name: string | string[]; tags: any[] }) =>
        b.name.includes(query) || b.tags?.some((t) => t.includes(query)),
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(filtered, null, 2),
        },
      ],
    };
  },
);

// Register tools for Listing Installed Blocks
server.registerTool(
  "listInstalledBlocks",
  {
    title: "List Installed Blocks",
    description:
      "Lists all blocks that are currently installed in the project. Agents can use this to determine which blocks are available for customization or updating, and optionally filter by specific block names.",
    inputSchema: z.object({
      names: z
        .array(z.string())
        .optional()
        .describe(
          "Optional list of block names to filter the installed blocks.",
        ),
    }),
  },
  async ({ names }) => {
    // If no names provided → return all installed blocks
    const blocks = names?.length
      ? await fetchMultipleComponentDetails(names)
      : await fetchUIBlocks();

    const normalized = blocks.map(
      (b: { name: any; title: any; files: any }) => ({
        name: b.name,
        title: b.title,
        files: b.files ?? [],
      }),
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              blocks: normalized,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// -----------------------------------------
// Prompts Registrations
// -----------------------------------------

// Register prompt for Searching Components and Blocks
server.registerPrompt(
  "search",
  {
    title: "Search Components",
    description: "Search for a component to use in your project.",
    argsSchema: {
      topic: z.string().describe("What kind of component are you looking for?"),
    },
  },
  (args) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need ShadcnSpace components related to "${args.topic}". Use the searchBlocks tool to find them.`,
        },
      },
    ],
  }),
);

// Register prompt for Creating UI Architecture
server.registerPrompt(
  "create-ui",
  {
    title: "Create UI Architecture",
    description: "Architect a full UI page using ShadcnSpace blocks.",
    argsSchema: {
      description: z
        .string()
        .describe("Describe the page or section you want to build."),
    },
  },
  (args) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `I want to build the following UI using ShadcnSpace: ${args.description}

          Please follow this workflow:
          1. Search for appropriate blocks using searchBlocks.
          2. For each relevant block, use addBlock to get implementation details.
          3. Provide the 'npx' installation commands for all components.
          4. Show me how to assemble them into a clean layout.`,
        },
      },
    ],
  }),
);

// Add default global prompts or metadata
server.registerPrompt(
  "customization-guidelines",
  {
    title: "Content Customization Guidelines",
    description:
      "Defines which parts of installed blocks can be safely modified (text only). Agents can read this before editing any block files.",
    argsSchema: {},
  },
  () => ({
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: `
You can only modify:
- visible headings, paragraphs, button labels
Do NOT modify:
- component structure, styling, or logic
- hooks, state, imports
Always preserve JSX structure exactly.
          `,
        },
      },
    ],
  }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Error starting MCP server:", err);
  process.exit(1);
});
