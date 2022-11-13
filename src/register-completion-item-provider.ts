import {
  CompletionItem,
  CompletionItemKind,
  languages,
  Position,
  Range,
  TextDocument,
} from "vscode";
import { CssClassDefinition } from "./parse-css-file";

const completionTriggerChars = ['"', "'", " ", "."];
const splitChar = " ";

export const registerCompletionProvider = (
  languageSelector: string,
  classMatchRegex: RegExp,
  completionList: CssClassDefinition[]
) =>
  languages.registerCompletionItemProvider(
    languageSelector,
    {
      provideCompletionItems(document: TextDocument, position: Position) {
        const start: Position = new Position(position.line, 0);
        const range: Range = new Range(start, position);
        const text: string = document.getText(range);

        // 检查光标是否在类属性上并检索该类属性中的所有 css 规则
        const rawClasses: RegExpMatchArray | null = text.match(classMatchRegex);
        if (!rawClasses || rawClasses.length === 1) {
          return [];
        }

        // 将存储在类属性上找到的类
        const classesOnAttribute = rawClasses[1].split(splitChar);

        const completionItems = completionList.map((completion) => {
          const completionItem = new CompletionItem(
            completion.className,
            CompletionItemKind.Variable
          );

          completionItem.kind = completion.meta.kind;
          completionItem.documentation = completion.meta.documentation;
          completionItem.detail = completion.meta.detail;
          completionItem.filterText = completion.className;
          completionItem.insertText = completion.className;

          return completionItem;
        });

        // 从集合中删除已在 class 属性上指定的类
        for (const classOnAttribute of classesOnAttribute) {
          for (let j = 0; j < completionItems.length; j++) {
            if (completionItems[j].insertText === classOnAttribute) {
              completionItems.splice(j, 1);
            }
          }
        }

        return completionItems;
      },
    },
    ...completionTriggerChars
  );
