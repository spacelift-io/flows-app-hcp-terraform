import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";

export const deleteVariableFromVariableSetBlock: AppBlock = {
  name: "Delete Variable from Variable Set",
  description: "Delete a variable from a variable set",
  category: "Variable Sets",

  inputs: {
    default: {
      config: {
        variableSetId: {
          name: "Variable Set ID",
          type: "string",
          description: "The ID of the variable set",
          required: true,
        },
        variableId: {
          name: "Variable ID",
          type: "string",
          description: "The ID of the variable to delete",
          required: true,
        },
      },
      onEvent: async (input) => {
        const { variableSetId, variableId } = input.event.inputConfig;

        await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/varsets/${variableSetId}/relationships/vars/${variableId}`,
          { method: "DELETE" },
        );

        await events.emit({ variableSetId, variableId });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: {
          variableSetId: {
            type: "string",
            description: "The ID of the variable set",
          },
          variableId: {
            type: "string",
            description: "The ID of the deleted variable",
          },
        },
        required: ["variableSetId", "variableId"],
      },
    },
  },
};
