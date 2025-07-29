import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSchema } from "../../schemas/variable.ts";

export const updateVariableInVariableSetBlock: AppBlock = {
  name: "Update Variable in Variable Set",
  description: "Update a variable in a variable set",
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
          description: "The ID of the variable to update",
          required: true,
        },
        key: {
          name: "Variable Key",
          type: "string",
          description: "The name of the variable",
          required: false,
        },
        value: {
          name: "Variable Value",
          type: "string",
          description: "The value of the variable",
          required: false,
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
          required: false,
        },
        hcl: {
          name: "HCL",
          type: "boolean",
          description: "Whether to evaluate the value as HCL code",
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
        const {
          variableSetId,
          variableId,
          key,
          value,
          description,
          category,
          hcl,
          sensitive,
        } = input.event.inputConfig;

        const attributes: any = {};
        if (key !== undefined) attributes.key = key;
        if (value !== undefined) attributes.value = value;
        if (description !== undefined) attributes.description = description;
        if (category !== undefined) attributes.category = category;
        if (hcl !== undefined) attributes.hcl = hcl;
        if (sensitive !== undefined) attributes.sensitive = sensitive;

        const payload = {
          data: {
            type: "vars",
            attributes,
          },
        };

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/varsets/${variableSetId}/relationships/vars/${variableId}`,
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
