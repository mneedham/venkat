import * as cp from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { parseLanguage, Language } from "./language";

function splitAndRemoveEmptyLines(text: string): Array<string> {
  return text
    .trim()
    .split("\n")
    .filter((l) => l.trim() !== "");
}

async function prepareCode(
  code: string,
  languageId: string
): Promise<[Language, string]> {
  return new Promise(async (resolve, reject) => {
    const lines = splitAndRemoveEmptyLines(code);

    if (lines.length === 0) {
      return reject(`No code selected`);
    }

    const language: Language | null = parseLanguage(languageId);

    if (language === null) {
      return reject(`Language "${languageId}" is not supported.`);
    }

    let lastLine: string = lines.pop() || "";
    const commentIdx = lastLine.lastIndexOf(language.comment);
    if (commentIdx !== -1) {
      lastLine = lastLine.substring(0, commentIdx);
    }

    const wrappedLastLine = language.logCommand(lastLine);
    const wrappedCode = [...lines, wrappedLastLine].join("\n");
    resolve([language, wrappedCode]);
  });
}

async function doExecuteCode(
  code: string,
  language: Language
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vscode-ext-"));
    const tempFile = path.join(tempDir, `venkat.${language.extension}`);

    fs.writeFileSync(tempFile, code);

    const commandLine = language.command + " " + tempFile;
    cp.exec(commandLine, (error, stdout, stderr) => {
      let result: string;
      if (error) {
        result = error.message;
      } else {
        result = stdout || stderr;
        fs.rmSync(tempFile, { force: true });
        fs.rmdirSync(tempDir, { recursive: true });
      }
      const lines = splitAndRemoveEmptyLines(result);
      result =
        (lines.length > 1 ? "\n" : " ") +
        lines.map((l) => language.comment + " " + l).join("\n");
      resolve(result);
    });
  });
}

export async function executeCode(
  code: string,
  languageId: string
): Promise<string> {
  const [language, preppedCode] = await prepareCode(code, languageId);
  return await doExecuteCode(preppedCode, language);
}
