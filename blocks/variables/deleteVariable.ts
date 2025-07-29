import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";

export const deleteVariableBlock: AppBlock = {
  name: "Delete Variable",
  description: "Delete a variable",
  category: "Variables",

  inputs: {
    default: {
      config: {
        variableId: {
          name: "Variable ID",
          type: "string",
          description: "The ID of the variable to delete",
          required: true,
        },
      },
      onEvent: async (input) => {
        const { variableId } = input.event.inputConfig;

        await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/vars/${variableId}`,
          { method: "DELETE" },
        );

        await events.emit({ variableId });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: { variableId: { type: "string" } },
        required: ["variableId"],
      },
    },
  },
};
