import { commands, ExtensionContext } from "vscode";
import { getCssFiles } from "./get-css-file";
import { CssClassDefinition, parseCssFiles } from "./parse-css-file";
import { registerCompletionProvider } from "./register-completion-item-provider";

let completionList: CssClassDefinition[];
const loadCssToken = async () => {
  completionList = await parseCssFiles(await getCssFiles());
};

export async function activate(context: ExtensionContext) {
  await loadCssToken();

  const provider = registerCompletionProvider(
    "vue",
    /class=["|']([\w- ]*$)/,
    completionList
  );
  context.subscriptions.push(provider);

  // todo: reload plugins
  const reloadCommand = commands.registerCommand(
    "css-completion.reload",
    async () => {
      // await loadCssToken();
    }
  );
  context.subscriptions.push(reloadCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
