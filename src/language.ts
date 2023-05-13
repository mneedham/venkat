export type Language = {
    logCommand: (lastLine: string) => string;
    command: string;
    extension: string;
    comment: string;
    append?: string;
  };

export function parseLanguage(languageId: string) : Language | null {
    switch (languageId) {
      case 'python':
        return  {
          logCommand: (lastLine: string) => {
            const printPattern = /^\s*print\(.+\)/;
            return printPattern.test(lastLine) ? lastLine : `print(${lastLine})`;
          },
          command: 'python',
          extension: 'py',
          comment: '#',
        };
      case 'javascript':
        return  {
          logCommand: (lastLine: string) => {
            const consoleLogPattern = /^\s*console\.log\(.+\)/;
            return consoleLogPattern.test(lastLine) ? lastLine : `console.log(${lastLine});`;
          },
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
        return null;
    }
  
  }
  