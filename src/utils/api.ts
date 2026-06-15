import { z } from "zod";

// Define schema for general component
const ComponentSchema = z.object({
  name: z.string(),
  title: z.string().optional(), // Only optional because of interactive-hover-button
  type: z.string(),
  description: z.string().optional(), // Only optional because of interactive-hover-button
});

// Define schema for example component
const ExampleComponentSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  registryDependencies: z.array(z.string()),
});

// Define schema for example detail response
const ExampleDetailSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  files: z.array(
    z.object({
      content: z.string(),
    }),
  ),
});

// Function to fetch UI components
export async function fetchUIComponents() {
  try {
    const response = await fetch("https://shadcnspace.com/r/registry.json");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch registry.json: ${response.statusText} (Status: ${response.status})`,
      );
    }
    const data = await response.json();

    return data.items
      .filter((item: any) => item.type === "registry:component")
      .map((item: any) => {
        try {
          return ComponentSchema.parse({
            name: item.name,
            type: item.type,
            description: item.description,
          });
        } catch (parseError) {
          return null;
        }
      });
  } catch (error) {
    return [];
  }
}

// Function to fetch UI pages
export async function fetchUIPages() {
  try {
    const response = await fetch("https://shadcnspace.com/r/registry.json");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch registry.json: ${response.statusText} (Status: ${response.status})`,
      );
    }
    const data = await response.json();

    return data.items
      .filter((item: any) => item.type === "registry:page")
      .map((item: any) => {
        try {
          return ComponentSchema.parse({
            name: item.name,
            type: item.type,
            description: item.description,
            title: item.title,
            isPro: item.isPro,
          });
        } catch (parseError) {
          return null;
        }
      });
  } catch (error) {
    return [];
  }
}
// Function to fetch UI blocks more blocks
export async function fetchUIBlocks() {
  try {
    const response = await fetch("https://shadcnspace.com/r/registry.json");

    if (!response.ok) {
      throw new Error(
        `Failed to Fetch Registry.json : ${response.statusText} (Status: ${response.status})`,
      );
    }
    const data = await response.json();

    return data.items
      .filter((item: any) => item.type === "registry:block")
      .map((item: any) => {
        try {
          return ComponentSchema.parse({
            name: item.name,
            type: item.type,
            description: item.description,
            title: item.title,
            isPro: item.isPro,
          });
        } catch (parseError) {
          return null;
        }
      });
  } catch (error) {
    return [];
  }
}

// Function to fetch individual component details
export async function fetchComponentDetails(name: string) {
  try {
    const response = await fetch(`https://shadcnspace.com/r/registry.json`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch component ${name}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    const component = data.items.find((item: any) => {
      return item.name === name;
    });
    return component;
  } catch (error) {
    console.error(`Error fetching component ${name}:`, error);
    throw error;
  }
}

type BlockMetadata = {
  name: string;
  title: string;
  files: string[];
};

// Function to fetch multiple component details
export async function fetchMultipleComponentDetails(
  nameOrNames?: string | string[],
): Promise<BlockMetadata[]> {
  const res = await fetch("https://shadcnspace.com/r/registry.json");
  const registry = await res.json();
  let blocks = registry.items;

  if (nameOrNames) {
    const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames];
    blocks = blocks.filter((b: any) => names.includes(b.name));
  }

  // Return only metadata + file paths
  return blocks.map((b: any) => ({
    name: b.name,
    title: b.title,
    files: b.files ?? [],
  }));
}
