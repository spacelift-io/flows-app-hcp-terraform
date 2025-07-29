import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSchema } from "../../schemas/variable.ts";

export const updateVariableBlock: AppBlock = {
  name: "Update Variable",
  description: "Update an existing variable",
  category: "Variables",

  inputs: {
    default: {
      config: {
        variableId: {
          name: "Variable ID",
          type: "string",
          description: "The ID of the variable to update",
          required: true,
        },
        key: {
          name: "Variable Name",
          type: "string",
          description: "The name of the variable",
          required: false,
        },
        value: {
          name: "Variable Value",
          type: "string",
          description: "The value of the variable",
          required: false,
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
          required: false,
        },
        hcl: {
          name: "HCL",
          type: "boolean",
          description:
            "Whether to evaluate the value of the variable as a string of HCL code",
          required: false,
        },
        sensitive: {
          name: "Sensitive",
          type: "boolean",
          description: "Whether the value is sensitive",
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;

        const attributes: any = {};

        if (inputConfig.key !== undefined) attributes.key = inputConfig.key;
        if (inputConfig.value !== undefined)
          attributes.value = inputConfig.value;
        if (inputConfig.description !== undefined)
          attributes.description = inputConfig.description;
        if (inputConfig.category !== undefined)
          attributes.category = inputConfig.category;
        if (inputConfig.hcl !== undefined) attributes.hcl = inputConfig.hcl;
        if (inputConfig.sensitive !== undefined)
          attributes.sensitive = inputConfig.sensitive;

        const payload = {
          data: {
            id: inputConfig.variableId,
            type: "vars",
            attributes,
          },
        };

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/vars/${inputConfig.variableId}`,
          {
            method: "PATCH",
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
