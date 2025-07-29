import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { stateVersionOutputSchema } from "../../schemas/stateVersionOutput.ts";

export const showCurrentStateOutputsBlock: AppBlock = {
  name: "Show Current State Outputs",
  description: "Get outputs from the current state version of a workspace",
  category: "State",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description:
            "The ID of the workspace to get current outputs from (e.g., ws-G4zM299PFbfc10E5)",
          required: true,
        },
      },
      onEvent: async (input) => {
        const { workspaceId } = input.event.inputConfig;

        const config = input.app.config as HCPTerraformConfig;

        // Validate workspace ID format
        if (!workspaceId || !workspaceId.startsWith("ws-")) {
          throw new Error("Workspace ID must be provided and start with 'ws-'");
        }

        try {
          const response = await makeHCPTerraformRequest(
            config,
            `/workspaces/${workspaceId}/current-state-version-outputs`,
          );

          const outputs = extractData(response);

          await events.emit({
            outputs,
          });
        } catch (error: any) {
          // Handle specific error cases
          if (error.status === 503) {
            throw new Error(
              "State version outputs are being processed and are not ready. Please retry the request.",
            );
          } else if (error.status === 404) {
            throw new Error(
              "State version outputs not found or you are not authorized to access them.",
            );
          } else {
            // Re-throw the original error if it's not one of the expected cases
            throw error;
          }
        }
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: {
          outputs: { type: "array", items: stateVersionOutputSchema },
        },
        required: ["outputs"],
      },
    },
  },
};
