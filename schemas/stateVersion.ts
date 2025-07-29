/**
 * State version schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const stateVersionSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    billableRumCount: { type: "number" },
    createdAt: { type: "string" },
    size: { type: "number" },
    hostedStateDownloadUrl: { type: "string" },
    hostedStateUploadUrl: {
      oneOf: [{ type: "string" }, { type: "null" }],
    },
    hostedJsonStateDownloadUrl: { type: "string" },
    hostedJsonStateUploadUrl: {
      oneOf: [{ type: "string" }, { type: "null" }],
    },
    status: { type: "string" },
    intermediate: { type: "boolean" },
    modules: { type: "object" },
    providers: { type: "object" },
    resources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          count: { type: "number" },
          module: { type: "string" },
          provider: { type: "string" },
        },
      },
    },
    resourcesProcessed: { type: "boolean" },
    serial: { type: "number" },
    stateVersion: { type: "number" },
    terraformVersion: { type: "string" },
    vcsCommitSha: { type: "string" },
    vcsCommitUrl: { type: "string" },
    // Flattened relationships
    run: { type: "object" },
    createdBy: { type: "object" },
    workspace: { type: "object" },
    outputs: { type: "array" },
  },
  required: ["id", "type"],
};
