import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";

export const deleteProjectBlock: AppBlock = {
  name: "Delete Project",
  description:
    "Delete a project (project must be empty - no workspaces or stacks)",
  category: "Projects",

  inputs: {
    default: {
      config: {
        projectId: {
          name: "Project ID",
          type: "string",
          description:
            "The ID of the project to delete (e.g., prj-WsVcWRr7SfxRci1v)",
          required: true,
        },
      },
      onEvent: async (input) => {
        const { projectId } = input.event.inputConfig;

        const config = input.app.config as HCPTerraformConfig;

        // Validate project ID format
        if (!projectId || !projectId.startsWith("prj-")) {
          throw new Error("Project ID must be provided and start with 'prj-'");
        }

        try {
          await makeHCPTerraformRequest(config, `/projects/${projectId}`, {
            method: "DELETE",
          });

          await events.emit({ projectId });
        } catch (error: any) {
          // Handle specific error cases
          if (error.status === 403) {
            throw new Error(
              "Not authorized to delete this project. You may need force delete permissions.",
            );
          } else if (error.status === 404) {
            throw new Error(
              "Project not found or you are not authorized to delete it.",
            );
          } else if (
            error.message?.includes("workspaces") ||
            error.message?.includes("stacks")
          ) {
            throw new Error(
              "Cannot delete project: it still contains workspaces or stacks. Please remove all workspaces and stacks first.",
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
          projectId: { type: "string" },
        },
        required: ["projectId"],
      },
    },
  },
};
