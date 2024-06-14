export type TPID = string | number;

export type TCommandBase = string[];

export type TCommandBaseParseOutput = {
  command: TCommandBase,
  parseOutput: (...args: string[]) => any
}

export type TCommandFuncParseOutput = {
  command: (...args: any[]) => TCommandBase,
  parseOutput: (...args: string[]) => any
}

export type TCommandParseOutput = TCommandBaseParseOutput | TCommandFuncParseOutput;

export type TCommand = TCommandBase | TCommandParseOutput | ((...args: any[]) => TCommandBase | TCommandParseOutput);

export interface ICommands {
  taskkill: TCommand;
  taskInfo: TCommand;
  taskMemCPUInfo: TCommand;
}
