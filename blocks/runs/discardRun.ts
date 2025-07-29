import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";

export const discardRunBlock: AppBlock = {
  name: "Discard Run",
  description: "Discard a run to reject/cancel a plan",
  category: "Runs",

  inputs: {
    default: {
      config: {
        runId: {
          name: "Run ID",
          type: "string",
          description: "ID of the run to discard",
          required: true,
        },
        comment: {
          name: "Comment",
          type: "string",
          description: "Optional comment about why the run is being discarded",
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { runId, comment } = inputConfig;

        const payload = comment ? { comment } : {};

        await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/runs/${runId}/actions/discard`,
          {
            method: "POST",
            body: Object.keys(payload).length > 0 ? payload : undefined,
          },
        );

        await events.emit({
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
          runId: { type: "string" },
          comment: { type: "string" },
        },
        required: ["runId"],
      },
    },
  },
};
