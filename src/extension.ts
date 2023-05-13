import * as vscode from 'vscode';
import { executeCode } from './execution';
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('venkat.run', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const startPos = new vscode.Position(0, 0);
    const position = editor.selection.active;
    const endOfLine = document.lineAt(position.line).range.end;

    const codeRange = new vscode.Range(startPos, endOfLine);
    const code = document.getText(codeRange);


    const languageId = document.languageId;
    try {
      const result = await executeCode(code, languageId);

      if (result) {
        const position = document.lineAt(editor.selection.active.line).range.end;

        editor.edit((editBuilder) => {
          editBuilder.insert(position, result);
        });

        const newSelection = new vscode.Selection(position, position.translate(0, (result).length));
        editor.selection = newSelection;
      }
    } catch (err) {
        const message : string = (err instanceof Error) ? err.message : new String(err).toString();
        vscode.window.showErrorMessage(message);
    }
  });

  context.subscriptions.push(disposable);
}


