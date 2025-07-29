import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSetSchema } from "../../schemas/variableSet.ts";

export const updateVariableSetBlock: AppBlock = {
  name: "Update Variable Set",
  description: "Update an existing variable set",
  category: "Variable Sets",

  inputs: {
    default: {
      config: {
        variableSetId: {
          name: "Variable Set ID",
          type: "string",
          description: "The ID of the variable set to update",
          required: true,
        },
        name: {
          name: "Variable Set Name",
          type: "string",
          description: "The name of the variable set",
          required: false,
        },
        description: {
          name: "Description",
          type: "string",
          description:
            "Text displayed in the UI to contextualize the variable set",
          required: false,
        },
        global: {
          name: "Global",
          type: "boolean",
          description:
            "When true, automatically applies to all current and future workspaces",
          required: false,
        },
        priority: {
          name: "Priority",
          type: "boolean",
          description:
            "When true, variables override any other values with more specific scope",
          required: false,
        },
        workspaceIds: {
          name: "Workspace IDs",
          type: ["string"],
          description:
            "Array of workspace IDs to assign the variable set to (empty array clears assignments)",
          required: false,
        },
        projectIds: {
          name: "Project IDs",
          type: ["string"],
          description:
            "Array of project IDs to assign the variable set to (empty array clears assignments)",
          required: false,
        },
      },
      onEvent: async (input) => {
        const {
          variableSetId,
          name,
          description,
          global,
          priority,
          workspaceIds,
          projectIds,
        } = input.event.inputConfig;

        // Build the payload with only provided attributes
        const payload: any = {
          data: {
            type: "varsets",
            attributes: {},
            relationships: {},
          },
        };

        // Add attributes only if provided
        if (name !== undefined) payload.data.attributes.name = name;
        if (description !== undefined)
          payload.data.attributes.description = description;
        if (global !== undefined) payload.data.attributes.global = global;
        if (priority !== undefined) payload.data.attributes.priority = priority;

        // Add workspace relationships if provided
        if (workspaceIds !== undefined) {
          payload.data.relationships.workspaces = {
            data: workspaceIds.map((id: string) => ({
              id,
              type: "workspaces",
            })),
          };
        }

        // Add project relationships if provided
        if (projectIds !== undefined) {
          payload.data.relationships.projects = {
            data: projectIds.map((id: string) => ({
              id,
              type: "projects",
            })),
          };
        }

        // Remove empty objects
        if (Object.keys(payload.data.attributes).length === 0) {
          delete payload.data.attributes;
        }
        if (Object.keys(payload.data.relationships).length === 0) {
          delete payload.data.relationships;
        }

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/varsets/${variableSetId}`,
          {
            method: "PATCH",
            body: payload,
          },
        );

        await events.emit({ variableSet: extractData(response) });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: { variableSet: variableSetSchema },
        required: ["variableSet"],
      },
    },
  },
};
