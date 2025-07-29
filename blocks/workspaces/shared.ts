import { AppBlockConfigField } from "@slflows/sdk/v1";

/**
 * Shared configuration fields for workspace blocks
 */
export const workspaceConfigFields: Record<string, AppBlockConfigField> = {
  // Core workspace attributes
  name: {
    name: "Workspace Name",
    type: "string",
    description: "Name of the workspace",
    required: false,
  },
  description: {
    name: "Description",
    type: "string",
    description: "Description for the workspace",
    required: false,
  },
  executionMode: {
    name: "Execution Mode",
    type: {
      type: "string",
      enum: ["remote", "local", "agent"],
    },
    description: "Execution mode",
    required: false,
  },
  terraformVersion: {
    name: "Terraform Version",
    type: "string",
    description:
      "Terraform version or constraint (e.g., '1.6.0' or '~> 1.6.0')",
    required: false,
  },
  workingDirectory: {
    name: "Working Directory",
    type: "string",
    description: "Relative path that Terraform will execute within",
    required: false,
  },
  autoApply: {
    name: "Auto Apply",
    type: "boolean",
    description: "Whether to automatically apply successful plans",
    required: false,
  },
  autoApplyRunTrigger: {
    name: "Auto Apply Run Trigger",
    type: "boolean",
    description: "Whether to automatically apply plans from run triggers",
    required: false,
  },
  allowDestroyPlan: {
    name: "Allow Destroy Plan",
    type: "boolean",
    description: "Whether destroy plans can be queued",
    required: false,
  },
  assessmentsEnabled: {
    name: "Assessments Enabled",
    type: "boolean",
    description: "Whether to enable health assessments (HCP Terraform Plus)",
    required: false,
  },
  autoDestroyAt: {
    name: "Auto Destroy At",
    type: "string",
    description: "Timestamp when next scheduled destroy run will occur",
    required: false,
  },
  autoDestroyActivityDuration: {
    name: "Auto Destroy Activity Duration",
    type: "string",
    description:
      "Duration for auto-destroy based on activity (e.g., '14d', '2h')",
    required: false,
  },
  queueAllRuns: {
    name: "Queue All Runs",
    type: "boolean",
    description: "Whether runs should be queued immediately",
    required: false,
  },
  speculativeEnabled: {
    name: "Speculative Enabled",
    type: "boolean",
    description: "Whether to allow automatic speculative plans",
    required: false,
  },
  globalRemoteState: {
    name: "Global Remote State",
    type: "boolean",
    description: "Whether all workspaces can access this workspace's state",
    required: false,
  },
  fileTriggersEnabled: {
    name: "File Triggers Enabled",
    type: "boolean",
    description: "Whether to filter runs based on changed files",
    required: false,
  },
  triggerPrefixes: {
    name: "Trigger Prefixes",
    type: ["string"],
    description: "List of paths to monitor for changes",
    required: false,
  },
  triggerPatterns: {
    name: "Trigger Patterns",
    type: ["string"],
    description: "List of glob patterns to monitor for changes",
    required: false,
  },
  agentPoolId: {
    name: "Agent Pool ID",
    type: "string",
    description: "Agent pool ID (required when execution mode is 'agent')",
    required: false,
  },
  // VCS Configuration
  vcsRepoIdentifier: {
    name: "VCS Repository Identifier",
    type: "string",
    description: "VCS repository in format :org/:repo",
    required: false,
  },
  vcsOauthTokenId: {
    name: "VCS OAuth Token ID",
    type: "string",
    description: "OAuth token ID for VCS connection",
    required: false,
  },
  vcsGithubAppInstallationId: {
    name: "VCS GitHub App Installation ID",
    type: "string",
    description: "GitHub App installation ID for VCS connection",
    required: false,
  },
  vcsBranch: {
    name: "VCS Branch",
    type: "string",
    description: "Repository branch to execute from",
    required: false,
  },
  vcsTagsRegex: {
    name: "VCS Tags Regex",
    type: "string",
    description: "Regular expression for matching Git tags",
    required: false,
  },
  vcsIngressSubmodules: {
    name: "VCS Ingress Submodules",
    type: "boolean",
    description: "Whether to fetch submodules when cloning",
    required: false,
  },
  // Project management
  projectId: {
    name: "Project ID",
    type: "string",
    description: "ID of the project to create/move workspace in/to",
    required: false,
  },
  // Tags
  tags: {
    name: "Tags",
    type: "string",
    description:
      'JSON object string for tags: \'{"env": "prod", "team": "backend"}\'',
    required: false,
  },
  // Setting overwrites
  settingOverwrites: {
    name: "Setting Overwrites",
    type: "string",
    description:
      "JSON object for setting overwrites: '{\"execution-mode\": false}'",
    required: false,
  },
};

/**
 * Parse and validate tags from JSON string
 */
export function parseWorkspaceTags(tags?: string) {
  if (!tags) return null;

  try {
    const parsedTags = JSON.parse(tags);
    if (typeof parsedTags === "object" && parsedTags !== null) {
      return Object.entries(parsedTags).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    }
    return null;
  } catch (error) {
    throw new Error(
      'Invalid tags JSON format. Expected object like: {"env": "prod", "team": "backend"}',
    );
  }
}

/**
 * Parse and validate setting overwrites from JSON string
 */
export function parseSettingOverwrites(settingOverwrites?: string) {
  if (!settingOverwrites) return null;

  try {
    return JSON.parse(settingOverwrites);
  } catch (error) {
    throw new Error(
      'Invalid setting overwrites JSON format. Expected object like: {"execution-mode": false}',
    );
  }
}

/**
 * Build VCS repository configuration object
 */
export function buildVcsRepoConfig(config: any, removeVcsRepo?: boolean) {
  const {
    vcsRepoIdentifier,
    vcsOauthTokenId,
    vcsGithubAppInstallationId,
    vcsBranch,
    vcsTagsRegex,
    vcsIngressSubmodules,
  } = config;

  if (removeVcsRepo) {
    return null;
  }

  if (!vcsRepoIdentifier) {
    return undefined;
  }

  const vcsRepo: any = {
    identifier: vcsRepoIdentifier,
  };

  if (vcsOauthTokenId) {
    vcsRepo["oauth-token-id"] = vcsOauthTokenId;
  }

  if (vcsGithubAppInstallationId) {
    vcsRepo["github-app-installation-id"] = vcsGithubAppInstallationId;
  }

  if (vcsBranch !== undefined) vcsRepo.branch = vcsBranch;
  if (vcsTagsRegex !== undefined) vcsRepo["tags-regex"] = vcsTagsRegex;
  if (vcsIngressSubmodules !== undefined)
    vcsRepo["ingress-submodules"] = vcsIngressSubmodules;

  return vcsRepo;
}

/**
 * Build workspace attributes object for API requests
 */
export function buildWorkspaceAttributes(config: any, isUpdate = false) {
  const {
    name,
    description,
    executionMode,
    terraformVersion,
    workingDirectory,
    autoApply,
    autoApplyRunTrigger,
    allowDestroyPlan,
    assessmentsEnabled,
    autoDestroyAt,
    autoDestroyActivityDuration,
    queueAllRuns,
    speculativeEnabled,
    globalRemoteState,
    fileTriggersEnabled,
    triggerPrefixes,
    triggerPatterns,
    agentPoolId,
    removeVcsRepo,
    settingOverwrites,
  } = config;

  const attributes: any = {};

  // For create, name is required; for update, it's optional
  if (name !== undefined) attributes.name = name;
  if (description !== undefined) attributes.description = description;
  if (executionMode !== undefined) attributes["execution-mode"] = executionMode;
  if (terraformVersion !== undefined)
    attributes["terraform-version"] = terraformVersion;
  if (workingDirectory !== undefined)
    attributes["working-directory"] = workingDirectory;
  if (autoApply !== undefined) attributes["auto-apply"] = autoApply;
  if (autoApplyRunTrigger !== undefined)
    attributes["auto-apply-run-trigger"] = autoApplyRunTrigger;
  if (allowDestroyPlan !== undefined)
    attributes["allow-destroy-plan"] = allowDestroyPlan;
  if (assessmentsEnabled !== undefined)
    attributes["assessments-enabled"] = assessmentsEnabled;
  if (autoDestroyAt !== undefined)
    attributes["auto-destroy-at"] = autoDestroyAt;
  if (autoDestroyActivityDuration !== undefined)
    attributes["auto-destroy-activity-duration"] = autoDestroyActivityDuration;
  if (queueAllRuns !== undefined) attributes["queue-all-runs"] = queueAllRuns;
  if (speculativeEnabled !== undefined)
    attributes["speculative-enabled"] = speculativeEnabled;
  if (globalRemoteState !== undefined)
    attributes["global-remote-state"] = globalRemoteState;
  if (fileTriggersEnabled !== undefined)
    attributes["file-triggers-enabled"] = fileTriggersEnabled;
  if (triggerPrefixes !== undefined)
    attributes["trigger-prefixes"] = triggerPrefixes;
  if (triggerPatterns !== undefined)
    attributes["trigger-patterns"] = triggerPatterns;
  if (agentPoolId !== undefined) attributes["agent-pool-id"] = agentPoolId;

  // Handle setting overwrites
  const settingOverwritesObj = parseSettingOverwrites(settingOverwrites);
  if (settingOverwritesObj !== null)
    attributes["setting-overwrites"] = settingOverwritesObj;

  // Handle VCS repo configuration
  const vcsRepoConfig = buildVcsRepoConfig(config, removeVcsRepo);
  if (vcsRepoConfig !== undefined) attributes["vcs-repo"] = vcsRepoConfig;

  // Add source information for create operations
  if (!isUpdate) {
    attributes["source-name"] = "Spacelift Flows";
  }

  return attributes;
}

/**
 * Build workspace relationships object for API requests
 */
export function buildWorkspaceRelationships(config: any) {
  const { projectId, tags } = config;
  const relationships: any = {};

  // Add project relationship
  if (projectId) {
    relationships.project = {
      data: {
        type: "projects",
        id: projectId,
      },
    };
  }

  // Add tag bindings
  const tagsArray = parseWorkspaceTags(tags);
  if (tagsArray && tagsArray.length > 0) {
    relationships["tag-bindings"] = {
      data: tagsArray.map((tag) => ({
        type: "tag-bindings",
        attributes: {
          key: tag.key,
          value: tag.value,
        },
      })),
    };
  }

  return relationships;
}
