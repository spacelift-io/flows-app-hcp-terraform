import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeHCPTerraformRequest,
  HCPTerraformConfig,
} from "../../utils/apiHelpers.ts";
import { extractData } from "../../utils/jsonapi.ts";
import { runSchema } from "../../schemas/run.ts";

export const createRunBlock: AppBlock = {
  name: "Create Run",
  description: "Create a new Terraform run (plan and apply)",
  category: "Runs",

  inputs: {
    default: {
      config: {
        workspaceId: {
          name: "Workspace ID",
          type: "string",
          description: "ID of the workspace to run in",
          required: true,
        },
        configurationVersionId: {
          name: "Configuration Version ID",
          type: "string",
          description:
            "Configuration version to use (optional - uses latest if not specified)",
          required: false,
        },
        message: {
          name: "Message",
          type: "string",
          description: "Message to associate with this run",
          default: "Queued manually via Flows",
          required: false,
        },
        autoApply: {
          name: "Auto Apply",
          type: "boolean",
          description: "Automatically apply if plan succeeds",
          required: false,
        },
        isDestroy: {
          name: "Is Destroy",
          type: "boolean",
          description: "Create a destroy plan",
          default: false,
          required: false,
        },
        refresh: {
          name: "Refresh State",
          type: "boolean",
          description: "Refresh state before planning",
          default: true,
          required: false,
        },
        refreshOnly: {
          name: "Refresh Only",
          type: "boolean",
          description: "Only refresh state, don't plan changes",
          default: false,
          required: false,
        },
        planOnly: {
          name: "Plan Only",
          type: "boolean",
          description: "Create a speculative plan that cannot be applied",
          default: false,
          required: false,
        },
        allowEmptyApply: {
          name: "Allow Empty Apply",
          type: "boolean",
          description: "Allow apply even when plan has no changes",
          default: false,
          required: false,
        },
        allowConfigGeneration: {
          name: "Allow Config Generation",
          type: "boolean",
          description:
            "Allow Terraform to generate resource configuration for imports",
          default: false,
          required: false,
        },
        debuggingMode: {
          name: "Debugging Mode",
          type: "boolean",
          description: "Enable verbose logging (TF_LOG=TRACE)",
          default: false,
          required: false,
        },
        savePlan: {
          name: "Save Plan",
          type: "boolean",
          description: "Execute as a save plan run",
          default: false,
          required: false,
        },
        terraformVersion: {
          name: "Terraform Version",
          type: "string",
          description:
            "Terraform version to use (only valid for plan-only runs)",
          required: false,
        },
        targetAddrs: {
          name: "Target Addresses",
          type: "string",
          description:
            "JSON array of resource addresses to target (e.g., '[\"aws_instance.example\"]')",
          required: false,
        },
        replaceAddrs: {
          name: "Replace Addresses",
          type: "string",
          description:
            "JSON array of resource addresses to replace (e.g., '[\"aws_instance.example\"]')",
          required: false,
        },
        variables: {
          name: "Run Variables",
          type: "string",
          description:
            'JSON array of run-specific variables (e.g., \'[{"key": "replicas", "value": "2"}]\')',
          required: false,
        },
      },
      onEvent: async (input) => {
        const inputConfig = input.event.inputConfig;
        const {
          workspaceId,
          configurationVersionId,
          message,
          autoApply,
          isDestroy,
          refresh,
          refreshOnly,
          planOnly,
          allowEmptyApply,
          allowConfigGeneration,
          debuggingMode,
          savePlan,
          terraformVersion,
          targetAddrs,
          replaceAddrs,
          variables,
        } = inputConfig;

        // Validate mutually exclusive options
        if (isDestroy && refreshOnly) {
          throw new Error("is-destroy and refresh-only are mutually exclusive");
        }

        // Build attributes
        const attributes: any = {
          message: message || "Queued manually via Flows",
        };

        if (autoApply !== undefined) attributes["auto-apply"] = autoApply;
        if (isDestroy !== undefined) attributes["is-destroy"] = isDestroy;
        if (refresh !== undefined) attributes.refresh = refresh;
        if (refreshOnly !== undefined) attributes["refresh-only"] = refreshOnly;
        if (planOnly !== undefined) attributes["plan-only"] = planOnly;
        if (allowEmptyApply !== undefined)
          attributes["allow-empty-apply"] = allowEmptyApply;
        if (allowConfigGeneration !== undefined)
          attributes["allow-config-generation"] = allowConfigGeneration;
        if (debuggingMode !== undefined)
          attributes["debugging-mode"] = debuggingMode;
        if (savePlan !== undefined) attributes["save-plan"] = savePlan;
        if (terraformVersion !== undefined)
          attributes["terraform-version"] = terraformVersion;

        // Parse JSON arrays
        if (targetAddrs) {
          try {
            attributes["target-addrs"] = JSON.parse(targetAddrs);
          } catch (error) {
            throw new Error("Invalid target addresses JSON format");
          }
        }

        if (replaceAddrs) {
          try {
            attributes["replace-addrs"] = JSON.parse(replaceAddrs);
          } catch (error) {
            throw new Error("Invalid replace addresses JSON format");
          }
        }

        if (variables) {
          try {
            attributes.variables = JSON.parse(variables);
          } catch (error) {
            throw new Error("Invalid variables JSON format");
          }
        }

        // Build relationships
        const relationships: any = {
          workspace: {
            data: {
              type: "workspaces",
              id: workspaceId,
            },
          },
        };

        if (configurationVersionId) {
          relationships["configuration-version"] = {
            data: {
              type: "configuration-versions",
              id: configurationVersionId,
            },
          };
        }

        const payload = {
          data: {
            type: "runs",
            attributes,
            relationships,
          },
        };

        const response = await makeHCPTerraformRequest(
          input.app.config as HCPTerraformConfig,
          `/runs`,
          {
            method: "POST",
            body: payload,
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
