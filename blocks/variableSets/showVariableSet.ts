import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSetSchema } from "../../schemas/variableSet.ts";

export const showVariableSetBlock: AppBlock = {
  name: "Show Variable Set",
  description: "Fetch details about a specific variable set",
  category: "Variable Sets",

  inputs: {
    default: {
      config: {
        variableSetId: {
          name: "Variable Set ID",
          type: "string",
          description: "The ID of the variable set to show",
          required: true,
        },
      },
      onEvent: async (input) => {
        const { variableSetId } = input.event.inputConfig;

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/varsets/${variableSetId}`,
          { method: "GET" },
        );

        await events.emit({ variableSet: extractData(response) });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: { variableSet: variableSetSchema },
        required: ["variableSet"],
      },
    },
  },
};
