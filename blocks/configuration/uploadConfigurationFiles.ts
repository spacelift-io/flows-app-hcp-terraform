import { AppBlock, events } from "@slflows/sdk/v1";

export const uploadConfigurationFilesBlock: AppBlock = {
  name: "Upload Configuration Files",
  description:
    "Upload Terraform configuration files to a configuration version",
  category: "Configuration",

  inputs: {
    default: {
      config: {
        uploadUrl: {
          name: "Upload URL",
          type: "string",
          description:
            "The upload URL from the configuration version creation response",
          required: true,
        },
        configurationFiles: {
          name: "Configuration Files",
          type: "string",
          description:
            "Base64-encoded tar.gz archive of Terraform configuration files",
          required: true,
          sensitive: true,
        },
      },
      onEvent: async (input) => {
        const { uploadUrl, configurationFiles } = input.event.inputConfig;

        // Decode the base64-encoded configuration files
        const fileBuffer = Buffer.from(configurationFiles, "base64");

        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: fileBuffer,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to upload configuration files: ${response.status} ${response.statusText}`,
          );
        }

        await events.emit({ uploadedSize: fileBuffer.length });
      },
    },
  },

  outputs: {
    default: {
      default: true,
      type: {
        type: "object",
        properties: {
          uploadedSize: {
            type: "number",
            description: "Size of uploaded data in bytes",
          },
        },
        required: ["uploadedSize"],
      },
    },
  },
};
