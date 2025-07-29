import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSchema } from "../../schemas/variable.ts";

export const listVariablesInVariableSetBlock: AppBlock = {
  name: "List Variables in Variable Set",
  description: "List all variables in a variable set",
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
      },
      onEvent: async (input) => {
        const { variableSetId } = input.event.inputConfig;

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/varsets/${variableSetId}/relationships/vars`,
          { method: "GET" },
        );

        await events.emit({ variables: extractData(response) });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: {
          variables: {
            type: "array",
            items: variableSchema,
          },
        },
        required: ["variables"],
      },
    },
  },
};
