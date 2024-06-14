import { OSP } from "..";
import type { ICommands, TCommand, TCommandBase, TCommandParseOutput, TCommandFuncParseOutput, TCommandBaseParseOutput } from "./command-types";

export function defaultParseOutput(...args: string[]) {
  return args.join(" ").trim()
}

export function isFuncCommand(command: TCommand) {
  return typeof command === 'function';
}

export function isNormalCommand(command: TCommand) {
  return Array.isArray(command);
}

export function isCommandWithParseOutput(command: TCommand) {
  return typeof command === 'object' && 'parseOutput' in command && 'command' in command && typeof command.parseOutput === 'function';
}

export function isFuncCommandWithParseOutput(command: TCommand): command is TCommandFuncParseOutput {
  return typeof command === 'object' && 'parseOutput' in command && 'command' in command && typeof command.parseOutput === 'function' && typeof command.command === 'function';
}

export function isNormalCommandWithParseOutput(command: TCommand): command is TCommandBaseParseOutput {
  return typeof command === 'object' && 'parseOutput' in command && 'command' in command && typeof command.parseOutput === 'function' && Array.isArray(command.command)
}

export function handleFuncCommand(command: (...args: any[]) => (TCommandBase | TCommandParseOutput), ...args: string[]) {
  const handledCommand = command(...args);

  if (isNormalCommand(handledCommand)) {
    return {
      command: handledCommand,
      parseOutput: defaultParseOutput
    }
  }

  if (isNormalCommandWithParseOutput(handledCommand)) {
    return handledCommand
  }

  if (isFuncCommandWithParseOutput(handledCommand)) {
    return {
      command: handledCommand.command(...args),
      parseOutput: handledCommand.parseOutput
    }
  }

  return {
    command: handledCommand,
    parseOutput: defaultParseOutput
  }
}

export function getCommandInternal(commands: Record<NodeJS.Platform, ICommands>, commandType: keyof ICommands, ...args: string[]) {
  const command = commands[OSP][commandType];

  if (isNormalCommand(command)) {
    return {
      command: [...command, ...args],
      parseOutput: defaultParseOutput
    }
  }

  if (isFuncCommand(command)) {
    return handleFuncCommand(command, ...args)
  }

  if (isNormalCommandWithParseOutput(command)) {
    return command
  }

  if (isFuncCommandWithParseOutput(command)) {
    return {
      command: command.command(...args),
      parseOutput: command.parseOutput
    }
  }

  return {
    command: [...command, ...args],
    parseOutput: defaultParseOutput
  }
}
