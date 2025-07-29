import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { workspaceSchema } from "../../schemas/workspace.ts";

export const unlockWorkspaceBlock: AppBlock = {
  name: "Unlock Workspace",
  description: "Unlock a workspace to allow changes",
  category: "Workspaces",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "ID of the workspace to unlock",
          required: true,
        },
        force: {
          name: "Force Unlock",
          type: "boolean",
          description: "Force unlock the workspace (admin only)",
          default: false,
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { workspaceId, force } = inputConfig;

        const endpoint = force
          ? `/workspaces/${workspaceId}/actions/force-unlock`
          : `/workspaces/${workspaceId}/actions/unlock`;

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          endpoint,
          {
            method: "POST",
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
