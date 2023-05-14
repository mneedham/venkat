import * as vscode from 'vscode';
import { executeCode } from './execution';

function getCode(editor: vscode.TextEditor) : string {
  const document = editor.document;
  const selection = editor.selection;
  if (selection.isEmpty) {
    const startPos = new vscode.Position(0, 0);
    const endOfLine = document.lineAt(selection.active.line).range.end;
    return document.getText(new vscode.Range(startPos, endOfLine));
  } else {
    return document.getText(selection);
  }

}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('venkat.run', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }    
    const code = getCode(editor)

    const document = editor.document;
    const languageId = document.languageId;
    try {
      const config = vscode.workspace.getConfiguration('venkat');
      const resultAsComment = config.get<boolean>('resultAsComment') ?? true;

      const result = await executeCode(code, languageId, resultAsComment);

      if (result) {
        if (resultAsComment) {          
          const position = document.lineAt(editor.selection.end).range.end;
          editor.edit((editBuilder) => editBuilder.insert(position, result));

          const newSelection = new vscode.Selection(position, position.translate(0, (result).length));
          editor.selection = newSelection;
        } else {
          vscode.window.showInformationMessage(result);
        }
      }
    } catch (err) {
        const message : string = (err instanceof Error) ? err.message : new String(err).toString();
        vscode.window.showErrorMessage(message);
    }
  });

  context.subscriptions.push(disposable);
}


