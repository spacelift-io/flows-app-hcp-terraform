import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData, extractPagination } from "../../utils/jsonapi.ts";
import { stateVersionOutputSchema } from "../../schemas/stateVersionOutput.ts";
import { paginationSchema } from "../../schemas/pagination.ts";

export const listStateVersionOutputsBlock: AppBlock = {
  name: "List State Version Outputs",
  description: "List outputs from a Terraform state version",
  category: "State",

  inputs: {
    default: {
      config: {
        stateVersionId: {
          name: "State Version ID",
          type: "string",
          description:
            "The ID of the state version to list outputs for (e.g., sv-SDboVZC8TCxXEneJ)",
          required: true,
        },
        pageNumber: {
          name: "Page Number",
          type: "number",
          description: "Page number (starts from 1)",
          required: false,
        },
      },
      onEvent: async (input) => {
        const { stateVersionId, pageNumber } = input.event.inputConfig;

        const config = input.app.config as HCPTerraformConfig;

        // Validate state version ID format
        if (!stateVersionId || !stateVersionId.startsWith("sv-")) {
          throw new Error(
            "State Version ID must be provided and start with 'sv-'",
          );
        }

        // Build query parameters
        const queryParams: Record<string, any> = {};

        if (pageNumber && pageNumber > 0) {
          queryParams["page[number]"] = pageNumber;
        }

        const response = await makeHCPTerraformRequest(
          config,
          `/state-versions/${stateVersionId}/outputs`,
          { queryParams },
        );

        const outputs = extractData(response);
        const pagination = extractPagination(response);

        await events.emit({
          outputs,
          pagination: response.meta?.pagination || pagination,
        });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: {
          outputs: { type: "array", items: stateVersionOutputSchema },
          pagination: paginationSchema,
        },
        required: ["outputs"],
      },
    },
  },
};
