import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";

export const cancelRunBlock: AppBlock = {
  name: "Cancel Run",
  description: "Cancel a run that is currently planning or applying",
  category: "Runs",

  inputs: {
    default: {
      config: {
        runId: {
          name: "Run ID",
          type: "string",
          description: "ID of the run to cancel",
          required: true,
        },
        force: {
          name: "Force Cancel",
          type: "boolean",
          description:
            "Force cancel the run immediately (admin only, dangerous)",
          default: false,
          required: false,
        },
        comment: {
          name: "Comment",
          type: "string",
          description: "Optional explanation for why the run was canceled",
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { runId, force, comment } = inputConfig;

        const endpoint = force
          ? `/runs/${runId}/actions/force-cancel`
          : `/runs/${runId}/actions/cancel`;

        const payload = comment ? { comment } : {};

        await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          endpoint,
          {
            method: "POST",
            body: Object.keys(payload).length > 0 ? payload : undefined,
          },
        );

        await events.emit({
          runId,
          force: force || false,
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
          runId: { type: "string" },
          force: { type: "boolean" },
          comment: { type: "string" },
        },
        required: ["runId", "force"],
      },
    },
  },
};
