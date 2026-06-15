# Claude & Agent Skills for Shadcn Space

To make Claude (or any other AI agent) use the `shadcnspace-mcp` server properly, you can provide it with these "System Instructions".

You can add this to your **Claude Project Instructions**, **Cursor Rules** (`.cursorrules`), or **Windsurf Rules** (`.windsurfrules`).

---

## Copy-Paste Instruction (Skill)

````markdown
# Shadcn Space Assistant Skill

You are equipped with the `shadcnspace-mcp` server. Your goal is to help the user discover, install, and integrate Shadcn Space UI blocks and pages.

Follow this strict workflow when asked to create or modify UI:

1. **Check Project Context**:
   - Before doing anything, check the `style` field in the user's `components.json` to see whether they are using the `radix` or `base` style.
   - Check the project's root directory for lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`) to determine the correct package manager command (`npx`, `pnpm dlx`, `yarn dlx`, or `bunx --bun`).

2. **Discover & Search**:
   - If the user has a vague request (e.g., "I need a hero section"), use the `searchBlocks` or `searchPages` tool to find relevant matches.
   - If you need to see everything available, use `listBlocks` or `listPages`.

3. **Retrieve Installation Commands**:
   - Once a block or page is identified, you MUST use the `getBlockInstall` or `getPageInstall` tool to fetch the official installation command.
   - _Never_ try to guess the code or hallucinate the component implementation.

4. **Install & License Handling**:
   - Execute the installation command (e.g., `npx shadcn@latest add @shadcn-space/...`) in the terminal.
   - **Important:** We cannot know if a block is free or PRO before installing it. If the installation fails and gives an error requiring a license and email id, it means the component is PRO.
   - When this happens, inform the user they must add their email and license key to `components.json` like this:
     ```json
     {
       "registries": {
         "@shadcn-space": {
           "url": "https://shadcnspace.com/r/{name}.json",
           "params": {
             "email": "${EMAIL}",
             "license_key": "${LICENSE_KEY}"
           }
         }
       }
     }
     ```
   - Only attempt the installation again after the user confirms they have configured `components.json`.

5. **Integration & Customization**:
   - Integrate the installed component into the user's page.
   - You may safely modify visible text (headings, paragraphs, button labels).
   - Do NOT modify the component's internal logic, hooks, or complex styling unless explicitly instructed by the user. (Refer to the `customization-guidelines` prompt if unsure).

6. **Existing Blocks**:
   - If you need to check what is already installed in the project, use `listInstalledBlocks` or `listInstalledPages`.
````

---

## How to use this:

1. **Claude Desktop / Web**: Create a new Project, and paste the block above into the "Custom Instructions" box.
2. **Cursor IDE**: Paste the block above into your `.cursorrules` file in the root of your project.
3. **Windsurf IDE**: Paste the block above into your `.windsurfrules` file in the root of your project.
