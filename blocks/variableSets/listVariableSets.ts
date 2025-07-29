import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSetSchema } from "../../schemas/variableSet.ts";
import { paginationSchema } from "../../schemas/pagination.ts";

export const listVariableSetsBlock: AppBlock = {
  name: "List Variable Sets",
  description: "List variable sets for organization, project, or workspace",
  category: "Variable Sets",

  inputs: {
    default: {
      config: {
        scope: {
          name: "Scope",
          type: {
            type: "string",
            enum: ["organization", "project", "workspace"],
          },
          description: "The scope to list variable sets from",
          required: true,
          default: "organization",
        },
        projectId: {
          name: "Project ID",
          type: "string",
          description: "Project ID (required for project scope)",
          required: false,
        },
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "Workspace ID (required for workspace scope)",
          required: false,
        },
        pageNumber: {
          name: "Page Number",
          type: "number",
          description: "Page number for pagination (default: 1)",
          required: false,
          default: 1,
        },
        search: {
          name: "Search Query",
          type: "string",
          description: "Search query string to filter variable sets by name",
          required: false,
        },
      },
      onEvent: async (input) => {
        const { scope, projectId, workspaceId, pageNumber, search } =
          input.event.inputConfig;
        const appConfig = input.app.config as HCPTerraformConfig;

        // Build endpoint based on scope
        let endpoint: string;
        switch (scope) {
          case "organization":
            endpoint = `/organizations/${appConfig.organization}/varsets`;
            break;
          case "project":
            if (!projectId) {
              throw new Error("Project ID is required for project scope");
            }
            endpoint = `/projects/${projectId}/varsets`;
            break;
          case "workspace":
            if (!workspaceId) {
              throw new Error("Workspace ID is required for workspace scope");
            }
            endpoint = `/workspaces/${workspaceId}/varsets`;
            break;
          default:
            throw new Error(`Invalid scope: ${scope}`);
        }

        // Build query parameters
        const queryParams: any = {};

        if (pageNumber !== undefined && pageNumber > 0) {
          queryParams["page[number]"] = pageNumber;
        }

        if (search) {
          queryParams.q = search;
        }

        const response = await makeHCPTerraformRequest(appConfig, endpoint, {
          method: "GET",
          queryParams,
        });

        await events.emit({
          variableSets: extractData(response),
          pagination: response.meta?.pagination,
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
          variableSets: {
            type: "array",
            items: variableSetSchema,
          },
          pagination: paginationSchema,
        },
        required: ["variableSets"],
      },
    },
  },
};
