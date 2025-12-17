// Helper function to format component names
export function formatComponentName(name) {
    return name
        .split("-")
        .map((part) => {
        return part.charAt(0).toUpperCase() + part.slice(1);
    })
        .join("");
}
//# sourceMappingURL=formatters.js.map