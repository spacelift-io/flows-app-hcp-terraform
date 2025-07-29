import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { projectSchema } from "../../schemas/project.ts";

export const updateProjectBlock: AppBlock = {
  name: "Update Project",
  description: "Update an existing project's settings",
  category: "Projects",

  inputs: {
    default: {
      config: {
        projectId: {
          name: "Project ID",
          type: "string",
          description:
            "The ID of the project to update (e.g., prj-WsVcWRr7SfxRci1v)",
          required: true,
        },
        name: {
          name: "Project Name",
          type: "string",
          description:
            "New name for the project (3-40 characters, letters, numbers, spaces, -, _)",
          required: false,
        },
        description: {
          name: "Description",
          type: "string",
          description: "New description for the project (max 256 characters)",
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
        const {
          projectId,
          name,
          description,
          autoDestroyActivityDuration,
          tagBindings,
        } = input.event.inputConfig;

        const config = input.app.config as HCPTerraformConfig;

        // Validate project ID format
        if (!projectId || !projectId.startsWith("prj-")) {
          throw new Error("Project ID must be provided and start with 'prj-'");
        }

        // Validate name if provided
        if (name !== undefined) {
          if (!name || name.length < 3 || name.length > 40) {
            throw new Error(
              "Project name must be between 3 and 40 characters long",
            );
          }
        }

        // Validate description if provided
        if (description !== undefined && description.length > 256) {
          throw new Error(
            "Project description must be no more than 256 characters long",
          );
        }

        // Build request body in JSON:API format
        const requestBody: any = {
          data: {
            type: "projects",
            attributes: {},
          },
        };

        // Add attributes that are being updated
        if (name !== undefined) {
          requestBody.data.attributes.name = name.trim();
        }

        if (description !== undefined) {
          requestBody.data.attributes.description = description.trim();
        }

        if (autoDestroyActivityDuration !== undefined) {
          requestBody.data.attributes["auto-destroy-activity-duration"] =
            autoDestroyActivityDuration;
        }

        // Add tag bindings if provided
        if (tagBindings !== undefined) {
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
          `/projects/${projectId}`,
          {
            method: "PATCH",
            body: requestBody,
          },
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
