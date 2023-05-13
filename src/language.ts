export type Language = {
    logCommand: (lastLine: string) => string;
    command: string;
    extension: string;
    comment: string;
    append?: string
  };