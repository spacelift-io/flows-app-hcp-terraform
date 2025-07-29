import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSchema } from "../../schemas/variable.ts";

export const listVariablesBlock: AppBlock = {
  name: "List Variables",
  description: "List variables for a workspace",
  category: "Variables",

  inputs: {
    default: {
      config: {
        workspaceName: {
          name: "Workspace Name",
          type: "string",
          description: "The name of the workspace to list variables for",
          required: true,
        },
      },
      onEvent: async (input) => {
        const { workspaceName } = input.event.inputConfig;
        const appConfig = input.app.config as HCPTerraformConfig;

        const queryParams = {
          "filter[workspace][name]": workspaceName,
          "filter[organization][name]": appConfig.organization,
        };

        const response = await makeHCPTerraformRequest(appConfig, "/vars", {
          method: "GET",
          queryParams,
        });

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
