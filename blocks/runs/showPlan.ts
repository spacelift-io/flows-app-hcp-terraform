import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { planSchema } from "../../schemas/plan.ts";

export const showPlanBlock: AppBlock = {
  name: "Show Plan",
  description: "Get plan details and JSON execution plan download URL",
  category: "Runs",

  inputs: {
    default: {
      config: {
        planId: {
          name: "Plan ID",
          type: "string",
          description: "ID of the plan to show (from run relationships)",
          required: false,
        },
        runId: {
          name: "Run ID",
          type: "string",
          description:
            "ID of the run to get plan from (alternative to plan ID)",
          required: false,
        },
        includeJsonOutput: {
          name: "Include JSON Output URL",
          type: "boolean",
          description:
            "Generate temporary download URL for JSON execution plan",
          default: true,
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const { planId, runId, includeJsonOutput } = inputConfig;

        if (!planId && !runId) {
          throw new Error("Either plan ID or run ID must be provided");
        }

        if (planId && runId) {
          throw new Error("Cannot specify both plan ID and run ID");
        }

        // Get plan details
        const planEndpoint = planId
          ? `/plans/${planId}`
          : `/runs/${runId}/plan`;

        const planResponse = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          planEndpoint,
          {
            method: "GET",
          },
        );

        const planData = extractData(planResponse);
        let jsonOutputUrl: string | undefined;

        // Get JSON output URL if requested
        if (includeJsonOutput) {
          const config = input.app.config as HCPTerraformConfig;
          const jsonEndpoint = planId
            ? `/plans/${planId}/json-output`
            : `/runs/${runId}/plan/json-output`;

          const url = new URL(`${config.apiEndpoint}${jsonEndpoint}`);

          const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
              Authorization: `Bearer ${config.apiToken}`,
              "Content-Type": "application/vnd.api+json",
            },
            redirect: "manual",
          });

          const location = response.headers.get("location");

          if (response.status === 307 && location) {
            jsonOutputUrl = location!;
          }
        }

        await events.emit({
          plan: planData,
          jsonOutputUrl: jsonOutputUrl || undefined,
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
          plan: planSchema,
          jsonOutputUrl: { type: "string" },
        },
        required: ["plan"],
      },
    },
  },
};
