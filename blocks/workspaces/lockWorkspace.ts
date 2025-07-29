import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { workspaceSchema } from "../../schemas/workspace.ts";

export const lockWorkspaceBlock: AppBlock = {
  name: "Lock Workspace",
  description: "Lock a workspace to prevent changes",
  category: "Workspaces",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "ID of the workspace to lock",
          required: true,
        },
        reason: {
          name: "Lock Reason",
          type: "string",
          description: "Reason for locking the workspace",
          default: "",
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { workspaceId, reason } = inputConfig;

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/workspaces/${workspaceId}/actions/lock`,
          {
            method: "POST",
            body: { reason },
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
