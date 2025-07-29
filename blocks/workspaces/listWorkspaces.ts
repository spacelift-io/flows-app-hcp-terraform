import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData, extractPagination } from "../../utils/jsonapi.ts";
import { workspaceSchema } from "../../schemas/workspace.ts";
import { paginationSchema } from "../../schemas/pagination.ts";

export const listWorkspacesBlock: AppBlock = {
  name: "List Workspaces",
  description: "Lists all workspaces in the organization",
  category: "Workspaces",

  inputs: {
    default: {
      config: {
        searchName: {
          name: "Search Name",
          type: "string",
          description: "Search workspaces by name (fuzzy search)",
          required: false,
        },
        searchTags: {
          name: "Search Tags",
          type: ["string"],
          description: "Filter by tags (AND logic)",
          required: false,
        },
        searchExcludeTags: {
          name: "Exclude Tags",
          type: ["string"],
          description: "Exclude workspaces with these tags (OR logic)",
          required: false,
        },
        searchWildcardName: {
          name: "Wildcard Name Search",
          type: "string",
          description: "Search with wildcards (* for prefix/suffix matching)",
          required: false,
        },
        pageNumber: {
          name: "Page Number",
          type: "number",
          description: "Page number (starts from 1)",
          required: false,
          default: 1,
        },
        sort: {
          name: "Sort",
          type: "string",
          description:
            "Sort by: name, current-run.created-at, latest-change-at (prefix with - for reverse)",
          required: false,
        },
        projectId: {
          name: "Project ID",
          type: "string",
          description: "Filter by specific project ID",
          required: false,
        },
        currentRunStatus: {
          name: "Current Run Status",
          type: "string",
          description: "Filter by current run status",
          required: false,
        },
      },
      onEvent: async (input) => {
        const {
          searchName,
          searchTags,
          searchExcludeTags,
          searchWildcardName,
          pageNumber,
          sort,
          projectId,
          currentRunStatus,
        } = input.event.inputConfig;

        // Build workspace-specific query parameters
        const queryParams: Record<string, any> = {};

        // Search parameters
        if (searchName) {
          queryParams["search[name]"] = searchName;
        }
        if (searchTags) {
          queryParams["search[tags]"] = searchTags.join(",");
        }
        if (searchExcludeTags) {
          queryParams["search[exclude-tags]"] = searchExcludeTags.join(",");
        }
        if (searchWildcardName) {
          queryParams["search[wildcard-name]"] = searchWildcardName;
        }

        // Pagination
        if (pageNumber && pageNumber > 0) {
          queryParams["page[number]"] = pageNumber;
        }

        // Sorting
        if (sort) {
          queryParams.sort = sort;
        }

        // Filtering
        if (projectId) {
          queryParams["filter[project][id]"] = projectId;
        }
        if (currentRunStatus) {
          queryParams["filter[current-run][status]"] = currentRunStatus;
        }

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/organizations/${input.app.config.organization}/workspaces`,
          { queryParams },
        );

        const workspaces = extractData(response);
        const pagination = extractPagination(response);

        await events.emit({
          workspaces,
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
          workspaces: { type: "array", items: workspaceSchema },
          pagination: paginationSchema,
        },
        required: ["workspaces"],
      },
    },
  },
};
