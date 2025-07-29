import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { applySchema } from "../../schemas/apply.ts";

export const showApplyBlock: AppBlock = {
  name: "Show Apply",
  description: "Get detailed information about a Terraform apply",
  category: "Runs",

  inputs: {
    default: {
      config: {
        applyId: {
          name: "Apply ID",
          type: "string",
          description: "The ID of the apply to show",
          required: true,
        },
      },
      onEvent: async (input) => {
        const { applyId } = input.event.inputConfig;

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/applies/${applyId}`,
          { method: "GET" },
        );

        await events.emit({ apply: extractData(response) });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: { apply: applySchema },
        required: ["apply"],
      },
    },
  },
};
