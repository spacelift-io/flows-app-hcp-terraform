import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";

export const applyRunBlock: AppBlock = {
  name: "Apply Run",
  description: "Apply a run that is paused waiting for confirmation",
  category: "Runs",

  inputs: {
    default: {
      config: {
        runId: {
          name: "Run ID",
          type: "string",
          description: "ID of the run to apply",
          required: true,
        },
        comment: {
          name: "Comment",
          type: "string",
          description: "Optional comment about the run",
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { runId, comment } = inputConfig;

        const payload = comment ? { comment } : {};

        await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/runs/${runId}/actions/apply`,
          {
            method: "POST",
            body: Object.keys(payload).length > 0 ? payload : undefined,
          },
        );

        await events.emit({
          success: true,
          runId,
          comment: comment || undefined,
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
          success: { type: "boolean" },
          runId: { type: "string" },
          comment: { type: "string" },
        },
        required: ["success", "runId"],
      },
    },
  },
};
