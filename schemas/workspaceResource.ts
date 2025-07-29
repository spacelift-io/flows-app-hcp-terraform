/**
 * Workspace resource schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const workspaceResourceSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    address: { type: "string" },
    name: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
    module: { type: "string" },
    provider: { type: "string" },
    providerType: { type: "string" },
    modifiedByStateVersionId: { type: "string" },
    nameIndex: { oneOf: [{ type: "number" }, { type: "null" }] },
  },
  required: ["id", "type", "address", "name"],
};
