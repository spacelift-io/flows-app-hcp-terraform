import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSchema } from "../../schemas/variable.ts";

export const addVariableToVariableSetBlock: AppBlock = {
  name: "Add Variable to Variable Set",
  description: "Add a variable to a variable set",
  category: "Variable Sets",

  inputs: {
    default: {
      config: {
        variableSetId: {
          name: "Variable Set ID",
          type: "string",
          description: "The ID of the variable set to add the variable to",
          required: true,
        },
        key: {
          name: "Variable Key",
          type: "string",
          description: "The name of the variable",
          required: true,
        },
        value: {
          name: "Variable Value",
          type: "string",
          description: "The value of the variable",
          required: true,
          sensitive: true, // Default to sensitive for security
        },
        description: {
          name: "Description",
          type: "string",
          description: "The description of the variable",
          required: false,
        },
        category: {
          name: "Category",
          type: {
            type: "string",
            enum: ["terraform", "env"],
          },
          description: "Whether this is a Terraform or environment variable",
          required: true,
        },
        hcl: {
          name: "HCL",
          type: "boolean",
          description: "Whether to evaluate the value as HCL code",
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
        const {
          variableSetId,
          key,
          value,
          description,
          category,
          hcl,
          sensitive,
        } = input.event.inputConfig;

        const payload = {
          data: {
            type: "vars",
            attributes: {
              key,
              value: value || "",
              description: description || "",
              category,
              hcl: hcl || false,
              sensitive: sensitive || false,
            },
          },
        };

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/varsets/${variableSetId}/relationships/vars`,
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
