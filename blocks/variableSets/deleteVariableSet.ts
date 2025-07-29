import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";

export const deleteVariableSetBlock: AppBlock = {
  name: "Delete Variable Set",
  description: "Delete a variable set",
  category: "Variable Sets",

  inputs: {
    default: {
      config: {
        variableSetId: {
          name: "Variable Set ID",
          type: "string",
          description: "The ID of the variable set to delete",
          required: true,
        },
      },
      onEvent: async (input) => {
        const { variableSetId } = input.event.inputConfig;

        await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/varsets/${variableSetId}`,
          { method: "DELETE" },
        );

        await events.emit({ variableSetId });
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
            description: "The ID of the deleted variable set",
          },
        },
        required: ["variableSetId"],
      },
    },
  },
};
