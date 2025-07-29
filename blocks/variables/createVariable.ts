import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSchema } from "../../schemas/variable.ts";

export const createVariableBlock: AppBlock = {
  name: "Create Variable",
  description: "Create a new variable in a workspace",
  category: "Variables",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "The ID of the workspace that owns the variable",
          required: true,
        },
        key: {
          name: "Variable Name",
          type: "string",
          description: "The name of the variable",
          required: true,
        },
        value: {
          name: "Variable Value",
          type: "string",
          description: "The value of the variable",
          required: true,
          sensitive: true,
        },
        description: {
          name: "Description",
          type: "string",
          description: "The description of the variable",
          required: false,
        },
        category: {
          name: "Category",
          description: "Whether this is a Terraform or environment variable",
          type: {
            type: "string",
            enum: ["terraform", "env"],
          },
          required: true,
          default: "terraform",
        },
        hcl: {
          name: "HCL",
          type: "boolean",
          description:
            "Whether to evaluate the value of the variable as a string of HCL code",
          required: false,
          default: false,
        },
        sensitive: {
          name: "Sensitive",
          type: "boolean",
          description: "Whether the value is sensitive",
          required: false,
          default: true,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;

        const payload = {
          data: {
            type: "vars",
            attributes: {
              key: inputConfig.key,
              value: inputConfig.value || "",
              description: inputConfig.description || "",
              category: inputConfig.category,
              hcl: inputConfig.hcl || false,
              sensitive: inputConfig.sensitive || false,
            },
            relationships: {
              workspace: {
                data: {
                  id: inputConfig.workspaceId,
                  type: "workspaces",
                },
              },
            },
          },
        };

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          "/vars",
          {
            method: "POST",
            body: payload,
          },
        );

        await events.emit({ variable: extractData(response) });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: { variable: variableSchema },
        required: ["variable"],
      },
    },
  },
};
