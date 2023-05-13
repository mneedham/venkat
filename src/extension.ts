import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

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
    const result = await executeCode(code, languageId);

    if (result) {
      const position = document.lineAt(editor.selection.active.line).range.end;

      editor.edit((editBuilder) => {
        editBuilder.insert(position, result);
      });

      const newSelection = new vscode.Selection(position, position.translate(0, (result).length));
      editor.selection = newSelection;
    }
  });

  context.subscriptions.push(disposable);
}

function executeCode(code: string, languageId: string): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    let command: string;
    let logCommand: (lastLine:string) => string;
    let tempDir: string;
    let tempFile: string;
    let comment: string;
    const lines = code.split('\n');
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    if (lines.length == 0) {
      vscode.window.showErrorMessage(`No code selected`);
      return resolve(null);
    }

    const lastLine: string = lines.pop() || '';

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-ext-'));
    tempFile = path.join(tempDir, `venkat.${languageId}`);
    switch (languageId) {
      case 'python':
        logCommand = (lastLine) => `print(${lastLine})`;
        command = `python ${tempFile}`;
        comment = '#'
        break;
      case 'javascript':
          logCommand = (lastLine) => `console.log(${lastLine});`;
          command = `node ${tempFile}`;
          comment = '//'
          break;
      case 'ruby':
        logCommand = (lastLine) => `puts(${lastLine});`;
        command = `ruby ${tempFile}`;
        comment = '#'
        break;
      case 'java':
        logCommand = (lastLine) => `System.out.println(${lastLine});\n/exit\n`;
        command = `jshell -s ${tempFile}`;
        comment = '//'
        break;
      default:
        vscode.window.showErrorMessage(`Language "${languageId}" is not supported.`);
        return resolve(null);
    }
    const wrappedLastLine = logCommand(lastLine);
    const wrappedCode = [...lines, wrappedLastLine].join('\n');

    fs.writeFileSync(tempFile, wrappedCode);

    cp.exec(command, (error, stdout, stderr) => {
      fs.rmSync(tempFile, { force: true });
      fs.rmdirSync(tempDir, { recursive: true });
      let result : string;
      if (error) {
        const errorLines = error.message.split('\n');
        const lastErrorLine = errorLines.reverse().find((line:String) => line.trim() !== '');
        result = lastErrorLine || error.message;
      } else {
        result = stdout || stderr;
      }
      const lines = result.trim().split('\n');
      result = ((lines.length > 1) ? '\n':' ') + lines.map(l => comment + ' '+ l).join("\n");
      resolve(result);
    });
  });
}






