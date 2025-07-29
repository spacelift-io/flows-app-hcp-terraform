import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { workspaceSchema } from "../../schemas/workspace.ts";
import {
  workspaceConfigFields,
  buildWorkspaceAttributes,
  buildWorkspaceRelationships,
} from "./shared.ts";

const { name, ...configFields } = workspaceConfigFields;

export const updateWorkspaceBlock: AppBlock = {
  name: "Update Workspace",
  description: "Update an existing workspace",
  category: "Workspaces",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "ID of the workspace to update",
          required: true,
        },
        workspaceName: {
          name: "Workspace Name (Alternative)",
          type: "string",
          description:
            "Name of workspace to update (alternative to workspace ID)",
          required: false,
        },
        // Update name field description for update operation
        name: {
          ...name,
          name: "New Workspace Name",
          description:
            "New name for the workspace (letters, numbers, -, and _ only)",
        },
        // To delete VCS repo configuration
        removeVcsRepo: {
          name: "Remove VCS Repository",
          type: "boolean",
          description:
            "Set to true to remove existing VCS repository configuration",
          required: false,
          default: false,
        },
        // Include all other fields from shared config
        ...configFields,
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { workspaceId, workspaceName, removeVcsRepo } = inputConfig;

        // Validate workspace identifier
        if (!workspaceId && !workspaceName) {
          throw new Error(
            "Either workspace ID or workspace name must be provided",
          );
        }

        // Build the request payload
        const payload: any = {
          data: {
            type: "workspaces",
            attributes: buildWorkspaceAttributes(
              { ...inputConfig, removeVcsRepo },
              true,
            ),
          },
        };

        // Add relationships if needed
        const relationships = buildWorkspaceRelationships(inputConfig);
        if (Object.keys(relationships).length > 0) {
          payload.data.relationships = relationships;
        }

        // Determine the endpoint based on whether we have workspace ID or name
        let endpoint: string;
        if (workspaceId) {
          endpoint = `/workspaces/${workspaceId}`;
        } else {
          endpoint = `/organizations/${input.app.config.organization}/workspaces/${workspaceName}`;
        }

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          endpoint,
          {
            method: "PATCH",
            body: payload,
          },
        );

        await events.emit({ workspace: extractData(response) });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: { workspace: workspaceSchema },
        required: ["workspace"],
      },
    },
  },
};
