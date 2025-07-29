/**
 * Variable schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const variableSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    key: { type: "string" },
    value: { type: "string" },
    description: { type: "string" },
    category: { type: "string" },
    hcl: { type: "boolean" },
    sensitive: { type: "boolean" },

    // Flattened relationships
    configurable: { type: "object" },
  },
  required: ["id", "type", "key", "category"],
};
