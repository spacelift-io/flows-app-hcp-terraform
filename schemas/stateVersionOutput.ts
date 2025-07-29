/**
 * State version output schema for HCP Terraform API responses
 * Note: This schema represents the flattened structure after JSON:API processing by extractData()
 */
export const stateVersionOutputSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    name: { type: "string" },
    sensitive: { type: "boolean" },
    valueType: { type: "string" },
    value: {}, // Can be any type (string, number, array, object)
    detailedType: {
      type: "array",
      items: {},
    },
  },
  required: ["id", "type", "name", "sensitive"],
};
