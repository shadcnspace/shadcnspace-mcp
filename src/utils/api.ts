
import { z } from "zod";

// Define schema for general component
 const ComponentSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(), // Only optional because of interactive-hover-button
});

// Define schema for an individual example
const ExampleSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  content: z.string(),
});

// Define schema for individual component with content and examples
 const IndividualComponentSchema = ComponentSchema.extend({
  install: z.string(),
  content: z.string(),
  examples: z.array(ExampleSchema),
});

// Define schema for component detail response
 const ComponentDetailSchema = z.object({
  name: z.string(),
  type: z.string(),
  files: z.array(
    z.object({
      content: z.string(),
    }),
  ),
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
    const response = await fetch("https://tailwind-admin.com/r/registry.json");
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

// Function to fetch individual component details
export async function fetchComponentDetails(name: string) {
  try {
    const response = await fetch(`https://tailwind-admin.com/r/${name}.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch component ${name}: ${response.statusText}`,
      );
    }
    const data = await response.json();
    return ComponentDetailSchema.parse(data);
  } catch (error) {
    console.error(`Error fetching component ${name}:`, error);
    throw error;
  }
}

// Function to fetch example components
export async function fetchExampleComponents() {
  try {
    const response = await fetch("https://tailwind-admin.com/r/registry.json");
    const data = await response.json();

    return data.items
      .map((item: any) => {
        return ExampleComponentSchema.parse({
          name: item.name,
          type: item.type,
          description: item.description,
          registryDependencies: item.registryDependencies,
        });
      });
  } catch (error) {
    console.error("Error fetching MagicUI example components:", error);
    return [];
  }
}

// Function to fetch details for a specific example
export async function fetchExampleDetails(exampleName: string) {
  try {
    const response = await fetch(`https://tailwind-admin.com/r/${exampleName}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch example details for ${exampleName}: ${response.statusText}`,
      );
    }
    const data = await response.json();
    return ExampleDetailSchema.parse(data);
  } catch (error) {
    console.error(`Error fetching example details for ${exampleName}:`, error);
    throw error;
  }
}
