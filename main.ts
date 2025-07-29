import { defineApp } from "@slflows/sdk/v1";
import { blocks } from "./blocks/index.ts";

export const app = defineApp({
  name: "HCP Terraform",

  config: {
    organization: {
      name: "Organization Name",
      type: "string",
      description: "Your HCP Terraform organization name",
      required: true,
    },

    apiToken: {
      name: "API Token",
      type: "string",
      description: "HCP Terraform API token with appropriate permissions",
      required: true,
      sensitive: true,
    },

    apiEndpoint: {
      name: "API Endpoint",
      type: "string",
      description:
        "HCP Terraform API endpoint (defaults to https://app.terraform.io/api/v2)",
      required: false,
      default: "https://app.terraform.io/api/v2",
    },
  },

  blocks: {
    ...blocks,
  },
});
