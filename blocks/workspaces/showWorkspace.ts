import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { workspaceSchema } from "../../schemas/workspace.ts";

export const showWorkspaceBlock: AppBlock = {
  name: "Show Workspace",
  description: "Get detailed information about a specific workspace",
  category: "Workspaces",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description:
            "The ID of the workspace to retrieve (use this OR workspace name)",
          required: false,
        },
        workspaceName: {
          name: "Workspace Name",
          type: "string",
          description:
            "The name of the workspace to retrieve (use this OR workspace ID)",
          required: false,
        },
      },
      onEvent: async (input) => {
        const { workspaceId, workspaceName } = input.event.inputConfig;

        if (!workspaceId && !workspaceName) {
          throw new Error(
            "Either workspaceId or workspaceName must be provided",
          );
        }

        if (workspaceId && workspaceName) {
          throw new Error(
            "Provide either workspaceId or workspaceName, not both",
          );
        }

        // Choose endpoint based on input
        const endpoint = workspaceId
          ? `/workspaces/${workspaceId}`
          : `/organizations/${input.app.config.organization}/workspaces/${workspaceName}`;

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          endpoint,
        );

        const workspace = extractData(response);

        await events.emit({
          workspace,
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
          workspace: workspaceSchema,
        },
        required: ["workspace"],
      },
    },
  },
};
