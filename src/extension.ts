import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {parseLanguage, Language} from './language';

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


function splitAndRemoveEmptyLines(text:string) : Array<string> {
  return text.trim().split('\n').filter(l => l.trim() !== '');
}

function executeCode(code: string, languageId: string): Promise<string | null> {

  return new Promise(async (resolve, _) => {
    
    const lines = splitAndRemoveEmptyLines(code);

    if (lines.length === 0) {
      vscode.window.showErrorMessage(`No code selected`);
      return resolve(null);
    }

    const language = parseLanguage(languageId);

    if(language === null) {
      vscode.window.showErrorMessage(`Language "${languageId}" is not supported.`);
      return resolve(null);
    }

    let lastLine: string = lines.pop() || '';
    const commentIdx = lastLine.lastIndexOf(language.comment);
    if (commentIdx !== -1) {
        lastLine = lastLine.substring(0, commentIdx);
    }

    const wrappedLastLine = language.logCommand(lastLine);
    const wrappedCode = [...lines, wrappedLastLine].join('\n');

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-ext-'));
    const tempFile = path.join(tempDir, `venkat.${language.extension}`);

    fs.writeFileSync(tempFile, wrappedCode);

    const commandLine = language.command + ' ' + tempFile;

    cp.exec(commandLine, (error, stdout, stderr) => {
      let result : string;
      if (error) {
        result = error.message;
      } else {
        fs.rmSync(tempFile, { force: true });
        fs.rmdirSync(tempDir, { recursive: true });
        result = stdout || stderr;
      }
      const lines = splitAndRemoveEmptyLines(result);
      result = ((lines.length > 1) ? '\n':' ') + lines.map(l => language.comment + ' '+ l).join("\n");
      resolve(result);
    });
  });
}