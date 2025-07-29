import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { projectSchema } from "../../schemas/project.ts";

export const showProjectBlock: AppBlock = {
  name: "Show Project",
  description: "Get details of a specific project by ID",
  category: "Projects",

  inputs: {
    default: {
      config: {
        projectId: {
          name: "Project ID",
          type: "string",
          description:
            "The ID of the project to retrieve (e.g., prj-WsVcWRr7SfxRci1v)",
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

        const response = await makeHCPTerraformRequest(
          config,
          `/projects/${projectId}`,
        );

        const project = extractData(response);

        await events.emit({
          project,
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
          project: projectSchema,
        },
        required: ["project"],
      },
    },
  },
};
