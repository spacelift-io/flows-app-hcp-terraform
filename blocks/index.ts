import { listWorkspacesBlock } from "./workspaces/listWorkspaces.ts";
import { showWorkspaceBlock } from "./workspaces/showWorkspace.ts";
import { createWorkspaceBlock } from "./workspaces/createWorkspace.ts";
import { updateWorkspaceBlock } from "./workspaces/updateWorkspace.ts";
import { deleteWorkspaceBlock } from "./workspaces/deleteWorkspace.ts";
import { lockWorkspaceBlock } from "./workspaces/lockWorkspace.ts";
import { unlockWorkspaceBlock } from "./workspaces/unlockWorkspace.ts";
import { currentStateVersionBlock } from "./workspaces/showCurrentStateVersion.ts";
import { listProjectsBlock } from "./projects/listProjects.ts";
import { createProjectBlock } from "./projects/createProject.ts";
import { showProjectBlock } from "./projects/showProject.ts";
import { updateProjectBlock } from "./projects/updateProject.ts";
import { deleteProjectBlock } from "./projects/deleteProject.ts";
import { createRunBlock } from "./runs/createRun.ts";
import { showRunBlock } from "./runs/showRun.ts";
import { applyRunBlock } from "./runs/applyRun.ts";
import { showPlanBlock } from "./runs/showPlan.ts";
import { discardRunBlock } from "./runs/discardRun.ts";
import { cancelRunBlock } from "./runs/cancelRun.ts";
import { listRunsInWorkspaceBlock } from "./runs/listRunsInWorkspace.ts";
import { showApplyBlock } from "./runs/showApply.ts";
import { listStateVersionOutputsBlock } from "./state/listStateVersionOutputs.ts";
import { showCurrentStateOutputsBlock } from "./state/showCurrentStateOutputs.ts";
import { listWorkspaceResourcesBlock } from "./state/listWorkspaceResources.ts";
import { createVariableBlock } from "./variables/createVariable.ts";
import { listVariablesBlock } from "./variables/listVariables.ts";
import { updateVariableBlock } from "./variables/updateVariable.ts";
import { deleteVariableBlock } from "./variables/deleteVariable.ts";
import { createConfigurationVersionBlock } from "./configuration/createConfigurationVersion.ts";
import { uploadConfigurationFilesBlock } from "./configuration/uploadConfigurationFiles.ts";
import { createVariableSetBlock } from "./variableSets/createVariableSet.ts";
import { updateVariableSetBlock } from "./variableSets/updateVariableSet.ts";
import { listVariableSetsBlock } from "./variableSets/listVariableSets.ts";
import { showVariableSetBlock } from "./variableSets/showVariableSet.ts";
import { deleteVariableSetBlock } from "./variableSets/deleteVariableSet.ts";
import { addVariableToVariableSetBlock } from "./variableSets/addVariableToVariableSet.ts";
import { updateVariableInVariableSetBlock } from "./variableSets/updateVariableInVariableSet.ts";
import { deleteVariableFromVariableSetBlock } from "./variableSets/deleteVariableFromVariableSet.ts";
import { listVariablesInVariableSetBlock } from "./variableSets/listVariablesInVariableSet.ts";

export const blocks = {
  listWorkspaces: listWorkspacesBlock,
  showWorkspace: showWorkspaceBlock,
  createWorkspace: createWorkspaceBlock,
  updateWorkspace: updateWorkspaceBlock,
  deleteWorkspace: deleteWorkspaceBlock,
  lockWorkspace: lockWorkspaceBlock,
  unlockWorkspace: unlockWorkspaceBlock,
  currentStateVersion: currentStateVersionBlock,
  listProjects: listProjectsBlock,
  createProject: createProjectBlock,
  showProject: showProjectBlock,
  updateProject: updateProjectBlock,
  deleteProject: deleteProjectBlock,
  createRun: createRunBlock,
  showRun: showRunBlock,
  applyRun: applyRunBlock,
  showPlan: showPlanBlock,
  discardRun: discardRunBlock,
  cancelRun: cancelRunBlock,
  listRunsInWorkspace: listRunsInWorkspaceBlock,
  showApply: showApplyBlock,
  listStateVersionOutputs: listStateVersionOutputsBlock,
  showCurrentStateOutputs: showCurrentStateOutputsBlock,
  listWorkspaceResources: listWorkspaceResourcesBlock,
  createVariable: createVariableBlock,
  listVariables: listVariablesBlock,
  updateVariable: updateVariableBlock,
  deleteVariable: deleteVariableBlock,
  createConfigurationVersion: createConfigurationVersionBlock,
  uploadConfigurationFiles: uploadConfigurationFilesBlock,
  createVariableSet: createVariableSetBlock,
  updateVariableSet: updateVariableSetBlock,
  listVariableSets: listVariableSetsBlock,
  showVariableSet: showVariableSetBlock,
  deleteVariableSet: deleteVariableSetBlock,
  addVariableToVariableSet: addVariableToVariableSetBlock,
  updateVariableInVariableSet: updateVariableInVariableSetBlock,
  deleteVariableFromVariableSet: deleteVariableFromVariableSetBlock,
  listVariablesInVariableSet: listVariablesInVariableSetBlock,
};
