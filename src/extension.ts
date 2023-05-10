import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.executeAndShowResult', async () => {
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
    const result = await executeCode(code, languageId);

    if (result) {
      const position = document.lineAt(editor.selection.active.line).range.end;

      editor.edit((editBuilder) => {
        editBuilder.insert(position, ' # ' + result);
      });

      const newSelection = new vscode.Selection(position, position.translate(0, (' # ' + result).length));
      editor.selection = newSelection;
    }
  });

  context.subscriptions.push(disposable);
}

function executeCode(code: string, languageId: string): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    let command: string;
    let tempDir: string;
    let tempFile: string;
    switch (languageId) {
      case 'python':
        const lines = code.split('\n');
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
          lines.pop();
        }
        const lastLine = lines.pop();
        const wrappedLastLine = `print(${lastLine})`;
        const wrappedCode = [...lines, wrappedLastLine].join('\n');

        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-ext-'));
        tempFile = path.join(tempDir, 'temp.py');
        console.log(tempFile)
        fs.writeFileSync(tempFile, wrappedCode);
        command = `python ${tempFile}`;
        break;
      // Add more languages here
      default:
        vscode.window.showErrorMessage(`Language "${languageId}" is not supported.`);
        return resolve(null);
    }

    cp.exec(command, (error, stdout, stderr) => {
      fs.rmSync(tempFile, { force: true });
      fs.rmdirSync(tempDir, { recursive: true });

      if (error) {
        const errorLines = error.message.split('\n');
        const lastErrorLine = errorLines.reverse().find(line => line.trim() !== '');
        resolve(lastErrorLine || error.message);
      } else {
        const result = (stdout || stderr).trim();
        resolve(result);
      }
    });
  });
}






