import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";

export const deleteWorkspaceBlock: AppBlock = {
  name: "Delete Workspace",
  description:
    "Delete a workspace (safe delete by default, force delete optional)",
  category: "Workspaces",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "ID of the workspace to delete",
          required: false,
        },
        workspaceName: {
          name: "Workspace Name",
          type: "string",
          description: "Name of the workspace to delete (alternative to ID)",
          required: false,
        },
        force: {
          name: "Force Delete",
          type: "boolean",
          description:
            "Force delete the workspace even if it's managing resources",
          default: false,
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { workspaceId, workspaceName, force } = inputConfig;

        // Validate that either workspaceId or workspaceName is provided
        if (!workspaceId && !workspaceName) {
          throw new Error(
            "Either workspace ID or workspace name must be provided",
          );
        }

        if (workspaceId && workspaceName) {
          throw new Error(
            "Cannot specify both workspace ID and workspace name",
          );
        }

        const orgName = input.app.config.organization;
        let endpoint: string;
        let method: string;

        if (force) {
          // Force delete endpoints
          if (workspaceId) {
            endpoint = `/workspaces/${workspaceId}`;
          } else {
            endpoint = `/organizations/${orgName}/workspaces/${workspaceName}`;
          }
          method = "DELETE";
        } else {
          // Safe delete endpoints
          if (workspaceId) {
            endpoint = `/workspaces/${workspaceId}/actions/safe-delete`;
          } else {
            endpoint = `/organizations/${orgName}/workspaces/${workspaceName}/actions/safe-delete`;
          }
          method = "POST";
        }

        await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          endpoint,
          { method },
        );

        await events.emit({
          workspaceId: workspaceId || undefined,
          workspaceName: workspaceName || undefined,
          force,
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
          force: { type: "boolean" },
          workspaceId: { type: "string" },
          workspaceName: { type: "string" },
        },
        required: ["force"],
      },
    },
  },
};
