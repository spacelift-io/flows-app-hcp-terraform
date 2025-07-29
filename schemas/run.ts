/**
 * Shared run schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const runSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    actions: {
      type: "object",
      properties: {
        isCancelable: { type: "boolean" },
        isConfirmable: { type: "boolean" },
        isDiscardable: { type: "boolean" },
        isForceCancelable: { type: "boolean" },
      },
    },
    canceledAt: { type: "string" },
    createdAt: { type: "string" },
    hasChanges: { type: "boolean" },
    autoApply: { type: "boolean" },
    allowEmptyApply: { type: "boolean" },
    allowConfigGeneration: { type: "boolean" },
    isDestroy: { type: "boolean" },
    message: { type: "string" },
    planOnly: { type: "boolean" },
    source: { type: "string" },
    statusTimestamps: { type: "object" },
    status: { type: "string" },
    triggerReason: { type: "string" },
    targetAddrs: { type: "array", items: { type: "string" } },
    permissions: {
      type: "object",
      properties: {
        canApply: { type: "boolean" },
        canCancel: { type: "boolean" },
        canComment: { type: "boolean" },
        canDiscard: { type: "boolean" },
        canForceExecute: { type: "boolean" },
        canForceCancel: { type: "boolean" },
        canOverridePolicyCheck: { type: "boolean" },
      },
    },
    refresh: { type: "boolean" },
    refreshOnly: { type: "boolean" },
    replaceAddrs: { type: "array", items: { type: "string" } },
    savePlan: { type: "boolean" },
    variables: { type: "array", items: { type: "object" } },
    terraformVersion: { type: "string" },
    updatedAt: { type: "string" },
    createdBy: { type: "object" },

    // Flattened relationships
    apply: { type: "object" },
    plan: { type: "object" },
    configurationVersion: { type: "object" },
    workspace: { type: "object" },
    runEvents: { type: "array" },
    comments: { type: "array" },
    policyChecks: { type: "array" },
    taskStages: { type: "array" },
  },
  required: ["id", "type"],
};
