import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {Language} from './language'

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



export function parseLanguage(languageId: string) : Language | null {
  switch (languageId) {
    case 'python':
      return  {
        logCommand: (lastLine: string) => `print(${lastLine})`,
        command: 'python',
        extension: 'py',
        comment: '#',
      };
    case 'javascript':
      return  {
        logCommand: (lastLine: string) => `console.log(${lastLine});`,
        command: 'node',
        extension: 'js',
        comment: '//',
      };
    case 'typescript':
      return  {
        logCommand: (lastLine: string) => `console.log(${lastLine});`,
        command: 'ts-node',
        extension: 'ts',
        comment: '//',
      };
    case 'ruby':
      return  {
        logCommand: (lastLine: string) => `puts(${lastLine});`,
        command: 'ruby',
        extension: 'rb',
        comment: '#',
      };
    case 'java':
      return  {
        logCommand: (lastLine: string) => `System.out.println(${lastLine});\n/exit\n`,
        command: 'jshell -s',
        extension: 'java',
        comment: '//',
      };
    case 'kotlin':
      return  {
        logCommand: (lastLine: string) => `println(${lastLine});`,
        command: 'kotlin',
        extension: 'kts',
        comment: '//',
      };
    case 'php':
      return  {
        logCommand: (lastLine: string) => `print(${lastLine});`,
        command: 'php -f',
        append: "?>",
        extension: 'php',
        comment: '//',
      };
    default:
      return null
  }

}

function executeCode(code: string, languageId: string): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    let command: string;
    let logCommand: (lastLine: string) => string;
    let tempDir: string;
    let tempFile: string;
    let comment: string;
    let append: string|undefined = '';
    let extension = languageId;
    const lines = code.split('\n');
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    if (lines.length == 0) {
      vscode.window.showErrorMessage(`No code selected`);
      return resolve(null);
    }

    const lastLine: string = lines.pop() || '';

    const language: Language | null = parseLanguage(languageId)

    if(language === null) {
      vscode.window.showErrorMessage(`Language "${languageId}" is not supported.`);
      return resolve(null);
    }

    logCommand = language.logCommand;
    command = language.command;
    comment = language.comment;
    extension = language.extension;
    append = language.append;

    // switch (languageId) {
    //   case 'python':
    //     logCommand = (lastLine) => `print(${lastLine})`;
    //     command = `python`;
    //     comment = '#';
    //     extension = 'py';
    //     break;
    //   case 'javascript':
    //     logCommand = (lastLine) => `console.log(${lastLine});`;
    //     command = `node`;
    //     comment = '//'
    //     extension = 'js';
    //     break;
    //   case 'typescript':
    //     logCommand = (lastLine) => `console.log(${lastLine});`;
    //     command = `ts-node`;
    //     comment = '//'
    //     extension = 'ts';
    //     break;
    //   case 'ruby':
    //     logCommand = (lastLine) => `puts(${lastLine});`;
    //     command = `ruby`;
    //     comment = '#'
    //     extension = 'rb';

    //     break;
    //   case 'java':
    //     logCommand = (lastLine) => `System.out.println(${lastLine});\n/exit\n`;
    //     command = `jshell -s`;
    //     comment = '//'
    //     break;
    //   case 'kotlin':
    //     logCommand = (lastLine) => `println(${lastLine});`;
    //     command = `kotlin`;
    //     comment = '//'
    //     extension = 'kts';
    //     break;
    //   case 'php':
    //     logCommand = (lastLine) => `print(${lastLine});`;
    //     append = '?>';
    //     command = `php -f`;
    //     comment = '//'
    //     break;
    //   default:
    //     vscode.window.showErrorMessage(`Language "${languageId}" is not supported.`);
    //     return resolve(null);
    // }
    const wrappedLastLine = logCommand(lastLine);
    const wrappedCode = [...lines, wrappedLastLine, append].join('\n');
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-ext-'));
    tempFile = path.join(tempDir, `venkat.${extension}`);
    fs.writeFileSync(tempFile, wrappedCode);
    command = command + ' ' + tempFile;

    cp.exec(command, (error, stdout, stderr) => {
      let result: string;
      if (error) {
        result = error.message;
      } else {
        fs.rmSync(tempFile, { force: true });
        fs.rmdirSync(tempDir, { recursive: true });
        result = stdout || stderr;
      }
      const lines = result.trim().split('\n');
      result = ((lines.length > 1) ? '\n' : ' ') + lines.filter(l => l.trim() !== '').map(l => comment + ' ' + l).join("\n");
      resolve(result);
    });
  });
}






