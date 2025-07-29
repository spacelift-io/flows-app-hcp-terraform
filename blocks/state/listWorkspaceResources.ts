import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData, extractPagination } from "../../utils/jsonapi.ts";
import { workspaceResourceSchema } from "../../schemas/workspaceResource.ts";
import { paginationSchema } from "../../schemas/pagination.ts";

export const listWorkspaceResourcesBlock: AppBlock = {
  name: "List Workspace Resources",
  description: "List all Terraform-managed resources in a workspace",
  category: "State",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description:
            "The ID of the workspace to list resources from (e.g., ws-DiTzUDRpjrArAfSS)",
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
        const { workspaceId, pageNumber } = input.event.inputConfig;

        const config = input.app.config as HCPTerraformConfig;

        // Validate workspace ID format
        if (!workspaceId || !workspaceId.startsWith("ws-")) {
          throw new Error("Workspace ID must be provided and start with 'ws-'");
        }

        // Build query parameters
        const queryParams: Record<string, any> = {};

        if (pageNumber && pageNumber > 0) {
          queryParams["page[number]"] = pageNumber;
        }

        const response = await makeHCPTerraformRequest(
          config,
          `/workspaces/${workspaceId}/resources`,
          { queryParams },
        );

        const resources = extractData(response);
        const pagination = extractPagination(response);

        await events.emit({
          resources,
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
          resources: { type: "array", items: workspaceResourceSchema },
          pagination: paginationSchema,
        },
        required: ["resources"],
      },
    },
  },
};
