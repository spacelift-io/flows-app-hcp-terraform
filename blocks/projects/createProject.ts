import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { projectSchema } from "../../schemas/project.ts";

export const createProjectBlock: AppBlock = {
  name: "Create Project",
  description: "Create a new project in an organization",
  category: "Projects",

  inputs: {
    default: {
      config: {
        name: {
          name: "Project Name",
          type: "string",
          description:
            "The name of the project (3-40 characters, letters, numbers, spaces, -, _)",
          required: true,
        },
        description: {
          name: "Description",
          type: "string",
          description:
            "Optional description of the project (max 256 characters)",
          required: false,
        },
        autoDestroyActivityDuration: {
          name: "Auto Destroy Activity Duration",
          type: "string",
          description:
            "How long workspaces should wait before auto-destroying (e.g., '14d', '24h')",
          required: false,
        },
        tagBindings: {
          name: "Tag Bindings",
          description: "Array of tag objects with 'key' and 'value' properties",
          type: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                value: { type: "string" },
              },
              required: ["key", "value"],
            },
          },
          required: false,
        },
      },
      onEvent: async (input) => {
        const { name, description, autoDestroyActivityDuration, tagBindings } =
          input.event.inputConfig;

        const config = input.app.config as HCPTerraformConfig;
        const organizationName = config.organization;

        // Validate project name
        if (!name || name.length < 3 || name.length > 40) {
          throw new Error(
            "Project name must be between 3 and 40 characters long",
          );
        }

        // Validate description if provided
        if (description && description.length > 256) {
          throw new Error(
            "Project description must be no more than 256 characters long",
          );
        }

        // Build request body in JSON:API format
        const requestBody: any = {
          data: {
            type: "projects",
            attributes: {
              name: name.trim(),
            },
          },
        };

        // Add optional attributes
        if (description) {
          requestBody.data.attributes.description = description.trim();
        }

        if (autoDestroyActivityDuration) {
          requestBody.data.attributes["auto-destroy-activity-duration"] =
            autoDestroyActivityDuration;
        }

        // Add tag bindings if provided
        if (tagBindings && tagBindings.length > 0) {
          requestBody.data.relationships = {
            "tag-bindings": {
              data: tagBindings.map((tag: any) => ({
                type: "tag-bindings",
                attributes: {
                  key: tag.key,
                  value: tag.value,
                },
              })),
            },
          };
        }

        const response = await makeHCPTerraformRequest(
          config,
          `/organizations/${organizationName}/projects`,
          {
            method: "POST",
            body: requestBody,
          },
        );

        await events.emit({ project: extractData(response) });
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
