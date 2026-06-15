#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchComponentDetails, fetchMultipleComponentDetails, fetchUIBlocks, fetchUIComponents, fetchUIPages, } from "./utils/api.js";
const server = new McpServer({
    name: "ShadcnSpace MCP",
    version: "1.2.5",
    description: "Provides tools and prompts for exploring, installing, and customizing Shadcn Space blocks in a project. Agents can use it to list available blocks, install them, and guide content customization.",
});
// -----------------------------------------
// Tools Registrations
// -----------------------------------------
// Register tool for getting Agent Skills/Instructions
server.registerTool("get_audit_checklist", {
    title: "Get Agent Skills & Instructions",
    description: "CRITICAL: You MUST execute this tool BEFORE using any other tools in this MCP server. Returns the strict workflow rules and guidelines for agents interacting with Shadcn Space. Agents MUST read this first to understand how to handle free vs PRO components, package managers, and installation flows.",
    inputSchema: z.object({}),
}, async () => {
    const instructions = `
# Shadcn Space Assistant Skill

You are equipped with the \`shadcnspace-mcp\` server. Your goal is to help the user discover, install, and integrate Shadcn Space UI blocks and pages. 

Follow this strict workflow when asked to create or modify UI:

1. **Check Project Context**:
   - Before doing anything, check the \`style\` field in the user's \`components.json\` to see whether they are using the \`radix\` or \`base\` style.
   - Check the project's root directory for lockfiles (\`package-lock.json\`, \`pnpm-lock.yaml\`, \`yarn.lock\`, \`bun.lockb\`) to determine the correct package manager command (\`npx\`, \`pnpm dlx\`, \`yarn dlx\`, or \`bunx --bun\`).

2. **Discover & Search**:
   - If the user has a vague request (e.g., "I need a hero section"), use the \`searchBlocks\` or \`searchPages\` tool to find relevant matches.
   - If you need to see everything available, use \`listBlocks\` or \`listPages\`.

3. **Retrieve Installation Commands**:
   - Once a block or page is identified, you MUST use the \`getBlockInstall\` or \`getPageInstall\` tool to fetch the official installation command. 
   - *Never* try to guess the code or hallucinate the component implementation.

4. **Install & License Handling**:
   - Execute the installation command in the terminal using the correct package manager executor (e.g., \`pnpm dlx shadcn@latest add @shadcn-space/...\`).
   - **Important:** We cannot know if a block is free or PRO before installing it. If the installation fails and gives an error requiring a license and email id, it means the component is PRO.
   - When this happens, inform the user they must add their email and license key to \`components.json\` like this:
     \`\`\`json
     {
       "registries": {
         "@shadcn-space": {
           "url": "https://shadcnspace.com/r/{name}.json",
           "params": {
             "email": "\${EMAIL}",
             "license_key": "\${LICENSE_KEY}"
           }
         }
       }
     }
     \`\`\`
   - Only attempt the installation again after the user confirms they have configured \`components.json\`.

5. **Integration & Customization**:
   - Integrate the installed component into the user's page.
   - You may safely modify visible text (headings, paragraphs, button labels).
   - Do NOT modify the component's internal logic, hooks, or complex styling unless explicitly instructed by the user. (Refer to the \`customization-guidelines\` prompt if unsure).

6. **Existing Blocks**:
   - If you need to check what is already installed in the project, use \`listInstalledBlocks\` or \`listInstalledPages\`.
`;
    return {
        content: [
            {
                type: "text",
                text: instructions,
            },
        ],
    };
});
// Register tools for Listing Blocks
server.registerTool("listBlocks", {
    title: "List All Blocks",
    description: "Provides a complete list of all Shadcn Space blocks that can be used in a project. Agents can use this to explore available block types before deciding which ones to add or customize.",
    inputSchema: z.object({}),
}, async () => {
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
    }
    catch {
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
});
// Register tools for Listing Compopnents
server.registerTool("listComponents", {
    title: "List All Components",
    description: "Provides a full list of Shadcn Space components. Agents can use this to discover components to build pages or sections within a project.",
    inputSchema: z.object({}),
}, async () => {
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
    }
    catch {
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
});
// Register tools for adding a Block
server.registerTool("getBlockInstall", {
    title: "Get Block Installation Command",
    description: "Returns the official installation command for a specific Shadcn Space block. Agents can use this to add a block to the project automatically before customizing it.",
    inputSchema: z.object({
        name: z
            .string()
            .describe("The exact name of the block, e.g., 'hero-01'."),
    }),
}, async ({ name }) => {
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
        return {
            content: [
                {
                    type: "text",
                    text: `Block "${name}" found.

AGENT RULE:
You MUST install this component using the commands below depending on the user's project style. 
Check components.json to determine if the style is 'base' or 'radix'.
Check the project lockfile to determine the correct package manager executor (npx, pnpm dlx, yarn dlx, bunx --bun).
You are NOT allowed to recreate, rewrite, or approximate this component.

For Base style:
<pm> shadcn@latest add @shadcn-space/${name}

For Radix style:
<pm> shadcn@latest add @shadcn-space/radix/${name}

(Replace <pm> with npx, pnpm dlx, yarn dlx, or bunx --bun)
`,
                },
            ],
        };
    }
    catch {
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
});
// Register tools for Searching a Block by keyword
server.registerTool("searchBlocks", {
    title: "Search Blocks by Keyword",
    description: "Search Shadcn Space blocks using keywords or tags. Agents can use this to find relevant blocks when building a page based on user requirements or content type.",
    inputSchema: z.object({
        query: z
            .string()
            .describe("Keyword or tag to search for relevant blocks."),
    }),
}, async ({ query }) => {
    const blocks = await fetchUIBlocks();
    const filtered = blocks.filter((b) => b.name.includes(query) || b.tags?.some((t) => t.includes(query)));
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(filtered, null, 2),
            },
        ],
    };
});
// Register tools for Listing Installed Blocks
server.registerTool("listInstalledBlocks", {
    title: "List Installed Blocks",
    description: "Lists all blocks that are currently installed in the project. Agents can use this to determine which blocks are available for customization or updating, and optionally filter by specific block names.",
    inputSchema: z.object({
        names: z
            .array(z.string())
            .optional()
            .describe("Optional list of block names to filter the installed blocks."),
    }),
}, async ({ names }) => {
    // If no names provided → return all installed blocks
    const blocks = names?.length
        ? await fetchMultipleComponentDetails(names)
        : await fetchUIBlocks();
    const normalized = blocks.map((b) => ({
        name: b.name,
        title: b.title,
        files: b.files ?? [],
    }));
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    blocks: normalized,
                }, null, 2),
            },
        ],
    };
});
// -----------------------------------------
// Prompts Registrations
// -----------------------------------------
// Register tools for Listing Pages
server.registerTool("listPages", {
    title: "List All Pages",
    description: "Provides a complete list of all Shadcn Space pages that can be used in a project. Agents can use this to explore available page types before deciding which ones to add or customize.",
    inputSchema: z.object({}),
}, async () => {
    try {
        const uiPages = await fetchUIPages();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(uiPages, null, 2),
                },
            ],
        };
    }
    catch {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to fetch Shadcn Space Pages",
                },
            ],
            isError: true,
        };
    }
});
// Register tools for adding a Page
server.registerTool("getPageInstall", {
    title: "Get Page Installation Command",
    description: "Returns the official installation command for a specific Shadcn Space page. Agents can use this to add a page to the project automatically before customizing it. NOTE: All pages are PRO components. Agents MUST check components.json for a valid license key before attempting to install pages.",
    inputSchema: z.object({
        name: z
            .string()
            .describe("The exact name of the page, e.g., 'landing-page-01'."),
    }),
}, async ({ name }) => {
    try {
        const componentDetails = await fetchComponentDetails(name);
        process.stderr.write(`Fetched ${componentDetails} pages\n`);
        if (!componentDetails || !componentDetails.files?.length) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Page "${name}" not found.`,
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Page "${name}" found.

AGENT RULE:
You MUST install this page using the commands below depending on the user's project style. 
Check components.json to determine if the style is 'base' or 'radix'.
Check the project lockfile to determine the correct package manager executor (npx, pnpm dlx, yarn dlx, bunx --bun).
You are NOT allowed to recreate, rewrite, or approximate this page.

For Base style:
<pm> shadcn@latest add @shadcn-space/pages/${name.replace(/^pages\//, "")}

For Radix style:
<pm> shadcn@latest add @shadcn-space/pages/radix/${name.replace(/^pages\//, "")}

(Replace <pm> with npx, pnpm dlx, yarn dlx, or bunx --bun)
`,
                },
            ],
        };
    }
    catch {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to fetch page "${name}"`,
                },
            ],
            isError: true,
        };
    }
});
// Register tools for Searching a Page by keyword
server.registerTool("searchPages", {
    title: "Search Pages by Keyword",
    description: "Search Shadcn Space pages using keywords or tags. Agents can use this to find relevant pages when building a site based on user requirements or content type.",
    inputSchema: z.object({
        query: z
            .string()
            .describe("Keyword or tag to search for relevant pages."),
    }),
}, async ({ query }) => {
    const pages = await fetchUIPages();
    const filtered = pages.filter((b) => b.name.includes(query) || b.tags?.some((t) => t.includes(query)));
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(filtered, null, 2),
            },
        ],
    };
});
// Register tools for Listing Installed Pages
server.registerTool("listInstalledPages", {
    title: "List Installed Pages",
    description: "Lists all pages that are currently installed in the project. Agents can use this to determine which pages are available for customization or updating, and optionally filter by specific page names. NOTE: All pages are PRO components. Agents MUST check components.json for a valid license key before attempting to install pages.",
    inputSchema: z.object({
        names: z
            .array(z.string())
            .optional()
            .describe("Optional list of page names to filter the installed pages."),
    }),
}, async ({ names }) => {
    // If no names provided → return all installed pages
    const pages = names?.length
        ? await fetchMultipleComponentDetails(names)
        : await fetchUIPages();
    const normalized = pages.map((b) => ({
        name: b.name,
        title: b.title,
        files: b.files ?? [],
    }));
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    pages: normalized,
                }, null, 2),
            },
        ],
    };
});
// -----------------------------------------
// Prompts Registrations
// -----------------------------------------
// Register prompt for Searching Components and Blocks
server.registerPrompt("search", {
    title: "Search Components",
    description: "Search for a component to use in your project.",
    argsSchema: {
        topic: z.string().describe("What kind of component are you looking for?"),
    },
}, (args) => ({
    messages: [
        {
            role: "user",
            content: {
                type: "text",
                text: `I need ShadcnSpace components related to "${args.topic}". Use the searchBlocks tool to find them.`,
            },
        },
    ],
}));
// Register prompt for Creating UI Architecture
server.registerPrompt("create-ui", {
    title: "Create UI Architecture",
    description: "Architect a full UI page using ShadcnSpace blocks.",
    argsSchema: {
        description: z
            .string()
            .describe("Describe the page or section you want to build."),
    },
}, (args) => ({
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
}));
// Add default global prompts or metadata
server.registerPrompt("customization-guidelines", {
    title: "Content Customization Guidelines",
    description: "Defines which parts of installed blocks can be safely modified (text only). Agents can read this before editing any block files.",
    argsSchema: {},
}, () => ({
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
}));
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((err) => {
    console.error("Error starting MCP server:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map