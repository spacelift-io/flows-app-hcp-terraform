/**
 * Configuration Version schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const configurationVersionSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    autoQueueRuns: { type: "boolean" },
    error: { type: "string" },
    errorMessage: { type: "string" },
    source: { type: "string" },
    speculative: { type: "boolean" },
    status: { type: "string" },
    statusTimestamps: { type: "object" },
    uploadUrl: { type: "string" },
    provisional: { type: "boolean" },

    // Flattened relationships
    ingressAttributes: { type: "object" },
  },
  required: ["id", "type", "status"],
};
