import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { runSchema } from "../../schemas/run.ts";

export const showRunBlock: AppBlock = {
  name: "Show Run",
  description: "Get details of a specific run",
  category: "Runs",

  inputs: {
    default: {
      config: {
        runId: {
          name: "Run ID",
          type: "string",
          description: "ID of the run to show",
          required: true,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { runId } = inputConfig;

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/runs/${runId}`,
          {
            method: "GET",
          },
        );

        await events.emit({ run: extractData(response) });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: { run: runSchema },
        required: ["run"],
      },
    },
  },
};
