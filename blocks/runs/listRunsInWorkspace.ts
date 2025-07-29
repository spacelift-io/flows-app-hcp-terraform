import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData, extractPagination } from "../../utils/jsonapi.ts";
import { runSchema } from "../../schemas/run.ts";
import { paginationSchema } from "../../schemas/pagination.ts";

export const listRunsInWorkspaceBlock: AppBlock = {
  name: "List Runs in Workspace",
  description:
    "List all runs for a specific workspace with optional filtering and pagination",
  category: "Runs",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "ID of the workspace to list runs for",
          required: true,
        },
        pageNumber: {
          name: "Page Number",
          type: "number",
          description: "Page number (starts from 1)",
          required: false,
          default: 1,
        },
        filterOperation: {
          name: "Filter by Operation",
          type: ["string"],
          description: "Array of operations (e.g., 'plan', 'apply', 'destroy')",
          required: false,
        },
        filterStatus: {
          name: "Filter by Status",
          type: ["string"],
          description:
            "Array of statuses (e.g., 'pending', 'planning', 'applied')",
          required: false,
        },
        filterStatusGroup: {
          name: "Filter by Status Group",
          type: "string",
          description:
            "Single status group filter (e.g., 'finished', 'running')",
          required: false,
        },
        filterAgentPoolNames: {
          name: "Filter by Agent Pool Names",
          type: ["string"],
          description: "List of agent pool names",
          required: false,
        },
        filterSource: {
          name: "Filter by Source",
          type: ["string"],
          description: "Array of sources (e.g., 'tfe-api', 'tfe-ui', 'vcs')",
          required: false,
        },
        filterTimeframe: {
          name: "Filter by Timeframe",
          type: "string",
          description:
            "Year period filter (integer year or 'year' for past year)",
          required: false,
        },
        searchUser: {
          name: "Search by User",
          type: "string",
          description: "Search for runs that match the VCS username",
          required: false,
        },
        searchCommit: {
          name: "Search by Commit",
          type: "string",
          description: "Search for runs that match the commit SHA",
          required: false,
        },
        searchBasic: {
          name: "Basic Search",
          type: "string",
          description:
            "Search for runs by VCS username, commit SHA, run ID, or run message",
          required: false,
        },
      },
      onEvent: async (input) => {
        const {
          workspaceId,
          pageNumber,
          filterOperation,
          filterStatus,
          filterStatusGroup,
          filterAgentPoolNames,
          filterSource,
          filterTimeframe,
          searchUser,
          searchCommit,
          searchBasic,
        } = input.event.inputConfig;

        // Build query parameters
        const queryParams: Record<string, any> = {};

        // Pagination parameters
        if (pageNumber && pageNumber > 0) {
          queryParams["page[number]"] = pageNumber;
        }

        // Filter parameters
        if (filterOperation) {
          queryParams["filter[operation]"] = filterOperation;
        }
        if (filterStatus) {
          queryParams["filter[status]"] = filterStatus.join(",");
        }
        if (filterStatusGroup) {
          queryParams["filter[status_group]"] = filterStatusGroup;
        }
        if (filterAgentPoolNames) {
          queryParams["filter[agent_pool_names]"] =
            filterAgentPoolNames.join(",");
        }
        if (filterSource) {
          queryParams["filter[source]"] = filterSource.join(",");
        }
        if (filterTimeframe) {
          queryParams["filter[timeframe]"] = filterTimeframe;
        }

        // Search parameters
        if (searchUser) {
          queryParams["search[user]"] = searchUser;
        }
        if (searchCommit) {
          queryParams["search[commit]"] = searchCommit;
        }
        if (searchBasic) {
          queryParams["search[basic]"] = searchBasic;
        }

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/workspaces/${workspaceId}/runs`,
          { queryParams },
        );

        const runs = extractData(response);
        const pagination = extractPagination(response);

        await events.emit({
          runs,
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
          runs: { type: "array", items: runSchema },
          pagination: paginationSchema,
        },
        required: ["runs"],
      },
    },
  },
};
