import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { variableSetSchema } from "../../schemas/variableSet.ts";

export const createVariableSetBlock: AppBlock = {
  name: "Create Variable Set",
  description:
    "Create a new variable set for reusing variables across workspaces",
  category: "Variable Sets",

  inputs: {
    default: {
      config: {
        name: {
          name: "Variable Set Name",
          type: "string",
          description: "The name of the variable set",
          required: true,
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
          default: false,
        },
        priority: {
          name: "Priority",
          type: "boolean",
          description:
            "When true, variables override any other values with more specific scope",
          required: false,
          default: false,
        },
        workspaceIds: {
          name: "Workspace IDs",
          type: ["string"],
          description: "Array of workspace IDs to assign the variable set to",
          required: false,
        },
        projectIds: {
          name: "Project IDs",
          type: ["string"],
          description: "Array of project IDs to assign the variable set to",
          required: false,
        },
        parentType: {
          name: "Parent Type",
          type: {
            type: "string",
            enum: ["organizations", "projects"],
          },
          description:
            "The resource type of the parent (organizations or projects)",
          required: false,
          default: "organizations",
        },
        parentId: {
          name: "Parent ID",
          type: "string",
          description:
            "The ID of the parent that owns the variable set (organization name or project ID)",
          required: false,
        },
      },
      onEvent: async (input) => {
        const {
          name,
          description,
          global,
          priority,
          workspaceIds,
          projectIds,
          parentType,
          parentId,
        } = input.event.inputConfig;
        const appConfig = input.app.config as HCPTerraformConfig;

        // Build the payload
        const payload: any = {
          data: {
            type: "varsets",
            attributes: {
              name,
              description: description || "",
              global: global || false,
              priority: priority || false,
            },
            relationships: {},
          },
        };

        // Add workspace relationships
        if (workspaceIds && workspaceIds.length > 0) {
          payload.data.relationships.workspaces = {
            data: workspaceIds.map((id: string) => ({
              id,
              type: "workspaces",
            })),
          };
        }

        // Add project relationships
        if (projectIds && projectIds.length > 0) {
          payload.data.relationships.projects = {
            data: projectIds.map((id: string) => ({
              id,
              type: "projects",
            })),
          };
        }

        // Add parent relationship
        if (parentType && parentId) {
          payload.data.relationships.parent = {
            data: {
              id: parentId,
              type: parentType,
            },
          };
        } else if (parentType === "organizations" || !parentType) {
          // Default to organization parent
          payload.data.relationships.parent = {
            data: {
              id: appConfig.organization,
              type: "organizations",
            },
          };
        }

        const response = await makeHCPTerraformRequest(
          appConfig,
          `/organizations/${appConfig.organization}/varsets`,
          {
            method: "POST",
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
