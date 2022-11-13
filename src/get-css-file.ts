import { workspace } from "vscode";

export const getCssFiles = async (
  includeGlobPattern = "**/*.{css}",
  excludeGlobPattern = ""
) => {
  return await workspace.findFiles(
    `${includeGlobPattern}`,
    `${excludeGlobPattern}`
  );
};
