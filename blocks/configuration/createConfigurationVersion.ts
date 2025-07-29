import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { configurationVersionSchema } from "../../schemas/configurationVersion.ts";

export const createConfigurationVersionBlock: AppBlock = {
  name: "Create Configuration Version",
  description:
    "Create a new configuration version for uploading Terraform files",
  category: "Configuration",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description:
            "The ID of the workspace to create the configuration version in",
          required: true,
        },
        autoQueueRuns: {
          name: "Auto Queue Runs",
          type: "boolean",
          description:
            "When true, runs are queued automatically when the configuration version is uploaded",
          required: false,
          default: true,
        },
        speculative: {
          name: "Speculative",
          type: "boolean",
          description:
            "When true, this configuration version may only be used for speculative runs",
          required: false,
          default: false,
        },
        provisional: {
          name: "Provisional",
          type: "boolean",
          description:
            "When true, this configuration version does not immediately become the current version",
          required: false,
          default: false,
        },
      },
      onEvent: async (input) => {
        const { workspaceId, autoQueueRuns, speculative, provisional } =
          input.event.inputConfig;

        const payload = {
          data: {
            type: "configuration-versions",
            attributes: {
              "auto-queue-runs":
                autoQueueRuns !== undefined ? autoQueueRuns : true,
              speculative: speculative || false,
              provisional: provisional || false,
            },
          },
        };

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/workspaces/${workspaceId}/configuration-versions`,
          {
            method: "POST",
            body: payload,
          },
        );

        await events.emit({ configurationVersion: extractData(response) });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: { configurationVersion: configurationVersionSchema },
        required: ["configurationVersion"],
      },
    },
  },
};
