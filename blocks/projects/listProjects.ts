import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData, extractPagination } from "../../utils/jsonapi.ts";
import { projectSchema } from "../../schemas/project.ts";
import { paginationSchema } from "../../schemas/pagination.ts";

export const listProjectsBlock: AppBlock = {
  name: "List Projects",
  description:
    "List all projects in an organization with optional filtering and pagination",
  category: "Projects",

  inputs: {
    default: {
      config: {
        pageNumber: {
          name: "Page Number",
          type: "number",
          description: "Page number (starts from 1)",
          required: false,
        },
        search: {
          name: "Search Query",
          type: "string",
          description:
            "Search query string to filter projects by name (case-insensitive)",
          required: false,
        },
        filterNames: {
          name: "Filter by Names",
          type: ["string"],
          description: "Array of project names to filter by (case-insensitive)",
          required: false,
        },
        filterCanCreateWorkspace: {
          name: "Filter: Can Create Workspace",
          type: "boolean",
          description: "Only return projects where user can create workspaces",
          required: false,
        },
        filterCanUpdate: {
          name: "Filter: Can Update",
          type: "boolean",
          description: "Only return projects where user can update",
          required: false,
        },
        sortBy: {
          name: "Sort By",
          type: "string",
          description: "Sort field: 'name' (ascending) or '-name' (descending)",
          required: false,
        },
      },
      onEvent: async (input) => {
        const {
          pageNumber,
          search,
          filterNames,
          filterCanCreateWorkspace,
          filterCanUpdate,
          sortBy,
        } = input.event.inputConfig;

        const config = input.app.config as HCPTerraformConfig;
        const organizationName = config.organization;

        // Build query parameters
        const queryParams: Record<string, any> = {};

        // Pagination parameters
        if (pageNumber && pageNumber > 0) {
          queryParams["page[number]"] = pageNumber;
        }

        // Search parameter
        if (search) {
          queryParams.q = search;
        }

        // Filter parameters
        if (filterNames && filterNames.length > 0) {
          queryParams["filter[names]"] = filterNames.join(",");
        }
        if (filterCanCreateWorkspace) {
          queryParams["filter[permissions][create-workspace]"] = "true";
        }
        if (filterCanUpdate) {
          queryParams["filter[permissions][update]"] = "true";
        }

        // Sort parameter
        if (sortBy) {
          queryParams.sort = sortBy;
        }

        const response = await makeHCPTerraformRequest(
          config,
          `/organizations/${organizationName}/projects`,
          { queryParams },
        );

        const projects = extractData(response);
        const pagination = extractPagination(response);

        await events.emit({
          projects,
          pagination: response.meta?.pagination || pagination,
          statusCounts: response.meta?.statusCounts,
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
          projects: { type: "array", items: projectSchema },
          pagination: paginationSchema,
          statusCounts: {
            type: "object",
            properties: {
              total: { type: "number" },
              matching: { type: "number" },
            },
          },
        },
        required: ["projects"],
      },
    },
  },
};
