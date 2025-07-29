/**
 * Shared plan schema for HCP Terraform API responses
 */
export const planSchema = {
  type: "object" as const,
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    attributes: {
      type: "object",
      properties: {
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
        generatedConfiguration: { type: "boolean" },
        hasChanges: { type: "boolean" },
        resourceAdditions: { type: "number" },
        resourceChanges: { type: "number" },
        resourceDestructions: { type: "number" },
        resourceImports: { type: "number" },
        status: { type: "string" },
        statusTimestamps: {
          type: "object",
          properties: {
            queuedAt: { type: "string" },
            pendingAt: { type: "string" },
            startedAt: { type: "string" },
            finishedAt: { type: "string" },
          },
        },
        logReadUrl: { type: "string" },
      },
    },
    relationships: { type: "object" },
  },
  required: ["id", "type"],
};
