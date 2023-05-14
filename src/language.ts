import exp = require("constants");

export type Language = {
    output: string;
    executable: string;
    extension: string;
    comment: string;
    exit: string | undefined;
  };

let languages : {[key:string] : Language} = {};

export function loadLanguages(config: {[key:string] : {[key:string]:string}} | undefined) {
  if (config === undefined) {return;}
  for (let lang in config) {
      const { extension, comment, output, executable, exit } = config[lang];
      languages[lang] = { extension, comment,executable, output, exit } as Language
  }
  console.log(config);
  console.log(languages);
}
export function printExpression(output:string, expression:string) : string {
  const printPrefix = output.replace(/\$\{expression\}.*/,'');
  if (expression.indexOf(printPrefix) === -1) {
     return output.replace('${expression}',expression);
  }
  return expression;
}
export function parseLanguage(languageId: string) : Language | null {
    const res = languages[languageId];
    if (res !== undefined) {
      return res;
    }
    switch (languageId) {
      case 'python':
        return  {
          output: 'print(${expression})',
          executable: 'python',
          extension: 'py',
          comment: '#',
          exit: undefined
        };
      case 'javascript':
        return  {
          output: 'console.log(${expression});',
          executable: 'node',
          extension: 'js',
          comment: '//',
          exit: undefined

        };
      case 'typescript':
        return  {
          output: 'console.log(${expression});',
          executable: 'ts-node',
          extension: 'ts',
          comment: '//',
          exit: undefined
        };
      case 'ruby':
        return  {
          output: 'puts(${expression});',
          executable: 'ruby',
          extension: 'rb',
          comment: '#',
          exit: undefined
        };
      case 'java':
        return  {
          output: 'System.out.println(${expression});',
          executable: 'jshell -s',
          extension: 'java',
          comment: '//',
          exit: '/exit'
        };
      case 'kotlin':
        return  {
          output: 'println(${expression});',
          executable: 'kotlin',
          extension: 'kts',
          comment: '//',
          exit: undefined
        };
      case 'php':
        return  {
          output: 'print(${expression});',
          executable: 'php -f',
          extension: 'php',
          comment: '//',
          exit: '?>'
        };
      default:
        return null;
    }
  
  }
  