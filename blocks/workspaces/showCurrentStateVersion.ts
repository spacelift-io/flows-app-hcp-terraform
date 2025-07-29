import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { stateVersionSchema } from "../../schemas/stateVersion.ts";

export const currentStateVersionBlock: AppBlock = {
  name: "Current State Version",
  description:
    "Get the current state version for a workspace, showing if workspace has state and when it was last updated",
  category: "Workspaces",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "ID of the workspace to get current state version for",
          required: true,
        },
        includeOutputs: {
          name: "Include Outputs",
          type: "boolean",
          description: "Include state version outputs in the response",
          required: false,
          default: false,
        },
      },
      onEvent: async (input) => {
        const { workspaceId, includeOutputs } = input.event.inputConfig;

        // Build query parameters
        const queryParams: Record<string, any> = {};

        if (includeOutputs) {
          queryParams.include = "outputs";
        }

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/workspaces/${workspaceId}/current-state-version`,
          { queryParams },
        );

        const stateVersion = extractData(response);

        await events.emit({
          stateVersion,
          hasState: !!stateVersion,
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
          stateVersion: stateVersionSchema,
          hasState: { type: "boolean" },
        },
        required: ["hasState"],
      },
    },
  },
};
