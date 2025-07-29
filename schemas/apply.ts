/**
 * Apply schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const applySchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    executionDetails: {
      type: "object",
      properties: {
        mode: { type: "string" },
        agentId: { type: "string" },
        agentName: { type: "string" },
        agentPoolId: { type: "string" },
        agentPoolName: { type: "string" },
      },
    },
    status: { type: "string" },
    statusTimestamps: {
      type: "object",
      properties: {
        queuedAt: { type: "string" },
        startedAt: { type: "string" },
        finishedAt: { type: "string" },
      },
    },
    logReadUrl: { type: "string" },
    resourceAdditions: { type: "number" },
    resourceChanges: { type: "number" },
    resourceDestructions: { type: "number" },
    resourceImports: { type: "number" },

    // Flattened relationships
    stateVersions: { type: "array", items: { type: "object" } },
  },
  required: ["id", "type", "status"],
};
