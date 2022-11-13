import { CompletionItem, CompletionItemKind, Uri } from "vscode";
import { readFile } from "fs";
import { Media, parse as cssParse, Rule, stringify, Stylesheet } from "css";

async function readFileAsString(file: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    readFile(file, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.toString());
    });
  });
}

export class CssClassDefinition {
  constructor(
    public className: string,
    public meta: Partial<CompletionItem> = {}
  ) {}
}

const CLASSNAME_REGEX = /[.]([\w-]+)/g;
const HEX_REGEX = /#([a-fA-F\d]{6}|[a-fA-F\d]{3})/;

export const parseCssFile = async (uri: Uri) => {
  const text = await readFileAsString(uri.fsPath);
  const codeAst: Stylesheet = cssParse(text);
  const definitions: CssClassDefinition[] = [];

  codeAst.stylesheet?.rules.forEach((rule: Rule & Media) => {
    const addRule = (rule: Rule) => {
      rule.selectors?.forEach((selector: string) => {
        let item: RegExpExecArray | null = CLASSNAME_REGEX.exec(selector);
        while (item) {
          const sourceCss = stringify({
            stylesheet: {
              rules: [rule],
            },
          });
          const isColorToken = /color/.test(item[1]);

          definitions.push(
            new CssClassDefinition(item[1], {
              kind: isColorToken
                ? CompletionItemKind.Color
                : CompletionItemKind.Variable,
              detail: isColorToken
                ? (sourceCss.match(HEX_REGEX) || [])[0]
                : sourceCss,
              documentation: sourceCss,
            })
          );
          item = CLASSNAME_REGEX.exec(selector);
        }
      });
    };

    // ...of type rule
    if (rule.type === "rule") {
      addRule(rule);
    }
    // of type media queries
    if (rule.type === "media") {
      // go through rules inside media queries
      rule.rules?.forEach((rule: Rule) => addRule(rule));
    }
  });

  return definitions;
};

export const parseCssFiles = async (uris: Uri[]) => {
  return (await Promise.all(uris.map((uri) => parseCssFile(uri)))).flat(2);
};
