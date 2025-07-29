/**
 * Variable Set schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const variableSetSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    global: { type: "boolean" },
    priority: { type: "boolean" },

    // Flattened relationships
    workspaces: { type: "array", items: { type: "object" } },
    projects: { type: "array", items: { type: "object" } },
    vars: { type: "array", items: { type: "object" } },
    parent: { type: "object" },
  },
  required: ["id", "type", "name"],
};
