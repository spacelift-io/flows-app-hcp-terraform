/**
 * Project schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const projectSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    name: { type: "string" },
    description: { oneOf: [{ type: "string" }, { type: "null" }] },
    workspaceCount: { type: "number" },
    teamCount: { type: "number" },
    permissions: {
      type: "object",
      properties: {
        canUpdate: { type: "boolean" },
        canDestroy: { type: "boolean" },
        canCreateWorkspace: { type: "boolean" },
      },
    },
    // Flattened relationships
    organization: { type: "object" },
    tagBindings: { type: "object" },
    effectiveTagBindings: { type: "object" },
  },
  required: ["id", "type", "name"],
};
