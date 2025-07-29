import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { workspaceSchema } from "../../schemas/workspace.ts";
import {
  workspaceConfigFields,
  buildWorkspaceAttributes,
  buildWorkspaceRelationships,
} from "./shared.ts";

const {
  name,
  executionMode,
  autoApply,
  allowDestroyPlan,
  queueAllRuns,
  speculativeEnabled,
  globalRemoteState,
  fileTriggersEnabled,
  assessmentsEnabled,
  vcsIngressSubmodules,
  ...configFields
} = workspaceConfigFields;

export const createWorkspaceBlock: AppBlock = {
  name: "Create Workspace",
  description: "Create a new workspace in the organization",
  category: "Workspaces",

  inputs: {
    default: {
      config: {
        name: { ...name, required: true },
        executionMode: { ...executionMode, default: "remote" },
        autoApply: { ...autoApply, default: false },
        allowDestroyPlan: { ...allowDestroyPlan, default: true },
        queueAllRuns: { ...queueAllRuns, default: false },
        speculativeEnabled: { ...speculativeEnabled, default: true },
        globalRemoteState: { ...globalRemoteState, default: false },
        fileTriggersEnabled: { ...fileTriggersEnabled, default: true },
        assessmentsEnabled: { ...assessmentsEnabled, default: false },
        vcsIngressSubmodules: { ...vcsIngressSubmodules, default: false },
        ...configFields,
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;

        // Ensure name is provided (required for create)
        if (!inputConfig.name) {
          throw new Error("Workspace name is required for create operation");
        }

        // Build the request payload
        const payload: any = {
          data: {
            type: "workspaces",
            attributes: {
              ...buildWorkspaceAttributes(inputConfig, false),
              "source-url": input.app.installationUrl,
            },
          },
        };

        // Add relationships if needed
        const relationships = buildWorkspaceRelationships(inputConfig);
        if (Object.keys(relationships).length > 0) {
          payload.data.relationships = relationships;
        }

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/organizations/${input.app.config.organization}/workspaces`,
          {
            method: "POST",
            body: payload,
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
